export default function HabitModal({
  habit,
  onClose,
}) {
  if (!habit) return null;

  return (
    <div
      className="modalOverlay"
      onClick={onClose}
    >
      <div
        className="glass modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="modalTop">
          <div>
            <h2>{habit.name}</h2>

            <p>{habit.category}</p>
          </div>

          <button
            className="deleteBtn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modalSection">
          <p className="modalLabel">
            Notes
          </p>

          <textarea
            value={
              habit.notes || ""
            }
            readOnly
          />
        </div>

        <div className="modalSection">
          <p className="modalLabel">
            Reminder
          </p>

          <div className="reminderBox">
            {habit.reminder ||
              "No reminder"}
          </div>
        </div>

        <div className="modalSection">
          <p className="modalLabel">
            Progress
          </p>

          <div className="calendarGrid">
            {Array.from({
              length: 30,
            }).map((_, i) => (
              <div
                key={i}
                className={`calendarCell ${
                  i <
                  habit.completedDays
                    .length
                    ? "active"
                    : ""
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}