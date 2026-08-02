# Connect the Actors

Connect the Actors is a full-stack graph-building game where the player attempts to connect two actors through films and co-stars.

The project is being developed as a portfolio application to demonstrate software engineering skills including graph modelling, breadth-first search, API integration, backend development, automated testing and frontend development.

## Game concept

The player is given:

* a starting actor;
* a target actor;
* three lives.

The player searches for actors and films and adds them to their own graph.

A valid route alternates between actors and movies:

```text
Actor → Movie → Actor → Movie → Actor
```

For example:

```text
Cillian Murphy
→ Oppenheimer
→ Rami Malek
→ Bohemian Rhapsody
→ Mike Myers
→ Alice Through the Looking Glass
→ Johnny Depp
```

The player wins when the starting and target actors become connected.

An invalid actor or movie submission costs one life. The game ends when the player completes a route or loses all three lives.

## Current project status

The core game logic, TMDB integration, command-line prototype and initial FastAPI backend have been implemented.

A React frontend has been created with Vite and is currently under development.

## Current features

### Core game logic

The `Game` class currently supports:

* starting and target actor nodes;
* three lives;
* playing, won and lost states;
* adding actors;
* adding movies;
* validating connections;
* duplicate handling;
* invalid-guess penalties;
* automatic victory detection;
* player-route reconstruction;
* prevention of submissions after the game ends.

### Bipartite graph

The player graph is represented as a bipartite graph containing two node types:

```python
("actor", actor_id)
("movie", movie_id)
```

Only actor-to-movie edges are allowed.

Example:

```python
{
    ("actor", 1): {
        ("movie", 10),
    },
    ("movie", 10): {
        ("actor", 1),
        ("actor", 5),
    },
    ("actor", 5): {
        ("movie", 10),
    },
}
```

Edges are stored in both directions.

### Validation rules

A movie can be added when at least one actor already in the player's graph appears in its cast.

```python
matching_actor_ids = actor_ids.intersection(cast_actor_ids)
```

An actor can be added when they appeared in at least one movie already in the player's graph.

```python
matching_movie_ids = movie_ids.intersection(movie_credit_ids)
```

Adding a movie does not automatically add its full cast.

Adding an actor does not automatically add their complete filmography.

### Breadth-first search

Breadth-first search is used to determine whether the starting and target actors are connected.

The BFS also stores parent relationships so the successful player route can be reconstructed.

Example returned route:

```python
[
    ("actor", 1),
    ("movie", 10),
    ("actor", 5),
    ("movie", 20),
    ("actor", 2),
]
```

The relevant methods are:

```python
find_player_path()
is_connected()
reconstruct_path()
```

### TMDB integration

The project uses the TMDB API for actor and movie information.

The current client supports:

```python
search_person(name)
search_actors(name)
search_movies(title)
get_actor_movie_credits(actor_id)
get_actor_movie_credit_ids(actor_id)
get_movie_cast_ids(movie_id)
```

The API token is stored in an environment variable:

```text
TMDB_ACCESS_TOKEN
```

The token must not be committed to Git.

### Command-line prototype

An interactive command-line version is available in:

```text
prototype/main.py
```

It allows the player to:

* view the starting and target actors;
* see remaining lives;
* search for actors;
* search for movies;
* select from TMDB search results;
* add valid actors and movies;
* continue until winning, losing or quitting.

The CLI was built to verify the complete game flow before implementing the web interface.

### FastAPI backend

The backend currently uses FastAPI.

Implemented endpoints include:

```text
GET  /
POST /games
GET  /games/{game_id}

GET  /actors/search
GET  /movies/search

POST /games/{game_id}/actors
POST /games/{game_id}/movies
```

The API currently supports:

* creating a game;
* generating a UUID for each game;
* retrieving game state;
* actor search;
* movie search;
* submitting an actor;
* submitting a movie;
* retrieving updated lives and status;
* retrieving the player-created path;
* returning `404` for unknown game IDs.

Games are currently stored in memory:

```python
games: dict[str, Game] = {}
```

Game data is therefore removed whenever the backend restarts. Database persistence will be added later.

### Automated tests

The project uses `pytest`.

Tests currently cover:

* initial game state;
* valid actor additions;
* invalid actor additions;
* valid movie additions;
* invalid movie additions;
* duplicate handling;
* life deduction;
* loss detection;
* victory detection;
* BFS connectivity;
* route reconstruction;
* bidirectional edges;
* bipartite graph integrity;
* disconnected actors;
* identical start and target actors.

The latest confirmed test run contained:

```text
24 passed
```

## Technology stack

### Backend

* Python
* FastAPI
* Pydantic
* Requests
* python-dotenv
* pytest

### Frontend

* React
* Vite
* JavaScript
* Fetch API

### External service

* TMDB API

### Planned later

* PostgreSQL
* SQLAlchemy
* database migrations
* caching
* Docker
* GitHub Actions
* cloud deployment

## Project structure

