const TMDB_IMAGE_BASE_URL =
  "https://image.tmdb.org/t/p/w300";

function GameResult({
  status,
  playerPath,
  onPlayAgain,
  onMainMenu,
}) {
  const won = status === "won";

  return (
    <section
      className={`game-result game-result--${status}`}
    >
      <div className="game-result__summary">
        <p className="game-result__eyebrow">
          {won ? "Connection complete" : "Game over"}
        </p>

        <h2 className="game-result__title">
          {won
            ? "You connected the actors!"
            : "You ran out of lives"}
        </h2>

        <p className="game-result__description">
          {won
            ? "Here is the route you discovered."
            : "The target actor was not connected before all three lives were lost."}
        </p>
      </div>

      {playerPath && playerPath.length > 0 && (
        <div className="result-path">
          {playerPath.map((node, index) => {
            const imagePath =
              node.image_path ??
              node.profile_path ??
              node.poster_path;

            const displayName =
              node.name ?? node.title;

            return (
              <div
                className="result-path__step"
                key={`${node.type}-${node.id}`}
              >
                <article
                  className={`result-path__card result-path__card--${node.type}`}
                >
                  {imagePath ? (
                    <img
                      className="result-path__image"
                      src={`${TMDB_IMAGE_BASE_URL}${imagePath}`}
                      alt={displayName}
                    />
                  ) : (
                    <div className="result-path__image result-path__placeholder">
                      No image
                    </div>
                  )}

                  <div className="result-path__content">
                    <span className="result-path__type">
                      {node.type === "actor"
                        ? "Actor"
                        : "Movie"}
                    </span>

                    <strong className="result-path__name">
                      {displayName}
                    </strong>
                  </div>
                </article>

                {index < playerPath.length - 1 && (
                  <div
                    className="result-path__connector"
                    aria-hidden="true"
                  >
                    <span />
                    <strong>→</strong>
                    <span />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="game-result__actions">
        <button
          className="primary-button game-result__button"
          type="button"
          onClick={onPlayAgain}
        >
          Play again
        </button>

        <button
          className="secondary-button game-result__button"
          type="button"
          onClick={onMainMenu}
        >
          Main menu
        </button>
      </div>
    </section>
  );
}

export default GameResult;