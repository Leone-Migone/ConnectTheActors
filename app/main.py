from uuid import uuid4
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.game_store import games
from prototype.game import Game
from app.schemas import GameCreate, GameResponse, MovieSubmission, ActorSubmission, SubmissionResponse, RandomActorsResponse
from prototype.tmdb_client import (
    get_movie_cast_ids,
    search_actors,
    search_movies,
    get_actor_movie_credit_ids
)
from app.game_store import (
    games,
    game_actor_details,
    game_movie_details,
)

from prototype.tmdb_client import (
    get_actor_details,
    get_actor_movie_credit_ids,
    get_movie_cast_ids,
    get_movie_details,
    search_actors,
    search_movies,
)
import random
from app.famous_actors import FAMOUS_ACTOR_IDS

app = FastAPI(
    title="Connect the Actors API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://connect-the-actors.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Connect the Actors API is running"}


@app.post(
    "/games",
    response_model=GameResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_game(game_data: GameCreate):
    game_id = str(uuid4())

    game = Game(
        start_actor_id=game_data.start_actor_id,
        target_actor_id=game_data.target_actor_id,
    )


    games[game_id] = game

    game_actor_details[game_id] = {
        game.start_actor_id: get_actor_details(game.start_actor_id),
        game.target_actor_id: get_actor_details(game.target_actor_id),
    }

    game_movie_details[game_id] = {}

    return build_game_response(game_id=game_id, game=game)


@app.get(
    "/games/{game_id}",
    response_model=GameResponse,
)
def get_game(game_id: str):
    game = games.get(game_id)

    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    return build_game_response(game_id=game_id, game=game)


@app.get("/actors/search")
def actor_search(query: str):
    return search_actors(query)


@app.get("/movies/search")
def movie_search(query: str):
    return search_movies(query)


@app.post("/games/{game_id}/movies")
def add_movie_to_game(game_id: str, submission: MovieSubmission) -> SubmissionResponse:
    game = games.get(game_id)

    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )

    cast_actor_ids = get_movie_cast_ids(submission.movie_id)

    added = game.add_movie(
        movie_id=submission.movie_id,
        cast_actors_ids=cast_actor_ids,
    )

    if added == "added":
        game_movie_details[game_id][submission.movie_id] = (
            get_movie_details(submission.movie_id)
        )

    return SubmissionResponse(result=added, game=build_game_response(game_id=game_id, game=game)) 



@app.post("/games/{game_id}/actors")
def add_actor_to_game(game_id:str,submission: ActorSubmission) -> SubmissionResponse:
    game = games.get(game_id)
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    
    actor_movies_ids =  get_actor_movie_credit_ids(actor_id=submission.actor_id)

    added = game.add_actor(actor_id= submission.actor_id, movie_credit_ids= actor_movies_ids)

    if added == "added":
        game_actor_details[game_id][submission.actor_id] = (
            get_actor_details(submission.actor_id)
        )
    return SubmissionResponse(result=added, game=build_game_response(game_id=game_id, game=game))

def build_game_response(game_id: str, game: Game) -> GameResponse:
    raw_path = game.find_player_path()
    enriched_path = None

    if raw_path is not None:
        enriched_path = []

        for node_type, node_id in raw_path:
            if node_type == "actor":
                actor = game_actor_details[game_id][node_id]

                enriched_path.append({
                    "type": "actor",
                    "id": node_id,
                    "name": actor["name"],
                    "image_path": actor.get("profile_path"),
                })

            elif node_type == "movie":
                movie = game_movie_details[game_id][node_id]

                enriched_path.append({
                    "type": "movie",
                    "id": node_id,
                    "name": movie["title"],
                    "image_path": movie.get("poster_path"),
                })
    
    graph_nodes = []

    for actor in game_actor_details[game_id].values():
        graph_nodes.append(
            {
                "type": "actor",
                "id": actor["id"],
                "name": actor["name"],
                "image_path": actor.get("profile_path"),
            }
        )

    for movie in game_movie_details[game_id].values():
        graph_nodes.append(
            {
                "type": "movie",
                "id": movie["id"],
                "name": movie["title"],
                "image_path": movie.get("poster_path"),
            }
        )

    graph_edges = []
    seen_edges = set()

    for current_node, neighbours in game.graph.items():
        for neighbour in neighbours:
            edge_key = frozenset((current_node, neighbour))

            if edge_key in seen_edges:
                continue

            seen_edges.add(edge_key)

            graph_edges.append(
                {
                    "from_type": current_node[0],
                    "from_id": current_node[1],
                    "to_type": neighbour[0],
                    "to_id": neighbour[1],
                }
            )
    return GameResponse(
        game_id=game_id,
        start_actor_id=game.start_actor_id,
        target_actor_id=game.target_actor_id,
        lives=game.lives,
        status=game.status,
        actors=list(game_actor_details[game_id].values()),
        movies=list(game_movie_details[game_id].values()),
        graph_nodes=graph_nodes,
        graph_edges=graph_edges,
        player_path=enriched_path,
    )

@app.get(
    "/actors/random",
    response_model=RandomActorsResponse,
)
def get_random_actors() -> RandomActorsResponse:
    start_actor_id, target_actor_id = random.sample(
        FAMOUS_ACTOR_IDS,
        k=2,
    )

    return RandomActorsResponse(
        start_actor=get_actor_details(start_actor_id),
        target_actor=get_actor_details(target_actor_id),
    )