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

def get_actor_movie_credits(actor_id: int) -> list[dict]:
    response = requests.get(
        f"{BASE_URL}/person/{actor_id}/movie_credits",
        headers=HEADERS,
        timeout=10,
    )

    response.raise_for_status()
    data = response.json()
    return data["cast"]

