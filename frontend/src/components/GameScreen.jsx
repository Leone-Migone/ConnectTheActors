import { useState } from "react";
import GraphBoard from "./GraphBoard";

import {
  searchActors,
  searchMovies,
  submitActor,
  submitMovie,
} from "../api";

function GameScreen({
  game,
  setGame,
  startActor,
  targetActor,
}) {
  const [searchType, setSearchType] = useState("actor");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w300";

  async function handleSearch() {
    console.log("FULL GAME:", game);
    console.log("PLAYER PATH:", game.player_path);
    if (!query.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");

      const searchResults =
        searchType === "actor"
          ? await searchActors(query)
          : await searchMovies(query);

      setResults(searchResults.slice(0, 5));
    } catch {
      setMessage("Search failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelection(result) {
    try {
      setIsLoading(true);
      setMessage("");

      const updatedGame =
        searchType === "actor"
          ? await submitActor(game.game_id, result.id)
          : await submitMovie(game.game_id, result.id);

      setGame(updatedGame);
      setResults([]);
      setQuery("");

      if (updatedGame.status === "won") {
        setMessage("You connected the actors!");
      } else if (updatedGame.status === "lost") {
        setMessage("You lost all three lives.");
      } else if (updatedGame.added === false) {
        setMessage("That selection could not be added.");
      } else {
        setMessage(
          `${searchType === "actor" ? "Actor" : "Movie"} added.`
        );
      }
    } catch {
      setMessage("Could not submit selection.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <h1>Connect the Actors</h1>

      <p>
        <strong>{startActor.name}</strong>
        {" → "}
        <strong>{targetActor.name}</strong>
      </p>

      <p>Lives: {game.lives}</p>
      <p>Status: {game.status}</p>

      {game.status === "playing" && (
        <>
          <div>
            <button
              type="button"
              onClick={() => {
                setSearchType("actor");
                setResults([]);
              }}
            >
              Search actors
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchType("movie");
                setResults([]);
              }}
            >
              Search movies
            </button>
          </div>

          <p>
            Currently searching for:{" "}
            <strong>{searchType}</strong>
          </p>

          <input
            type="text"
            value={query}
            placeholder={`Search for a ${searchType}`}
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
            {isLoading ? "Loading..." : "Search"}
          </button>

          <ul>
            {results.map((result) => (
              <li key={result.id}>
                <button
                  type="button"
                  onClick={() => handleSelection(result)}
                  disabled={isLoading}
                >
                  {searchType === "actor"
                    ? result.name
                    : `${result.title} ${
                        result.release_date
                          ? `(${result.release_date.slice(0, 4)})`
                          : ""
                      }`}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {message && <p>{message}</p>}

      <h2>Current game state</h2>

      <h2>Current game state</h2>

<p>Actors added: {game.actors.length}</p>
<p>Movies added: {game.movies.length}</p>


<GraphBoard
  nodes={game.graph_nodes ?? []}
  edges={game.graph_edges ?? []}
  startActorId={game.start_actor_id}
/>

{game.player_path && (
  <section>
    <h2>Player path</h2>

    <div>
      {game.player_path.map((node, index) => {
        const imagePath =
          node.image_path ??
          node.profile_path ??
          node.poster_path;

        const displayName = node.name ?? node.title;

        return (
          <div key={`${node.type}-${node.id}`}>
            {imagePath ? (
              <img
                src={`${TMDB_IMAGE_BASE_URL}${imagePath}`}
                alt={displayName}
                width="150"
              />
            ) : (
              <div>No image available</div>
            )}

            <p>
              <strong>{displayName}</strong>
            </p>

            <p>
              {node.type === "actor" ? "Actor" : "Movie"}
            </p>

            {index < game.player_path.length - 1 && <p>↓</p>}
          </div>
        );
      })}
    </div>
  </section>
)}
    </main>
  );
}

export default GameScreen;