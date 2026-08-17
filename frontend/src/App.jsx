import { useState } from "react";
import GameScreen from "./components/GameScreen";
import { createGame, getRandomActors } from "./api";
import ActorSearch from "./components/ActorSearch";


function SiteHeader({onHome}) {
  return (
    <header className="site-header">
      <button
        type="button"
        className="site-brand"
        onClick={onHome}
        aria-Label="Go to home"
      >
        <span className="site-brand__mark">
          <span className="site-brand__dot site-brand__dot--green" />
          <span className="site-brand__dot site-brand__dot--orange" />
          <span className="site-brand__dot site-brand__dot--blue" />
        </span>

        <span className="site-brand__name">
          Connect the Actors
        </span>
      </button>
    </header>
  );
}

function App() {
  const [startActor, setStartActor] = useState(null);
  const [targetActor, setTargetActor] = useState(null);
  const [game, setGame] = useState(null);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);
  

  function handleMainMenu() {
    setGame(null);
    setStartActor(null);
    setTargetActor(null);
    setError("");
  }

  async function handleRandomizeActors() {
    try {
      setIsRandomizing(true);
      setError("");

      const randomActors = await getRandomActors();

      setStartActor(randomActors.start_actor);
      setTargetActor(randomActors.target_actor);
    } catch (error) {
      console.error(error);
      setError("Could not generate a random challenge.");
    } finally {
      setIsRandomizing(false);
    }
  }
  async function handleCreateGame() {
    if (!startActor || !targetActor) {
      setError("Select both actors first.");
      return;
    }

    if (startActor.id === targetActor.id) {
      setError("Choose two different actors.");
      return;
    }

    try {
      setIsCreating(true);
      setError("");

      const createdGame = await createGame(
        startActor.id,
        targetActor.id
      );

      setGame(createdGame);
    } catch {
      setError("Could not create the game.");
    } finally {
      setIsCreating(false);
    }
  }

  if (game) {
  return (
    <div className="app-shell">
      <SiteHeader onHome={handleMainMenu} />

      <GameScreen
        game={game}
        setGame={setGame}
        startActor={startActor}
        targetActor={targetActor}
        onMainMenu={() => {
          setGame(null);
          setStartActor(null);
          setTargetActor(null);
          setError("");
      }}
      onPlayAgain={() => {
        setGame(null);
        setError("");
      }}
    />
    </div>
  );
}
  return (
  <div className="app-shell">
    <SiteHeader onHome={handleMainMenu} />

    <main className="start-screen">
      <section className="start-screen__intro">
        <p className="eyebrow">A movie connection game</p>

        <h1 className="start-screen__title">
          Find the link between{" "}
          <span className="start-screen__accent">
            any two actors.
          </span>
        </h1>

        <p className="start-screen__description">
          Build a path through films and co-stars before you
          run out of lives.
        </p>
      </section>

      <section className="setup-panel">
        <div className="setup-panel__header">
          <h2 className="setup-panel__title">
            Start a new game
          </h2>

          <p className="setup-panel__description">
            Choose two different actors to connect.
          </p>
        </div>

        <div className="setup-panel__searches">
          <ActorSearch
            label="Starting actor"
            selectedActor={startActor}
            onSelect={setStartActor}
          />

          <div className="setup-panel__arrow">↓</div>

          <ActorSearch
            label="Target actor"
            selectedActor={targetActor}
            onSelect={setTargetActor}
          />
        </div>

        {error && (
          <p className="error-message">{error}</p>
        )}

        <button
          className="random-button"
          type="button"
          onClick={handleRandomizeActors}
          disabled={isRandomizing || isCreating}
        >
          {isRandomizing
          ? "Choosing actors..."
          : "Random challenge"}
        </button>

        <button
          className="primary-button"
          type="button"
          onClick={handleCreateGame}
          disabled={
            !startActor ||
            !targetActor ||
            isCreating
          }
        >
          {isCreating
            ? "Creating game..."
            : "Start game"}
        </button>
      </section>
    </main>
  </div>
);
}
export default App;