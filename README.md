# Personal Portfolio Website

This repository contains an advanced full-stack personal portfolio website built with:

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express.js
- Database: MongoDB
- Deployment-ready Express server

## Features

- Responsive portfolio UI for internship-ready presentation
- Dynamic project listing loaded from MongoDB
- Project filters by type and category
- Contact form that posts to the backend and stores messages
- Live summary API with project count and message count
- Full static site served by Express

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from the example:

```bash
copy .env.example .env
```

3. Update `.env` if needed:

```text
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio
ADMIN_PASSWORD=admin123
```

## Run locally

```bash
npm run dev
```

Then open `http://localhost:5000` in your browser.

## Deployment

This project is ready for deployment to platforms such as Heroku, Vercel, or Render. Make sure your environment includes the `MONGODB_URI` and `ADMIN_PASSWORD` variables.

## Admin Dashboard

The portfolio now includes a React-powered admin dashboard that can manage project entries and view contact messages.

- Log in using the password configured with `ADMIN_PASSWORD`.
- Create, update, and delete portfolio projects.
- View submitted contact messages from the dashboard.

## API Endpoints

- `GET /api/projects` - returns project data
- `GET /api/projects?tag=Backend` - returns filtered projects by tag
- `GET /api/summary` - returns project count, message count, server uptime
- `POST /api/contact` - stores contact messages
- `GET /api/profile` - returns profile metadata
- `POST /api/admin/login` - verify admin password
- `POST /api/projects` - create a new project (admin only)
- `PUT /api/projects/:id` - update a project (admin only)
- `DELETE /api/projects/:id` - delete a project (admin only)
- `GET /api/messages` - list contact messages (admin only)

## Notes

- MongoDB is required to seed and load live project data.
- If MongoDB is unavailable, the server will still start but project data may not load.
- Use `npm run dev` for fast local development.
Updated portfolio website
