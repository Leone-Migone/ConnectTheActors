from collections import deque
class Game:
    def __init__(self, start_actor_id: int, target_actor_id: int):
        self.start_actor_id = start_actor_id
        self.target_actor_id = target_actor_id

        self.lives = 3
        self.status = "playing"

        self.actor_ids = {start_actor_id, target_actor_id}
        self.movie_ids = set()

        self.graph = {
            ("actor", start_actor_id): set(),
            ("actor", target_actor_id): set(),
        }
    #passing in movie id and set of actor ids that were in the movie, if any of those actors are already in the graph then add the movie to the graph and link them to the actors
    def add_movie(self, movie_id: int, cast_actors_ids: set[int]) -> bool:
        if movie_id in self.movie_ids:
            return False
        matching_actor_ids = self.actor_ids.intersection(cast_actors_ids)

        if not matching_actor_ids:
            self.lives -= 1
            if self.lives  <= 0:
                self.status = "lost"
            return False
        
        self.movie_ids.add(movie_id)
        movie_node = ("movie", movie_id)
        self.graph[movie_node] = set()

        #for each actor alr searched link with movie added
        for actor_id in matching_actor_ids:
            actor_node = ("actor", actor_id)
            self.graph[actor_node].add(movie_node)
            self.graph[movie_node].add(actor_node)


        if self.is_connected():
            self.status = "won"
        return True
        
    #passing in actor id and set of movie ids that actor has been in, if any of those movies are already in the graph then add the actor to the graph and link them to the movies
    def add_actor(self, actor_id: int, movie_credit_ids: set[int]) -> bool:
        if actor_id in self.actor_ids:
            return False
        matching_movie_ids = self.movie_ids.intersection(movie_credit_ids)

        if not matching_movie_ids:
            self.lives -= 1
            if self.lives <= 0:
                self.status = "lost"
            return False
    
        self.actor_ids.add(actor_id)
        actor_node = ("actor",actor_id)
        self.graph[actor_node] = set()

        for movie_id in matching_movie_ids:
            movie_node = ("movie", movie_id)
            self.graph[movie_node].add(actor_node)
            self.graph[actor_node].add(movie_node)
        
        if self.is_connected():
            self.status = "won"
        return True

    def find_player_path(self):
        start_node = ("actor", self.start_actor_id)
        target_node = ("actor", self.target_actor_id)

        if start_node == target_node:
            return [start_node]

        queue = deque([start_node])
        visited = {start_node}
        parents = {}

        while queue:
            current_node = queue.popleft()

            for neighbour in self.graph[current_node]:
                if neighbour not in visited:
                    
                    visited.add(neighbour)
                    parents[neighbour] = current_node
                    queue.append(neighbour)
                    if neighbour == target_node:
                        return self.reconstruct_path(parents,start_node, target_node)


        return None
        
    def is_connected(self) -> bool:
        return self.find_player_path() is not None
    
    #recosntructs path from target to start actor
    def reconstruct_path( self,
    parents,
    start_node,
    target_node,
    ):
        path = [target_node]
        current_node = target_node
        ##till we iterated back
        while current_node != start_node:
            current_node = parents[current_node]
            path.append(current_node)

        path.reverse()
        return path

if __name__ == "__main__":
    game = Game(1, 2)
    print(game.add_movie(10, {1, 3}))
    print(game.add_movie(20, {2, 4}))
    print(game.add_actor(5, {10, 20, 30}))
    print(game.is_connected())
    print(game.lives)
    print(game.movie_ids)
    print(game.graph)
    print(game.status)
    