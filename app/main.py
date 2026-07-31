from uuid import uuid4
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.game_store import games
from prototype.game import Game
from app.schemas import GameCreate, GameResponse, MovieSubmission, ActorSubmission
from prototype.tmdb_client import (
    get_movie_cast_ids,
    search_actors,
    search_movies,
    get_actor_movie_credit_ids
)

app = FastAPI(
    title="Connect the Actors API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
def add_movie_to_game(
    game_id: str,
    submission: MovieSubmission,
):
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

    return build_game_response(game_id= game_id, game = game) 



@app.post("/games/{game_id}/actors")
def add_actor_to_game(game_id:str,submission: ActorSubmission):
    game = games.get(game_id)
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game not found",
        )
    
    actor_movies_ids =  get_actor_movie_credit_ids(actor_id=submission.actor_id)

    added = game.add_actor(actor_id= submission.actor_id, movie_credit_ids= actor_movies_ids)

    return build_game_response(game_id= game_id, game = game) 

def build_game_response(game_id: str, game: Game) -> GameResponse:
    return GameResponse(
        game_id=game_id,
        start_actor_id=game.start_actor_id,
        target_actor_id=game.target_actor_id,
        lives=game.lives,
        status=game.status,
        actor_ids=list(game.actor_ids),
        movie_ids=list(game.movie_ids),
        player_path=game.find_player_path(),
    )
