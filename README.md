# Connect the Actors

Connect the Actors is a full-stack graph-building game where the player attempts to connect two actors through films and co-stars.

The project was developed as a portfolio application to demonstrate software engineering skills including graph modelling, breadth-first search, API integration, backend development, automated testing, frontend development and cloud deployment.

## Live demo

Frontend:

https://connect-the-actors.vercel.app

Backend API:

https://connect-the-actors-api.onrender.com

Interactive FastAPI documentation:

https://connect-the-actors-api.onrender.com/docs

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

A movie can only be added if at least one actor already present in the player's graph appeared in that movie.

An actor can only be added if they appeared in at least one movie already present in the player's graph.

Invalid guesses cost one life.

The player wins when the starting and target actors become connected.

The game ends when the player either:

* creates a valid connection between the two actors; or
* loses all three lives.

## Current project status

Connect the Actors now has a complete playable web MVP.

The project currently includes:

* a tested Python game engine;
* TMDB actor and movie integration;
* a FastAPI backend;
* a React and Vite frontend;
* an interactive React Flow graph;
* automatic Dagre graph layout;
* random actor challenges;
* three-life game logic;
* a live game timer;
* player-path reconstruction;
* successful-path highlighting;
* win and loss result screens;
* completion-time tracking;
* deployed frontend and backend services.

The main remaining gameplay feature is a global shortest-path reveal, which will show the fastest known connection between the two actors after the game ends.

## Current features

### Core game logic

The `Game` class supports:

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

Submissions can return one of the following outcomes:

```text
added
invalid
duplicate
game_finished
```

This allows the frontend to display specific feedback for each type of submission.

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

This allows traversal from actors to films and from films back to actors.

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

This means the player must manually construct the connection step by step.

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

Relevant methods include:

```python
find_player_path()
is_connected()
reconstruct_path()
```

BFS is appropriate because the graph is unweighted and the first discovered path between two nodes is a shortest path within the player's constructed graph.

### TMDB integration

The project uses the TMDB API for actor and movie information.

The current client supports functions including:

```python
search_person(name)
search_actors(name)
search_movies(title)
get_actor_movie_credits(actor_id)
get_actor_movie_credit_ids(actor_id)
get_movie_cast_ids(movie_id)
get_actor_details(actor_id)
get_movie_details(movie_id)
```

Actor and movie metadata includes information such as:

* TMDB ID;
* name or title;
* profile image;
* poster image;
* release date.

The TMDB API token is stored in an environment variable:

```text
TMDB_ACCESS_TOKEN
```

The token is never exposed to the frontend and must not be committed to Git.

### Random challenges

The start screen includes a random challenge option.

The backend selects two different actors from a curated pool of well-known actors.

The endpoint is:

```text
GET /actors/random
```

The frontend receives both actors with their metadata and can immediately use them as the start and target actors.

The random challenge does not automatically begin the game, allowing the player to reroll or manually replace either actor first.

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

The CLI was built before the web interface to verify the complete gameplay flow and domain logic independently from the frontend.

### FastAPI backend

The backend uses FastAPI.

Implemented endpoints include:

```text
GET  /
POST /games
GET  /games/{game_id}

GET  /actors/search
GET  /actors/random
GET  /movies/search

POST /games/{game_id}/actors
POST /games/{game_id}/movies
```

The API supports:

* creating a game;
* generating a UUID for each game;
* retrieving game state;
* actor search;
* movie search;
* random challenge generation;
* submitting actors;
* submitting movies;
* returning submission outcomes;
* retrieving updated lives and status;
* retrieving actor and movie metadata;
* retrieving graph nodes and edges;
* retrieving the player-created route;
* returning `404` for unknown game IDs.

The API returns graph data in a frontend-friendly format.

Example graph node:

```json
{
  "type": "actor",
  "id": 2037,
  "name": "Cillian Murphy",
  "image_path": "/example.jpg"
}
```

Example graph edge:

```json
{
  "from_type": "actor",
  "from_id": 2037,
  "to_type": "movie",
  "to_id": 872585
}
```

Games are currently stored in memory:

```python
games: dict[str, Game] = {}
```

Actor and movie metadata are also cached in memory per game.

This means active game state is removed whenever the backend process restarts.

