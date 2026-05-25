export default function HabitCard({
  habit,
  completed,
  onComplete,
  onDelete,
  onOpen,
}) {
  return (
    <div
      className={`habitCard glass ${
        completed ? "done" : ""
      }`}
      onClick={() => onOpen(habit)}
    >
      <div className="habitInfo">
        <div className="titleRow">
          <h3>{habit.name}</h3>

          <span className="chip">
            {habit.category}
          </span>
        </div>

        <div className="metaRow">
          <span>
            Streak {habit.streak || 0}
          </span>

          <span>
            XP {habit.xp}
          </span>
        </div>
      </div>

      <div
        className="actions"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <button
          className="completeBtn"
          disabled={completed}
          onClick={() =>
            onComplete(habit.id)
          }
        >
          {completed ? "✓" : "○"}
        </button>

        <button
          className="deleteBtn"
          onClick={() =>
            onDelete(habit.id)
          }
        >
          ×
        </button>
      </div>
    </div>
  );
}