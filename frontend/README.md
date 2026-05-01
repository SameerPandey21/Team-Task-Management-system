# Team Task Management — Frontend

React + Vite frontend for the Team Task Management app.

## Stack

- **React 18** with hooks and context
- **Vite** for fast dev server and bundling
- **React Router v6** for client-side routing
- **Lucide React** for icons
- **Vanilla CSS** with CSS custom properties

## Development

```bash
npm install
npm run dev       # starts at http://localhost:5173
```

> Make sure the backend is running on port 5000 before starting the frontend.

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

## Environment

The API base URL is configured in `src/utils/api.js`. By default it points to `http://localhost:5000/api`.

## Project Structure

```
src/
├── pages/
│   ├── Dashboard.jsx       # Stats and project overview
│   ├── Projects.jsx        # Project list and creation
│   ├── ProjectDetails.jsx  # Kanban board, members, task management
│   ├── MyTasks.jsx         # Tasks assigned to current user
│   ├── Login.jsx
│   └── Signup.jsx
├── context/
│   └── AuthContext.jsx     # Global auth state
├── utils/
│   └── api.js              # Authenticated fetch wrapper
├── App.jsx                 # Routes
└── index.css               # Global design system / CSS vars
```

See the root [README.md](../README.md) for full setup and usage instructions.
