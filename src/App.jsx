import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "void-habit-tracker-v2";
const categories = ["Discipline", "Body", "Mind", "Craft", "Recovery"];

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function createHabit(name, category) {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    category,
    notes: "",
    reminder: "",
    completedDays: [],
    createdAt: new Date().toISOString(),
  };
}

function getStreak(completedDays) {
  const done = new Set(completedDays);
  let streak = 0;
  const cursor = new Date();

  while (done.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getLastDays(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    return todayKey(date);
  });
}

function FocusTimer() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return undefined;

    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setRunning(false);
          return 25 * 60;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <section className="glass panel timerPanel">
      <div>
        <p className="eyebrow">Deep Work</p>
        <h2>{minutes}:{seconds}</h2>
      </div>

      <div className="timerControls" aria-label="Focus timer controls">
        <button type="button" onClick={() => setRunning((value) => !value)}>
          {running ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setSecondsLeft(25 * 60);
          }}
        >
          Reset
        </button>
      </div>
    </section>
  );
}

export default function App() {
  const [habits, setHabits] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [habitName, setHabitName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [selectedId, setSelectedId] = useState(null);
  const [detoxMode, setDetoxMode] = useState(false);
  const [clock, setClock] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const today = todayKey();
  const selectedHabit = habits.find((habit) => habit.id === selectedId);

  const stats = useMemo(() => {
    const completions = habits.reduce(
      (total, habit) => total + habit.completedDays.length,
      0,
    );
    const completedToday = habits.filter((habit) =>
      habit.completedDays.includes(today),
    ).length;
    const bestStreak = habits.reduce(
      (best, habit) => Math.max(best, getStreak(habit.completedDays)),
      0,
    );

    return {
      completions,
      completedToday,
      bestStreak,
      xp: completions * 10,
      level: Math.floor((completions * 10) / 100) + 1,
    };
  }, [habits, today]);

  const achievements = [
    {
      label: "First Signal",
      unlocked: habits.length > 0,
    },
    {
      label: "Hundred XP",
      unlocked: stats.xp >= 100,
    },
    {
      label: "Seven Day Lock",
      unlocked: stats.bestStreak >= 7,
    },
  ];

  function addHabit(event) {
    event.preventDefault();

    if (!habitName.trim()) return;

    setHabits((current) => [createHabit(habitName, category), ...current]);
    setHabitName("");
  }

  function completeHabit(id) {
    setHabits((current) =>
      current.map((habit) => {
        if (habit.id !== id || habit.completedDays.includes(today)) {
          return habit;
        }

        return {
          ...habit,
          completedDays: [...habit.completedDays, today],
        };
      }),
    );
  }

  function deleteHabit(id) {
    setHabits((current) => current.filter((habit) => habit.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function updateHabit(id, field, value) {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              [field]: value,
            }
          : habit,
      ),
    );
  }

  return (
    <main className={`app ${detoxMode ? "detox" : ""}`}>
      <div className="ambient" />

      <div className="shell">
        <header className="glass hero">
          <div>
            <p className="eyebrow">Level {stats.level} System</p>
            <h1>VOID</h1>
            <p className="heroCopy">Blackout discipline for daily execution.</p>
          </div>

          <div className="heroStack">
            <span className="clock">{clock}</span>
            <button
              className="ghostButton"
              type="button"
              onClick={() => setDetoxMode((value) => !value)}
            >
              {detoxMode ? "Full Mode" : "Detox"}
            </button>
          </div>
        </header>

        {!detoxMode && (
          <section className="statsGrid" aria-label="Habit statistics">
            <div className="glass statCard">
              <span>{stats.completedToday}/{habits.length || 0}</span>
              <p>Today</p>
            </div>
            <div className="glass statCard">
              <span>{stats.xp}</span>
              <p>Total XP</p>
            </div>
            <div className="glass statCard">
              <span>{stats.bestStreak}</span>
              <p>Best Streak</p>
            </div>
          </section>
        )}

        <form className="glass addPanel" onSubmit={addHabit}>
          <input
            aria-label="Habit name"
            placeholder="Add a disciplined habit"
            value={habitName}
            onChange={(event) => setHabitName(event.target.value)}
          />
          {!detoxMode && (
            <select
              aria-label="Habit category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          )}
          <button type="submit" aria-label="Add habit">
            +
          </button>
        </form>

        {!detoxMode && (
          <>
            <section className="achievementRail" aria-label="Achievements">
              {achievements.map((achievement) => (
                <div
                  className={`glass achievement ${
                    achievement.unlocked ? "unlocked" : ""
                  }`}
                  key={achievement.label}
                >
                  <span>{achievement.unlocked ? "Unlocked" : "Locked"}</span>
                  <strong>{achievement.label}</strong>
                </div>
              ))}
            </section>

            <FocusTimer />
          </>
        )}

        <section className="habitList" aria-label="Habits">
          {habits.length === 0 ? (
            <div className="glass emptyState">
              <p className="eyebrow">No Active Protocols</p>
              <h2>Start with one habit. Keep the streak alive.</h2>
            </div>
          ) : (
            habits.map((habit) => {
              const completed = habit.completedDays.includes(today);
              const streak = getStreak(habit.completedDays);

              return (
                <article
                  className={`glass habitCard ${completed ? "done" : ""}`}
                  key={habit.id}
                  onClick={() => setSelectedId(habit.id)}
                >
                  <div className="habitMain">
                    <div className="habitTitle">
                      <h2>{habit.name}</h2>
                      {!detoxMode && <span>{habit.category}</span>}
                    </div>

                    {!detoxMode && (
                      <div className="habitMeta">
                        <span>{streak} day streak</span>
                        <span>{habit.completedDays.length * 10} XP</span>
                        {habit.reminder && <span>{habit.reminder}</span>}
                      </div>
                    )}
                  </div>

                  <div
                    className="cardActions"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      className="completeButton"
                      type="button"
                      disabled={completed}
                      onClick={() => completeHabit(habit.id)}
                    >
                      {completed ? "Done" : "Mark"}
                    </button>
                    {!detoxMode && (
                      <button
                        className="iconButton"
                        type="button"
                        aria-label={`Delete ${habit.name}`}
                        onClick={() => deleteHabit(habit.id)}
                      >
                        x
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      {selectedHabit && (
        <div className="modalOverlay" onClick={() => setSelectedId(null)}>
          <section className="glass modal" onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader">
              <div>
                <p className="eyebrow">{selectedHabit.category}</p>
                <h2>{selectedHabit.name}</h2>
              </div>
              <button
                className="iconButton"
                type="button"
                aria-label="Close habit details"
                onClick={() => setSelectedId(null)}
              >
                x
              </button>
            </div>

            <label>
              Habit Name
              <input
                value={selectedHabit.name}
                onChange={(event) =>
                  updateHabit(selectedHabit.id, "name", event.target.value)
                }
              />
            </label>

            <label>
              Category
              <select
                value={selectedHabit.category}
                onChange={(event) =>
                  updateHabit(selectedHabit.id, "category", event.target.value)
                }
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Reminder
              <input
                type="time"
                value={selectedHabit.reminder}
                onChange={(event) =>
                  updateHabit(selectedHabit.id, "reminder", event.target.value)
                }
              />
            </label>

            <label>
              Notes
              <textarea
                value={selectedHabit.notes}
                onChange={(event) =>
                  updateHabit(selectedHabit.id, "notes", event.target.value)
                }
                placeholder="Rules, cues, and standards."
              />
            </label>

            <div className="calendarGrid" aria-label="Last 30 days">
              {getLastDays(30).map((day) => (
                <span
                  className={selectedHabit.completedDays.includes(day) ? "active" : ""}
                  key={day}
                  title={day}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
