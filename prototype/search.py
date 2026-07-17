from collections import deque

def find_shortest_connection(
    graph : dict[str, list[tuple[str,str]]], 
    start_actor: str,
    target_actor : str):
    if start_actor == target_actor:
        return []
    if start_actor not in graph or target_actor not in graph:
        return None
    
    queue = deque([start_actor])
    visited = {start_actor}
    parents = {}

    while queue:
        current_actor = queue.popleft()
        for costar, film in graph[current_actor]:
            if costar not in visited:
                visited.add(costar)
                parents[costar] = (current_actor, film)
                queue.append(costar)
                if costar == target_actor: ##reconstruct path
                    return reconstruct_path(parents=parents, start_actor=start_actor, target_actor= target_actor)
            

#recosntructs path from target to start actor
def reconstruct_path(
    parents: dict[str, tuple[str, str]],
    start_actor: str,
    target_actor: str,
):
    path = []
    current_actor = target_actor
    ##till we iterated back
    while current_actor != start_actor:
        previous_actor, film = parents[current_actor]
        #will be reverse so previous is the next chosen 
        path.append((previous_actor,film,current_actor))
        current_actor = previous_actor

    path.reverse()
    return path