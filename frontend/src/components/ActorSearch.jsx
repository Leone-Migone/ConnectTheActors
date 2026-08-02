import { useState } from "react";
import { searchActors } from "../api";

const TMDB_IMAGE_BASE_URL =
  "https://image.tmdb.org/t/p/w185";

function ActorSearch({
  label,
  selectedActor,
  onSelect,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const actors = await searchActors(query);
      setResults(actors.slice(0, 5));
    } catch {
      setError("Could not search for actors.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectActor(actor) {
    onSelect(actor);
    setResults([]);
    setQuery("");
    setError("");
  }

  function handleChangeActor() {
    onSelect(null);
    setResults([]);
    setQuery("");
    setError("");
  }

  return (
    <section className="actor-search">
      <h3 className="actor-search__label">
        {label}
      </h3>

      {selectedActor ? (
        <div className="selected-actor">
          {selectedActor.profile_path ? (
            <img
              className="selected-actor__image"
              src={`${TMDB_IMAGE_BASE_URL}${selectedActor.profile_path}`}
              alt={selectedActor.name}
            />
          ) : (
            <div className="selected-actor__image selected-actor__placeholder">
              No image
            </div>
          )}

          <div className="selected-actor__details">
            <strong className="selected-actor__name">
              {selectedActor.name}
            </strong>

            <span className="selected-actor__caption">
              Selected actor
            </span>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={handleChangeActor}
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <div className="actor-search__controls">
            <input
              className="actor-search__input"
              type="text"
              value={query}
              placeholder="Search for an actor"
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            <button
              className="actor-search__button"
              type="button"
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>

          {error && (
            <p className="actor-search__error">
              {error}
            </p>
          )}

          {results.length > 0 && (
            <ul className="actor-search__results">
              {results.map((actor) => (
                <li key={actor.id}>
                  <button
                    className="actor-search__result"
                    type="button"
                    onClick={() =>
                      handleSelectActor(actor)
                    }
                  >
                    {actor.profile_path ? (
                      <img
                        className="actor-search__result-image"
                        src={`${TMDB_IMAGE_BASE_URL}${actor.profile_path}`}
                        alt=""
                      />
                    ) : (
                      <div className="actor-search__result-image actor-search__result-placeholder">
                        ?
                      </div>
                    )}

                    <span>{actor.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

export default ActorSearch;