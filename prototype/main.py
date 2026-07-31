from prototype.game import Game
from prototype.tmdb_client import (
    search_actors,
    search_movies,
    get_actor_movie_credit_ids,
    get_movie_cast_ids,
)

start_results = search_actors("Cillian Murphy")
target_results = search_actors("Johnny Depp")

start_actor = next(
        actor for actor in start_results
        if actor["name"] == "Cillian Murphy"
)

target_actor = next(
        actor for actor in target_results
        if actor["name"] == "Johnny Depp"
)

game = Game(
        start_actor_id=start_actor["id"],
        target_actor_id=target_actor["id"],
)

# Pretend the player searches for Oppenheimer
movie_results = search_movies("Oppenheimer")
oppenheimer = movie_results[0]

movie_id = oppenheimer["id"]
cast_ids = get_movie_cast_ids(movie_id)

print(game.add_movie(movie_id, cast_ids))


# Pretend the player searches for Rami Malek
actor_results = search_actors("Rami Malek")
print(actor_results)
actor_id = actor_results[0]["id"]
actor_movie_credits = get_actor_movie_credit_ids(actor_id=actor_id)
print(game.add_actor(actor_id=actor_id,movie_credit_ids = actor_movie_credits))

print(game.status)
print(game.graph)

movie_res = search_movies("Amsterdam")
movie_id = movie_res[0]["id"]
movie_cred = get_movie_cast_ids(movie_id=movie_id)
print(game.add_movie(movie_id=movie_id,cast_actors_ids=movie_cred))


print(game.status)
print(game.graph)

actor = search_actors("Christian Bale")
actor_id = actor[0]["id"]
actor_cred = get_actor_movie_credit_ids(actor_id=actor_id)
print(game.add_actor(actor_id=actor_id,movie_credit_ids=actor_cred))

print(game.status)
print(game.graph)


movie_res = search_movies("Public Enemies")
movie_id = movie_res[0]["id"]
movie_cred = get_movie_cast_ids(movie_id=movie_id)
print(game.add_movie(movie_id=movie_id,cast_actors_ids=movie_cred))

print(game.status)
print(game.graph)
