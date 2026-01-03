Docker tips

To build and run the full stack (DB + backend + frontend) locally using Docker Compose:

1) Ensure `backend/.env` contains DB credentials (or create `.env` from `.env.example`).

2) From the `backend` folder, run:

   docker compose up --build

This will:
- start Postgres (db service)
- build and run the backend on port 5000
- build and serve the frontend on port 3000 (via nginx)

Development mode (hot reload for backend using nodemon):

- Use the development compose override which mounts your source and runs `nodemon`:

  docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

Notes:
- The frontend `REACT_APP_API_URL` is set to `http://localhost:5000` in the compose file for local development.
- To stop: `docker compose down` (or add `-f docker-compose.dev.yml` to match the command used to start).
