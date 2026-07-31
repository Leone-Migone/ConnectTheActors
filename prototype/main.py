from prototype.game import Game
from prototype.tmdb_client import search_actors,search_movies,get_actor_movie_credit_ids,get_movie_cast_ids

def run_game():
    start_results = search_actors("Cillian Murphy")
    target_results = search_actors("Johnny Depp")


    start_actor = next(
        actor
        for actor in start_results
        if actor["name"] == "Cillian Murphy"
    )

    target_actor = next(
        actor
        for actor in target_results
        if actor["name"] == "Johnny Depp"
    )
    game = Game(
        start_actor_id=start_actor["id"],
        target_actor_id=target_actor["id"],
    )

    while game.status == "playing":
        print(start_actor["name"])
        print(target_actor["name"])
        print(f"lives: {game.lives}")
        print("1. add Actor")
        print("2. add Movie")
        print("3. quit")

        choice = input("Choose an option").strip()

        if choice == "1":
            search = input("Search Actor Name: ").strip()
            actor_results = search_actors(search)

            for index, actor in enumerate(actor_results[:5], start=1):
                print(f"{index}. {actor['name']}")
                selection = int(input("Which actor? ").strip())

            if 1 <= selection <= min(5, len(actor_results)):
                actor_id = actor_results[selection - 1]["id"]
                actor_cred = get_actor_movie_credit_ids(actor_id)

                added = game.add_actor(
                    actor_id=actor_id,
                    movie_credit_ids=actor_cred,
                )

            print("Added" if added else "Could not add actor")

        elif choice == "2":
            search = input("Search Movie Name: ").strip()
            movie_results = search_movies(search)

            for index, movie in enumerate(movie_results[:5], start=1):
                release_date = movie.get("release_date") or ""
                print(f"{index}. {movie['title']} ({release_date[:4]})")

            selection = int(input("Which movie? ").strip())

            if 1 <= selection <= min(5, len(movie_results)):
                movie_id = movie_results[selection - 1]["id"]
                movie_cast_ids = get_movie_cast_ids(movie_id)

            added = game.add_movie(
                movie_id=movie_id,
                cast_actors_ids=movie_cast_ids,
            )

            print("Added" if added else "Could not add movie")

        elif choice == "3":
            return

        else:
            print("Invalid option")



if __name__ == "__main__":
    run_game()



"""
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
"""