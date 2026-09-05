# Shaktiworld

React + Node.js rebuild of [shaktiworld.org](https://shaktiworld.org/), with the original content and a refreshed editorial design.

## Pages copied from the live site

- Home
- Our Work (including featured authors Suhani Srivastava and Vinita Pande)
- Our Events (all five published gatherings)
- Work With Us
- Contact Us
- Register
- Log in

## Design updates

The original WordPress/Elementor charity theme is replaced with a custom layout:

- Burgundy, gold, and cream palette inspired by Shakti (Durga, Lakshmi, Saraswati)
- Editorial serif headlines (Cormorant Garamond) with a clean sans body (Outfit)
- Full-bleed photography from the original site
- Working contact and application forms
- Clerk authentication for Log in and Register

## Authentication (Clerk)

Sign-in and sign-up are handled by [Clerk](https://clerk.com/docs/react/getting-started/quickstart).

- Frontend: `@clerk/react` with `VITE_CLERK_PUBLISHABLE_KEY` in `client/.env.local`
- Backend: `@clerk/express` with `CLERK_SECRET_KEY` in `server/.env`

## Run locally

```bash
npm install
npm run install:all
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

- Frontend: Vite + React on port 5173
- Backend: Express API on port 5000 (`/api/contact`, `/api/applications`, `/api/me`)

Submissions are stored as JSON files in `server/data/`.

## Production build

```bash
npm run build
npm start
```

The Express server will serve the built client from `client/dist`.
