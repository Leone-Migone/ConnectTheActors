from pydantic import BaseModel
from typing import Any

class GameCreate(BaseModel):
    start_actor_id: int
    target_actor_id: int




class MovieSubmission(BaseModel):
    movie_id: int

class ActorSubmission(BaseModel):
    actor_id: int


class ActorDetails(BaseModel):
    id: int
    name: str
    profile_path: str | None


class MovieDetails(BaseModel):
    id: int
    title: str
    release_date: str | None
    poster_path: str | None


class PathNode(BaseModel):
    type: str
    id: int
    name: str
    image_path: str | None

class GameResponse(BaseModel):
    game_id: str
    start_actor_id: int
    target_actor_id: int
    lives: int
    status: str
    actors: list[ActorDetails]
    movies: list[MovieDetails]
    player_path: list[PathNode] | None