Persistent database storage is planned as a future improvement.

### React frontend

The web interface currently supports:

* searching for a starting actor;
* searching for a target actor;
* generating random actor challenges;
* creating games through the FastAPI backend;
* searching for actors during the game;
* searching for movies during the game;
* submitting actor guesses;
* submitting movie guesses;
* displaying remaining lives;
* displaying current game status;
* displaying a live game timer;
* showing the start and target actors;
* displaying submission feedback;
* rendering the player-created graph;
* automatically laying out graph nodes;
* highlighting the successful player route;
* displaying win and loss states;
* displaying the completed route;
* displaying completion time;
* replaying a game;
* returning to the main menu;
* quitting mid-game by clicking the application logo.

The frontend communicates only with the FastAPI backend.

It never calls TMDB directly.

### Interactive graph

The player's graph is displayed using React Flow.

Actor and movie nodes use different visual styles:

```text
Actor nodes → green
Movie nodes → orange
```

The graph uses Dagre to calculate an automatic left-to-right layout.

The graph supports:

* zooming;
* panning;
* dragging nodes;
* minimap navigation;
* React Flow controls.

When the player wins:

* nodes in the successful route remain fully visible;
* unrelated nodes are faded;
* successful-route edges are highlighted;
* successful-route edges are animated.

This allows the player to visually see how their completed connection was constructed.

### Game timer

Each game includes a live timer.

The timer begins when the game starts and stops automatically when the game status changes from:

```text
playing
```

to either:

```text
won
```

or:

```text
lost
```

The win screen displays the player's final completion time.

Example:

```text
Completed in 1:42
```

### Win and loss screens

When a game ends, the frontend displays a dedicated result screen.

On a win, the player sees:

* a success message;
* their completion time;
* the full route they created;
* actor and movie images;
* options to play again or return to the main menu.

On a loss, the player sees:

* a game-over message;
* their attempted graph;
* replay and navigation options.

A future version will also display the global shortest connection after both wins and losses.

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
* identical start and target actors;
* prevention of submissions after game completion.

The latest confirmed full test run contained:

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
* Uvicorn
* pytest

### Frontend

* React
* Vite
* JavaScript
* Fetch API
* React Flow
* Dagre

### External service

* TMDB API

### Deployment

* Vercel
* Render

### Planned later

* PostgreSQL
* SQLAlchemy
* database migrations
* caching
* Docker
* GitHub Actions

## Project structure

```text
ConnectTheActors/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── schemas.py
│   ├── game_store.py
│   └── famous_actors.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActorMovieNode.jsx
│   │   │   ├── ActorSearch.jsx
│   │   │   ├── GameHeader.jsx
│   │   │   ├── GameResult.jsx
│   │   │   ├── GameScreen.jsx
│   │   │   ├── GraphBoard.jsx
│   │   │   └── Lives.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── index.css
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
├── .python-version
├── requirements.txt
└── README.md
```

## Architecture

```text
React frontend
      |
      | HTTPS / JSON
      v
FastAPI backend
      |
      ├── in-memory game store
      ├── game-domain logic
      ├── BFS and path reconstruction
      ├── graph-response builder
      └── TMDB client
              |
              | HTTPS
              v
             TMDB
```

The deployed architecture is:

```text
User
 |
 v
Vercel
React frontend
 |
 | HTTPS
 v
Render
FastAPI backend
 |
 | HTTPS
 v
TMDB API
```

The React frontend does not call TMDB directly.

This ensures that:

* the TMDB access token remains private;
* game validation happens on the backend;
* game rules cannot be bypassed by the frontend;
* API responses can use stable application-specific formats;
* caching can later be introduced centrally.

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

Alternatively:

```bash
uvicorn app.main:app --reload
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

## Frontend environment variables

The frontend uses:

```text
VITE_API_BASE_URL
```

In local development, the application falls back to:

```text
http://127.0.0.1:8000
```

In production, Vercel uses:

```text
VITE_API_BASE_URL=https://connect-the-actors-api.onrender.com
```

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

### Search for actors

```http
GET /actors/search?query=Cillian%20Murphy
```

### Generate a random challenge

```http
GET /actors/random
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

Submission results can be:

```text
added
invalid
duplicate
game_finished
```

## Deployment

