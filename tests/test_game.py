from prototype.game import Game


# -------------------------
# Initial game-state tests
# -------------------------

def test_game_starts_with_two_disconnected_actors():
    """A new game should contain only the two endpoint actors."""
    game = Game(1, 2)

    assert game.start_actor_id == 1
    assert game.target_actor_id == 2
    assert game.lives == 3
    assert game.status == "playing"

    assert game.actor_ids == {1, 2}
    assert game.movie_ids == set()

    assert game.graph == {
        ("actor", 1): set(),
        ("actor", 2): set(),
    }

    assert game.find_player_path() is None


def test_same_start_and_target_returns_single_node_path():
    """An actor is already connected to themselves."""
    game = Game(1, 1)

    assert game.find_player_path() == [
        ("actor", 1),
    ]


# -------------------------
# Movie addition tests
# -------------------------

def test_valid_movie_is_added_and_connected():
    """A movie is valid when an existing graph actor appears in its cast."""
    game = Game(1, 2)

    result = game.add_movie(10, {1, 3, 4})

    assert result is True
    assert game.movie_ids == {10}
    assert game.lives == 3
    assert game.graph[("actor", 1)] == {("movie", 10)}
    assert game.graph[("movie", 10)] == {("actor", 1)}


def test_movie_connects_to_all_matching_existing_actors():
    """A movie should connect to every existing actor present in its cast."""
    game = Game(1, 2)

    result = game.add_movie(10, {1, 2, 3})

    assert result is True
    assert game.graph[("movie", 10)] == {
        ("actor", 1),
        ("actor", 2),
    }
    assert ("movie", 10) in game.graph[("actor", 1)]
    assert ("movie", 10) in game.graph[("actor", 2)]


def test_movie_does_not_automatically_add_cast_members():
    """Adding a movie should not add every actor from its cast."""
    game = Game(1, 2)

    game.add_movie(10, {1, 3, 4})

    assert game.actor_ids == {1, 2}
    assert ("actor", 3) not in game.graph
    assert ("actor", 4) not in game.graph


def test_invalid_movie_loses_one_life():
    """A movie with no matching existing actor should be rejected."""
    game = Game(1, 2)

    result = game.add_movie(10, {3, 4, 5})

    assert result is False
    assert game.lives == 2
    assert game.status == "playing"
    assert game.movie_ids == set()
    assert ("movie", 10) not in game.graph


def test_three_invalid_movies_end_the_game():
    """The game should become lost after all three lives are used."""
    game = Game(1, 2)

    game.add_movie(10, {3})
    game.add_movie(20, {4})
    game.add_movie(30, {5})

    assert game.lives == 0
    assert game.status == "lost"


def test_duplicate_movie_does_not_lose_a_life():
    """Submitting an already-added movie should not cost a life."""
    game = Game(1, 2)

    first_result = game.add_movie(10, {1, 3})
    second_result = game.add_movie(10, {1, 3})

    assert first_result is True
    assert second_result is False
    assert game.lives == 3
    assert game.movie_ids == {10}


# -------------------------
# Actor addition tests
# -------------------------

def test_valid_actor_is_added_and_connected():
    """An actor is valid when one of their movies is already in the graph."""
    game = Game(1, 2)
    game.add_movie(10, {1, 3})

    result = game.add_actor(3, {10, 20, 30})

    assert result is True
    assert game.actor_ids == {1, 2, 3}
    assert game.lives == 3
    assert game.graph[("actor", 3)] == {("movie", 10)}
    assert ("actor", 3) in game.graph[("movie", 10)]


def test_actor_connects_to_all_matching_existing_movies():
    """An actor should connect to every existing movie in their credits."""
    game = Game(1, 2)

    game.add_movie(10, {1, 3})
    game.add_movie(20, {2, 4})

    result = game.add_actor(5, {10, 20, 30})

    assert result is True
    assert game.graph[("actor", 5)] == {
        ("movie", 10),
        ("movie", 20),
    }
    assert ("actor", 5) in game.graph[("movie", 10)]
    assert ("actor", 5) in game.graph[("movie", 20)]


