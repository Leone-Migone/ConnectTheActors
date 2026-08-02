from pydantic import BaseModel
from typing import Any
from typing import Literal


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

class GraphNode(BaseModel):
    type: str
    id: int
    name: str
    image_path: str | None


class GraphEdge(BaseModel):
    from_type: str
    from_id: int
    to_type: str
    to_id: int
    
class GameResponse(BaseModel):
    game_id: str
    start_actor_id: int
    target_actor_id: int
    lives: int
    status: str
    actors: list[ActorDetails]
    movies: list[MovieDetails]
    graph_nodes: list[GraphNode]
    graph_edges: list[GraphEdge]
    player_path: list[PathNode] | None

class SubmissionResponse(BaseModel):
    result: Literal[
        "added",
        "invalid",
        "duplicate",
        "game_finished",
    ]
    game: GameResponse