### Backend

The FastAPI backend is deployed to Render.

The Render build command is:

```bash
pip install -r requirements.txt
```

The production start command is:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

The TMDB access token is configured as a Render environment variable.

### Frontend

The React frontend is deployed to Vercel.

The Vercel project uses:

```text
frontend/
```

as its root directory.

The production API URL is provided using:

```text
VITE_API_BASE_URL
```

### CORS

The FastAPI backend explicitly allows the deployed Vercel frontend origin.

For example:

```python
allow_origins=[
    "http://localhost:5173",
    "https://connect-the-actors.vercel.app",
]
```

## Development decisions

### Why a bipartite graph?

Actors and movies represent two fundamentally different entity types.

Using separate actor and movie nodes guarantees that valid routes always alternate:

```text
Actor → Movie → Actor
```

This also prevents invalid direct actor-to-actor or movie-to-movie edges.

### Why breadth-first search?

The game graph is unweighted.

Breadth-first search explores nodes level by level, making it appropriate for:

* checking connectivity;
* reconstructing player routes;
* finding shortest routes in an unweighted graph.

### Why keep TMDB access on the backend?

The frontend never receives the TMDB API token.

This provides:

* improved security;
* centralised validation;
* consistent data formatting;
* future caching support;
* separation between external API logic and frontend presentation.

### Why build a CLI first?

The command-line prototype made it possible to test the complete game rules before introducing:

* HTTP;
* React;
* asynchronous requests;
* UI state;
* graph visualisation.

This helped keep domain logic separate from presentation logic.

### Why React Flow and Dagre?

React Flow provides interactive graph rendering, while Dagre calculates automatic node positions.

The game logic and graph visualisation therefore remain separate:

```text
Backend
→ decides which nodes and edges exist

Frontend
→ decides how those nodes and edges are displayed

Dagre
→ calculates their layout
```

## Roadmap

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
* [x] Random actor challenges
* [x] Submit actors
* [x] Submit movies
* [x] Submission-result responses
* [x] CORS configuration
* [x] Graph-node responses
* [x] Graph-edge responses
* [x] Enriched actor and movie metadata
* [ ] Consistent external API error responses
* [ ] API-specific integration tests
* [ ] Persistent game-state storage

### Phase 3 — React frontend

* [x] Vite project setup
* [x] Starting-actor search
* [x] Target-actor search
* [x] Random challenge generation
* [x] Game creation
* [x] Game screen
* [x] Actor submission
* [x] Movie submission
* [x] Lives display
* [x] Submission feedback
* [x] Interactive graph
* [x] Automatic Dagre layout
* [x] Player-path highlighting
* [x] Live timer
* [x] Completion-time display
* [x] Win screen
* [x] Loss screen
* [x] Replay flow
* [x] Main-menu navigation
* [x] Responsive layout improvements

### Phase 4 — Shortest-path solution

* [ ] Define manageable TMDB graph-expansion rules
* [ ] Implement external graph BFS
* [ ] Add TMDB request caching
* [ ] Add search-depth limits
* [ ] Add timeout handling
* [ ] Reveal the shortest known route at game end
* [ ] Compare the player route with the shortest route
* [ ] Introduce challenge difficulty levels

### Phase 5 — Production readiness

* [x] Deploy FastAPI backend
* [x] Deploy React frontend
* [x] Production environment variables
* [x] Production CORS configuration
* [ ] PostgreSQL
* [ ] SQLAlchemy
* [ ] Database migrations
* [ ] Docker
* [ ] GitHub Actions
* [ ] API integration tests
* [ ] Improved production error handling
* [ ] Final mobile testing
* [ ] Final project documentation

## MVP scope

The current release supports:

* actors;
* films;
* single-player games;
* three lives;
* actor and film search;
* random actor challenges;
* graph creation;
* interactive graph visualisation;
* player-route reconstruction;
* path highlighting;
* game timer;
* win and loss screens;
* automated testing;
* cloud deployment.

The main remaining MVP feature is:

* shortest-path reveal after the game.

Potential future features include:

* difficulty-based random challenges;
* PostgreSQL persistence;
* leaderboards;
* best completion times;
* daily challenges;
* user accounts;
* achievements;
* multiplayer;
* social sharing;
* television series.
