import Lives from "./Lives";

const TMDB_IMAGE_BASE_URL =
  "https://image.tmdb.org/t/p/w185";

function GameHeader({
  startActor,
  targetActor,
  lives,
  status,
  elapsedtime,
}) {
  return (
    <header className="game-header">
      <div className="game-header__top">
        <div>
          <p className="eyebrow">Current challenge</p>

          <h1 className="game-header__title">
            Connect the actors
          </h1>
        </div>

        <div className="game-header__status">
          <div className="game-timer">
            <span className="game-timer__label">
            Time
            </span>

            <strong className="game-timer__value"> 
              {elapsedtime}
            </strong>
          </div>
          
          <Lives lives={lives} />


          <span
            className={`status-badge status-badge--${status}`}
          >
            {status}
          </span>
          
        </div>
      </div>

      <div className="endpoint-route">
        <EndpointActor actor={startActor} label="Start" />

        <div
          className="endpoint-route__connection"
          aria-hidden="true"
        >
          <span />
          <strong>→</strong>
          <span />
        </div>

        <EndpointActor actor={targetActor} label="Target" />
      </div>
    </header>
  );
}

function EndpointActor({ actor, label }) {
  return (
    <article className="endpoint-actor">
      {actor.profile_path ? (
        <img
          className="endpoint-actor__image"
          src={`${TMDB_IMAGE_BASE_URL}${actor.profile_path}`}
          alt={actor.name}
        />
      ) : (
        <div className="endpoint-actor__image endpoint-actor__placeholder">
          ?
        </div>
      )}

      <div className="endpoint-actor__details">
        <span className="endpoint-actor__label">
          {label}
        </span>

        <strong className="endpoint-actor__name">
          {actor.name}
        </strong>
      </div>
    </article>
  );
}

export default GameHeader;