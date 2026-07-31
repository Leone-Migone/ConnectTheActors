import { useState } from "react";
import { searchActors } from "./api";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedActor, setSelectedActor] = useState(null);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!query.trim()) {
      return;
    }

    try {
      setError("");

      const actors = await searchActors(query);
      setResults(actors.slice(0, 5));
    } catch {
      setError("Could not search for actors.");
    }
  }

  return (
    <main>
      <h1>Connect the Actors</h1>

      <h2>Select the starting actor</h2>

      <input
        type="text"
        value={query}
        placeholder="Search for an actor"
        onChange={(event) => setQuery(event.target.value)}
      />

      <button type="button" onClick={handleSearch}>
        Search
      </button>

      {error && <p>{error}</p>}

      <ul>
        {results.map((actor) => (
          <li key={actor.id}>
            <button
              type="button"
              onClick={() => setSelectedActor(actor)}
            >
              {actor.name}
            </button>
          </li>
        ))}
      </ul>

      {selectedActor && (
        <p>
          Selected: <strong>{selectedActor.name}</strong>
        </p>
      )}
    </main>
  );
}

export default App;