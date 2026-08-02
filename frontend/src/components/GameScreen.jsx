import { useState } from "react";

import GameHeader from "./GameHeader";
import GraphBoard from "./GraphBoard";
import GameResult from "./GameResult";

import {
  searchActors,
  searchMovies,
  submitActor,
  submitMovie,
} from "../api";

const TMDB_IMAGE_BASE_URL =
  "https://image.tmdb.org/t/p/w300";

function GameScreen({
  game,
  setGame,
  startActor,
  targetActor,
  onMainMenu,
  onPlayAgain,
}) {
  const [searchType, setSearchType] = useState("actor");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch() {
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

  function handleSearchTypeChange(type) {
    setSearchType(type);
    setResults([]);
    setQuery("");
    setMessage("");
  }

  return (
    <main className="game-screen">
      <GameHeader
        startActor={startActor}
        targetActor={targetActor}
        lives={game.lives}
        status={game.status}
      />

      {game.status === "playing" && (
        <section className="game-search-panel">
          <div className="search-tabs">
            <button
              className={
                searchType === "actor"
                  ? "search-tab search-tab--active"
                  : "search-tab"
              }
              type="button"
              onClick={() =>
                handleSearchTypeChange("actor")
              }
            >
              Actors
            </button>

            <button
              className={
                searchType === "movie"
                  ? "search-tab search-tab--active"
                  : "search-tab"
              }
              type="button"
              onClick={() =>
                handleSearchTypeChange("movie")
              }
            >
              Movies
            </button>
          </div>

          <div className="game-search-panel__body">
            <div className="game-search-controls">
              <input
                className="game-search-input"
                type="text"
                value={query}
                placeholder={`Search for a ${searchType}`}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
              />

              <button
                className="game-search-button"
                type="button"
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
              >
                {isLoading
                  ? "Searching..."
                  : "Search"}
              </button>
            </div>

            {results.length > 0 && (
              <div className="game-search-results">
                {results.map((result) => {
                  const imagePath =
                    searchType === "actor"
                      ? result.profile_path
                      : result.poster_path;

                  const displayName =
                    searchType === "actor"
                      ? result.name
                      : result.title;

                  const secondaryText =
                    searchType === "movie" &&
                    result.release_date
                      ? result.release_date.slice(0, 4)
                      : searchType === "actor"
                        ? "Actor"
                        : "Movie";

                  return (
                    <button
                      className="game-search-result"
                      key={result.id}
                      type="button"
                      onClick={() =>
                        handleSelection(result)
                      }
                      disabled={isLoading}
                    >
                      {imagePath ? (
                        <img
                          className="game-search-result__image"
                          src={`${TMDB_IMAGE_BASE_URL}${imagePath}`}
                          alt={displayName}
                        />
                      ) : (
                        <div className="game-search-result__image game-search-result__placeholder">
                          ?
                        </div>
                      )}

                      <span className="game-search-result__details">
                        <strong>{displayName}</strong>
                        <small>{secondaryText}</small>
                      </span>

                      <span className="game-search-result__action">
                        Add
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {message && (
        <p
          className={`game-message game-message--${game.status}`}
        >
          {message}
        </p>
      )}
      {game.status == "playing" && ( 
        <GraphBoard
          nodes={game.graph_nodes ?? []}
          edges={game.graph_edges ?? []}
          startActorId={game.start_actor_id}
        />
      )}

      {game.status !== "playing" && (
        <GameResult
          status={game.status}
          playerPath={game.player_path}
          onPlayAgain={onPlayAgain}
          onMainMenu={onMainMenu}
        />
      )}
    </main>
  );
}
export default GameScreen;