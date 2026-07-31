from pydantic import BaseModel


class GameCreate(BaseModel):
    start_actor_id: int
    target_actor_id: int


class GameResponse(BaseModel):
    game_id: str
    start_actor_id: int
    target_actor_id: int
    lives: int
    status: str
    actor_ids: list[int]
    movie_ids: list[int]
    player_path: list[Any] | None


class MovieSubmission(BaseModel):
    movie_id: int

class ActorSubmission(BaseModel):
    actor_id: int