def test_actor_does_not_automatically_add_all_their_movies():
    """Only movies already present in the graph should be connected."""
    game = Game(1, 2)
    game.add_movie(10, {1, 3})

    game.add_actor(3, {10, 20, 30})

    assert game.movie_ids == {10}
    assert ("movie", 20) not in game.graph
    assert ("movie", 30) not in game.graph


def test_invalid_actor_loses_one_life():
    """An actor with no matching graph movie should be rejected."""
    game = Game(1, 2)
    game.add_movie(10, {1, 3})

    result = game.add_actor(4, {20, 30})

    assert result is False
    assert game.lives == 2
    assert game.status == "playing"
    assert 4 not in game.actor_ids
    assert ("actor", 4) not in game.graph


def test_three_invalid_actors_end_the_game():
    """Three invalid actor guesses should change the game status to lost."""
    game = Game(1, 2)
    game.add_movie(10, {1, 3})

    game.add_actor(4, {20})
    game.add_actor(5, {30})
    game.add_actor(6, {40})

    assert game.lives == 0
    assert game.status == "lost"


def test_duplicate_actor_does_not_lose_a_life():
    """Submitting an actor already in the graph should not cost a life."""
    game = Game(1, 2)
    game.add_movie(10, {1, 3})

    first_result = game.add_actor(3, {10})
    second_result = game.add_actor(3, {10})

    assert first_result is True
    assert second_result is False
    assert game.lives == 3
    assert game.actor_ids == {1, 2, 3}


# -------------------------
# Path and victory tests
# -------------------------

def test_find_player_path_returns_none_when_disconnected():
    """No route should be returned while the endpoints are disconnected."""
    game = Game(1, 2)

    game.add_movie(10, {1, 3})
    game.add_actor(3, {10})

    assert game.find_player_path() is None
    assert game.status == "playing"


def test_find_player_path_returns_full_bipartite_route():
    """The route should contain actor and movie nodes in order."""
    game = Game(1, 2)

    game.add_movie(10, {1, 3})
    game.add_movie(20, {2, 4})
    game.add_actor(5, {10, 20})

    assert game.find_player_path() == [
        ("actor", 1),
        ("movie", 10),
        ("actor", 5),
        ("movie", 20),
        ("actor", 2),
    ]


def test_status_changes_to_won_when_actor_connects_graph():
    """Adding an actor that joins both graph components should win."""
    game = Game(1, 2)

    game.add_movie(10, {1, 3})
    game.add_movie(20, {2, 4})

    result = game.add_actor(5, {10, 20})

    assert result is True
    assert game.status == "won"


def test_status_changes_to_won_when_movie_connects_graph():
    """Adding a movie shared by both endpoint actors should win."""
    game = Game(1, 2)

    result = game.add_movie(10, {1, 2})

    assert result is True
    assert game.find_player_path() == [
        ("actor", 1),
        ("movie", 10),
        ("actor", 2),
    ]
    assert game.status == "won"


# -------------------------
# Graph integrity tests
# -------------------------

def test_every_edge_is_bidirectional():
    """Every actor-to-movie edge should also exist movie-to-actor."""
    game = Game(1, 2)

    game.add_movie(10, {1, 3})
    game.add_actor(3, {10})

    for node, neighbours in game.graph.items():
        for neighbour in neighbours:
            assert node in game.graph[neighbour]


def test_graph_contains_only_actor_movie_edges():
    """The graph must never contain actor-actor or movie-movie edges."""
    game = Game(1, 2)

    game.add_movie(10, {1, 3})
    game.add_movie(20, {2, 4})
    game.add_actor(5, {10, 20})

    for node, neighbours in game.graph.items():
        node_type, _ = node

        for neighbour in neighbours:
            neighbour_type, _ = neighbour
            assert node_type != neighbour_type