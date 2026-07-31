import { useState } from "react";

import { createGame } from "./api";
import ActorSearch from "./components/ActorSearch";

function App() {
  const [startActor, setStartActor] = useState(null);
  const [targetActor, setTargetActor] = useState(null);
  const [game, setGame] = useState(null);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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
      <main>
        <h1>Connect the Actors</h1>

        <p>
          {startActor.name} → {targetActor.name}
        </p>

        <p>Lives: {game.lives}</p>
        <p>Status: {game.status}</p>
        <p>Game ID: {game.game_id}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Connect the Actors</h1>
      <p>Select two actors to begin.</p>

      <ActorSearch
        label="Starting actor"
        selectedActor={startActor}
        onSelect={setStartActor}
      />

      <ActorSearch
        label="Target actor"
        selectedActor={targetActor}
        onSelect={setTargetActor}
      />

      {error && <p>{error}</p>}

      <button
        type="button"
        onClick={handleCreateGame}
        disabled={!startActor || !targetActor || isCreating}
      >
        {isCreating ? "Creating game..." : "Start game"}
      </button>
    </main>
  );
}

export default App;