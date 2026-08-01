import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://api.themoviedb.org/3"
ACCESS_TOKEN = os.getenv("TMDB_ACCESS_TOKEN")

if not ACCESS_TOKEN:
    raise RuntimeError("TMDB_ACCESS_TOKEN is not configured in the .env file")

HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "accept": "application/json",
}

def search_person(name: str) -> list[dict]:
    response = requests.get(
        f"{BASE_URL}/search/person",
        headers=HEADERS,
        params= {"query":name},
        timeout=10
    )
    response.raise_for_status()
    data = response.json()
    return data["results"]


def search_actors(name: str) -> list[dict]:
    results = search_person(name=name)
    actors = []

    for person in results:
        if person.get("known_for_department") == "Acting":
            actors.append(
                {"id": person["id"],
                "name": person["name"],
                "profile_path": person.get("profile_path"),} #we use .get instead for the profile image since if missing atleast returns None rather than keyerror
            )

    return actors

def search_movies(title: str) -> list[dict]:
    response = requests.get(
        f"{BASE_URL}/search/movie",
        headers=HEADERS,
        params={"query": title},
        timeout=10,
    )
    response.raise_for_status()

    data = response.json()

    return [
        {
            "id": movie["id"],
            "title": movie["title"],
            "release_date": movie.get("release_date"),
            "poster_path": movie.get("poster_path"),
        }
        for movie in data.get("results", [])
    ]

def get_actor_movie_credits(actor_id: int) -> list[dict]:
    response = requests.get(
        f"{BASE_URL}/person/{actor_id}/movie_credits",
        headers=HEADERS,
        timeout=10,
    )

    response.raise_for_status()
    data = response.json()
    return data["cast"]


def get_movie_cast_ids(movie_id: int) -> set[int]:
    url = f"{BASE_URL}/movie/{movie_id}/credits"

    response = requests.get(
        url,
        headers=HEADERS,
        timeout=10,
    )
    response.raise_for_status()

    data = response.json()

    return {
        cast_member["id"]
        for cast_member in data.get("cast", [])
        if "id" in cast_member
    }

def get_actor_movie_credit_ids(actor_id: int) -> set[int]:
    credits = get_actor_movie_credits(actor_id)

    return {
        movie["id"]
        for movie in credits
        if "id" in movie
    }


if __name__ == "__main__":
    actors = search_actors("Cillian Murphy")
    print("Actors:", actors[:3])

    movies = search_movies("Oppenheimer")
    print("Movies:", movies[:3])

    if actors:
        actor_id = actors[0]["id"]
        credit_ids = get_actor_movie_credit_ids(actor_id)
        print("Actor credit count:", len(credit_ids))
        print("Some movie IDs:", list(credit_ids)[:10])

    if movies:
        movie_id = movies[0]["id"]
        cast_ids = get_movie_cast_ids(movie_id)
        print("Movie cast count:", len(cast_ids))
        print("Some actor IDs:", list(cast_ids)[:10])


def get_actor_details(actor_id: int) -> dict:
    response = requests.get(
        f"{BASE_URL}/person/{actor_id}",
        headers=HEADERS,
        timeout=10,
    )
    response.raise_for_status()

    actor = response.json()

    return {
        "id": actor["id"],
        "name": actor["name"],
        "profile_path": actor.get("profile_path"),
    }


def get_movie_details(movie_id: int) -> dict:
    response = requests.get(
        f"{BASE_URL}/movie/{movie_id}",
        headers=HEADERS,
        timeout=10,
    )
    response.raise_for_status()

    movie = response.json()

    return {
        "id": movie["id"],
        "title": movie["title"],
        "release_date": movie.get("release_date"),
        "poster_path": movie.get("poster_path"),
    }