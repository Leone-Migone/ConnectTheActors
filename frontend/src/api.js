const API_BASE_URL = "http://127.0.0.1:8000";

export async function searchActors(query) {
  const response = await fetch(
    `${API_BASE_URL}/actors/search?query=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Actor search failed");
  }

  return response.json();
}

export async function searchMovies(query) {
  const response = await fetch(
    `${API_BASE_URL}/movies/search?query=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Movie search failed");
  }

  return response.json();
}

export async function createGame(startActorId, targetActorId) {
  const response = await fetch(`${API_BASE_URL}/games`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      start_actor_id: startActorId,
      target_actor_id: targetActorId,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not create game");
  }

  return response.json();
}

export async function submitActor(gameId, actorId) {
  const response = await fetch(
    `${API_BASE_URL}/games/${gameId}/actors`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        actor_id: actorId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Could not submit actor");
  }

  return response.json();
}

export async function submitMovie(gameId, movieId) {
  const response = await fetch(
    `${API_BASE_URL}/games/${gameId}/movies`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movie_id: movieId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Could not submit movie");
  }

  return response.json();
}