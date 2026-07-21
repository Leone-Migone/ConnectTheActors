from prototype.graph import build_actor_graph
from prototype.sample_data import MOVIES
from prototype.search import find_shortest_connection
from prototype.tmdb_client import search_actors
from prototype.tmdb_client import get_actor_movie_credits
graph = build_actor_graph(MOVIES)

print(find_shortest_connection(graph=graph, start_actor= "Christian Bale", target_actor="Jake Gyllenhaal"))


results = search_actors("Tom Hanks")
if not results:
    print("No actor found.")
else:
    for index, actor in enumerate(results[:5],start=1):
        print(index,actor["name"],actor["id"])
    
     
    choice = int(input("Select actor: "))
    selected_actor = results[choice -1]
    
    credits = get_actor_movie_credits(results[0]["id"])
    print(results)
    titles  = []
    for movie in credits[:5]:
        print(movie["title"])