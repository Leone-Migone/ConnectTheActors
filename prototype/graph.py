from collections import defaultdict

def build_actor_graph(movies: dict[str, list[str]],) -> dict[str, list[tuple[str, str]]]:
    graph = defaultdict(list)
    for film, actors in movies.items():
        for actor in actors:
            if actor not in graph:
                graph[actor] = []
            for costar in actors:
                if actor != costar:
                    graph[actor].append((costar,film))

    return dict(graph)
