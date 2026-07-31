import { useState } from "react";
import { searchActors } from "../api";

function ActorSearch({ label, selectedActor, onSelect }) {
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

  return (
    <section>
      <h2>{label}</h2>

      {selectedActor ? (
        <div>
          <p>
            Selected: <strong>{selectedActor.name}</strong>
          </p>

          <button type="button" onClick={() => onSelect(null)}>
            Change actor
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={query}
            placeholder="Search for an actor"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button
            type="button"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>

          {error && <p>{error}</p>}

          <ul>
            {results.map((actor) => (
              <li key={actor.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(actor);
                    setResults([]);
                  }}
                >
                  {actor.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default ActorSearch;