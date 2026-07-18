# ConnectTheActors - Development Log

## Day 1 Graph Model and Shortest-Path Prototype

### Goals

* Define the first version of the project.
* Represent actors and films as a graph.
* Implement breadth-first search for the shortest actor connection.
* Add basic automated tests.

### Work completed

* Created a small manually defined movie dataset.
* Built an actor adjacency graph from film cast lists.
* Represented each connection as:

```python
(co_star, shared_film)
```

* Preserved multiple shared films between the same two actors.
* Ensured actors are not connected to themselves.
* Ensured actors with no co-stars still appear in the graph.
* Implemented breadth-first search using:

  * a queue for actors waiting to be explored;
  * a visited set to prevent repeated exploration and cycles;
  * a parents dictionary to record how each actor was reached.
* Implemented path reconstruction by following the parents dictionary backwards from the target actor.
* Added tests for:

  * finding a shortest connection;
  * searching for the same actor;
  * unknown actors;
  * disconnected actors.

## Day 2 TMDB API Integration

### Goals

* Replace manually entered actor data with real movie data.
* Use stable actor IDs rather than names internally.

### Work completed

* Created a TMDB API client.
* Stored the TMDB access token in a local `.env` file.
* Added `.env` to `.gitignore`.
* Added `.env.example` to document the required configuration.
* Implemented actor search using the TMDB person-search endpoint.
* Filtered results to people whose main department is acting.
* Reduced raw TMDB responses to the fields currently needed:

  * actor ID;
  * name;
  * profile image path.
* Implemented retrieval of an actor’s movie credits using their TMDB person ID.
* Tested the API functions from the command-line prototype.
* Confirmed that actor search results can be used to retrieve real film credits.
onstruct an actor graph from sample data;
* find and reconstruct a shortest actor connection;
* test the core graph-search behaviour;
* search TMDB for real actors;
* retrieve real movie credits using actor IDs.
