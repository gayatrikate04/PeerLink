# Learn & Let Learn (L2L)

A full-stack social learning platform where users can connect, match by skills/interests, chat in real time, and join video sessions.

## Repository Structure

This repository currently contains two app folders:

- `L2FE/`: standalone frontend app (Vite + React)
- `LearnLetLearn/`: full-stack app containing backend and frontend

### Inside `LearnLetLearn/`

- `backend/`: Node.js + Express + MongoDB API with Socket.IO
- `frontend/`: Vite + React client with Tailwind CSS

## Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- Axios
- React Router
- Socket.IO Client

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- Socket.IO
- JWT/Auth utilities
- Firebase Admin (for configured integrations)

## Quick Start

## 1) Clone

```bash
git clone https://github.com/HarshalSonawane30/L2L.git
cd L2L/LearnLetLearn
```

## 2) Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `LearnLetLearn/backend`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Start backend:

```bash
npm start
```

Optional seed command (if needed):

```bash
npm run seed
```

## 3) Frontend Setup

Open a new terminal:

```bash
cd LearnLetLearn/frontend
npm install
npm start
```

Frontend default URL:

- `http://localhost:5173`

## Main Features

- User authentication (register/login)
- Profile and skills management
- Match and request flows
- Real-time chat
- Video session support

## Scripts

### Backend (`LearnLetLearn/backend`)

- `npm start`: start server with nodemon
- `npm run seed`: run seed script

### Frontend (`LearnLetLearn/frontend`)

- `npm start`: run Vite development server
- `npm run build`: build production assets

## API Documentation

- `LearnLetLearn/API_DOC.md`
- `LearnLetLearn/backend/API_DOC.md`

## Notes

- Do not commit real secrets in `.env` files.
- If you deploy frontend and backend separately, set `CLIENT_URL` and CORS accordingly.

## License

This project is for learning and development purposes.
