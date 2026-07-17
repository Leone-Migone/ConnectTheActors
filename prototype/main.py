from prototype.graph import build_actor_graph
from prototype.sample_data import MOVIES
from prototype.search import find_shortest_connection
graph = build_actor_graph(MOVIES)

for actor, connections in graph.items():
    print(f"\n{actor}")
    for co_star, film in connections:
        print(f"  -> {co_star} via {film}")



print(find_shortest_connection(graph=graph, start_actor= "Christian Bale", target_actor="Jake Gyllenhaal"))