```text
ConnectTheActors/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── schemas.py
│   └── game_store.py
│
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   └── App.jsx
│   └── package.json
│
├── prototype/
│   ├── game.py
│   ├── main.py
│   └── tmdb_client.py
│
├── tests/
│   ├── test_game.py
│   └── test_search.py
│
├── .env
├── .env.example
├── .gitignore
└── README.md
```

The exact frontend structure will evolve as components and pages are added.

## Local setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd ConnectTheActors
```

### 2. Create a Python virtual environment

Windows:

```bash
python -m venv .venv
.venv\Scripts\activate
```

macOS or Linux:

```bash
python -m venv .venv
source .venv/bin/activate
```

### 3. Install backend dependencies

```bash
pip install fastapi requests python-dotenv pytest
```

Alternatively, when a dependency file is available:

```bash
pip install -r requirements.txt
```

### 4. Configure TMDB

Create a `.env` file in the project root:

```text
TMDB_ACCESS_TOKEN=your_tmdb_access_token
```

Do not commit the `.env` file.

An `.env.example` file should contain:

```text
TMDB_ACCESS_TOKEN=
```

### 5. Run the tests

From the project root:

```bash
pytest
```

### 6. Run the command-line prototype

```bash
python -m prototype.main
```

### 7. Run the FastAPI backend

```bash
fastapi dev app/main.py
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

### 8. Run the React frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

Both the backend and frontend must be running during local development.

## API examples

### Create a game

```http
POST /games
```

Request:

```json
{
  "start_actor_id": 2037,
  "target_actor_id": 85
}
```

Example response:

```json
{
  "game_id": "generated-uuid",
  "start_actor_id": 2037,
  "target_actor_id": 85,
  "lives": 3,
  "status": "playing",
  "actor_ids": [
    2037,
    85
  ],
  "movie_ids": [],
  "player_path": null
}
```

### Search for actors

```http
GET /actors/search?query=Cillian%20Murphy
```

### Search for movies

```http
GET /movies/search?query=Oppenheimer
```

### Submit a movie

```http
POST /games/{game_id}/movies
```

Request:

```json
{
  "movie_id": 872585
}
```

### Submit an actor

```http
POST /games/{game_id}/actors
```

Request:

```json
{
  "actor_id": 17838
}
```

## Architecture

```text
React frontend
       |
       | HTTP / JSON
       v
FastAPI backend
       |
       ├── in-memory game store
       ├── game-domain logic
       ├── BFS and path reconstruction
       └── TMDB client
               |
               v
             TMDB
```

The React frontend does not call TMDB directly.

This ensures that:

* the TMDB token remains private;
* game validation happens on the backend;
* API responses can use stable application-specific formats;
* caching can later be introduced centrally.

## Current frontend milestone

The current frontend milestone is the start screen.

The player should be able to:

1. search for a starting actor;
2. choose a result;
3. search for a target actor;
4. choose a result;
5. create a new game;
6. receive and store the generated game ID;
7. proceed to the game screen.

The first actor search box and frontend API helper are currently being implemented.

## Planned roadmap

### Phase 1 — Core prototype

* [x] Actor and movie graph representation
* [x] Actor validation
* [x] Movie validation
* [x] Lives and status transitions
* [x] BFS connection detection
* [x] Player-path reconstruction
* [x] Automated tests
* [x] TMDB search and credit helpers
* [x] Interactive command-line prototype

### Phase 2 — Backend API

* [x] Create games
* [x] Retrieve game state
* [x] Search actors
* [x] Search movies
* [x] Submit actors
* [x] Submit movies
* [x] CORS configuration
* [ ] Consistent error responses
* [ ] API-specific tests
* [ ] Improved response schemas
* [ ] Game-state persistence

### Phase 3 — React frontend

* [x] Vite project setup
* [ ] Starting-actor search
* [ ] Target-actor search
* [ ] Game creation
* [ ] Game screen
* [ ] Actor submission
* [ ] Movie submission
* [ ] Lives display
* [ ] Current graph or route display
* [ ] Win screen
* [ ] Loss screen

### Phase 4 — Shortest-path solution

* [ ] Define manageable TMDB graph-expansion rules
* [ ] Implement lazy BFS over TMDB data
* [ ] Add caching
* [ ] Add search limits and timeout handling
* [ ] Reveal a shortest known route at game end
* [ ] Compare the player route with the shortest route

### Phase 5 — Production readiness

* [ ] PostgreSQL
* [ ] SQLAlchemy
* [ ] Database migrations
* [ ] Docker
* [ ] Continuous integration
* [ ] Deployment
* [ ] Production documentation

## MVP scope

The first release will support:

* actors;
* films;
* single-player games;
* three lives;
* actor and film search;
* graph creation;
* player-route reconstruction;
* shortest-path reveal after the game;
* basic automated testing;
* deployment.

The first release will not include:

* television series;
* user accounts;
* multiplayer;
* leaderboards;
* achievements;
* daily challenges;
* social sharing;
* complex animated graph visualisations.
