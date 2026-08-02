function Lives({ lives, totalLives = 3 }) {
  return (
    <div
      className="lives"
      aria-label={`${lives} of ${totalLives} lives remaining`}
    >
      {Array.from({ length: totalLives }).map((_, index) => {
        const isActive = index < lives;

        return (
          <span
            key={index}
            className={
              isActive
                ? "life life--active"
                : "life life--lost"
            }
            aria-hidden="true"
          >
            ♥
          </span>
        );
      })}
    </div>
  );
}

export default Lives;