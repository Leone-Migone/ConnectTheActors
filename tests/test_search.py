from prototype.graph import build_actor_graph
from prototype.sample_data import MOVIES
from prototype.search import find_shortest_connection


graph = build_actor_graph(MOVIES)


def test_finds_shortest_connection():
    result = find_shortest_connection(
        graph,
        "Christian Bale",
        "Jake Gyllenhaal",
    )

    assert result == [
        ("Christian Bale", "The Prestige", "Hugh Jackman"),
        ("Hugh Jackman", "Prisoners", "Jake Gyllenhaal"),
    ]


def test_same_actor_returns_empty_path():
    assert find_shortest_connection(
        graph,
        "Christian Bale",
        "Christian Bale",
    ) == []


def test_unknown_actor_returns_none():
    assert find_shortest_connection(
        graph,
        "Christian Bale",
        "Unknown Actor",
    ) is None


def test_disconnected_actors_return_none():
    assert find_shortest_connection(
        graph,
        "Christian Bale",
        "Tom Hanks",
    ) is None