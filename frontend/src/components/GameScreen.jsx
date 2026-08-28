import { useEffect, useState } from "react";

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
  const [messageType, setMessageType] = useState("info");
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
  if (game.status !== "playing") {
    return;
  }

  const interval = setInterval(() => {
    setElapsedSeconds((seconds) => seconds + 1);
  }, 1000);

  return () => clearInterval(interval);
  }, [game.status]);

  function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}


  async function handleSearch() {
    if (!query.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");
      setMessageType("info");

      const searchResults =
        searchType === "actor"
          ? await searchActors(query)
          : await searchMovies(query);

      setResults(searchResults.slice(0, 5));
    } catch (error) {
      console.error(error);
      setMessageType("error");
      setMessage("Search failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelection(result) {
    try {
      setIsLoading(true);
      setMessage("");
      setMessageType("info");

      const submissionResponse =
        searchType === "actor"
          ? await submitActor(game.game_id, result.id)
          : await submitMovie(game.game_id, result.id);

      const updatedGame = submissionResponse.game;
      const submissionResult = submissionResponse.result;

      setGame(updatedGame);
      setResults([]);
      setQuery("");

      if (updatedGame.status === "won") {
        setMessageType("success");
        setMessage("You connected the actors!");
        return;
      }

      if (updatedGame.status === "lost") {
        setMessageType("error");
        setMessage("You lost all three lives.");
        return;
      }

      if (submissionResult === "added") {
        const itemName =
          searchType === "actor"
            ? result.name
            : result.title;

        setMessageType("success");
        setMessage(`${itemName} was added to your graph.`);
        return;
      }

      if (submissionResult === "invalid") {
        setMessageType("error");

        if (searchType === "actor") {
          setMessage(
            `${result.name} is not connected to any movie currently in your graph. You lost one life.`
          );
        } else {
          setMessage(
            `${result.title} does not contain any actor currently in your graph. You lost one life.`
          );
        }

        return;
      }

      if (submissionResult === "duplicate") {
        setMessageType("warning");

        if (searchType === "actor") {
          setMessage(
            `${result.name} is already in your graph.`
          );
        } else {
          setMessage(
            `${result.title} is already in your graph.`
          );
        }

        return;
      }

      if (submissionResult === "game_finished") {
        setMessageType("warning");
        setMessage("This game has already finished.");
      }
    } catch (error) {
      console.error(error);
      setMessageType("error");
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
    setMessageType("info");
  }

  return (
    <main className="game-screen">
      <GameHeader
        startActor={startActor}
        targetActor={targetActor}
        lives={game.lives}
        status={game.status}
        elapsedtime = {formatTime(elapsedSeconds)}
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
          className={`game-message game-message--${messageType}`}
          role="status"
        >
          {message}
        </p>
      )}

      <GraphBoard
        nodes={game.graph_nodes ?? []}
        edges={game.graph_edges ?? []}
        playerPath={game.player_path ?? []}
        gameStatus={game.status}
      />    

      {game.status !== "playing" && (
        <GameResult
          status={game.status}
          playerPath={game.player_path}
          elapsedtime={formatTime(elapsedSeconds)}
          onPlayAgain={onPlayAgain}
          onMainMenu={onMainMenu}
        />
      )}
    </main>
  );
}

export default GameScreen;