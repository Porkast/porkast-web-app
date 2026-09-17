# Porkast - Personalized Podcast Discovery Platform

## Project Overview

Porkast is a modern podcast discovery and management platform built with **Vite + React**, backed by **porkast-svc** (Cloudflare Workers / Hono / D1). Users can discover, subscribe, share, and manage personalized podcast content. The platform supports keyword search, playlist creation, listen later functionality, and Telegram Bot integration.

## Tech Stack

### Frontend

- **Vite 7** - Build tool and dev server with HMR
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript superset
- **React Router v7** - Client-side routing
- **Tailwind CSS v4** - Utility-first CSS framework (via `@tailwindcss/vite`)
- **DaisyUI v5** - Component library based on Tailwind CSS

### Backend

All backend logic is provided by **porkast-svc** — a Cloudflare Workers service built with Hono, Drizzle ORM, and D1 (SQLite). This project is a pure **client-side** frontend that communicates with porkast-svc via REST APIs.

Key backend capabilities:
- **Email OTP Auth** - Bearer session tokens
- **iTunes Apple Podcasts API** - Podcast search & metadata
- **RSS Feed** - Parsing, generation, and CORS proxy
- **Membership/Tier Management** - Free / Pro / Unlimited keyword limits

### Other Key Dependencies

- **Shikwasa** - Audio player component
- **html-react-parser** - Parse HTML strings to React elements
- **UUID** - Client-side ID generation (v4/v5)
- **react-xml-viewer** - RSS XML source viewer
- **react-helmet** - Document head management

## Project Structure

```
/workspaces/porkast-next-app/
├── src/
│   ├── pages/                # Route page components
│   │   ├── playlist/         # Playlist pages
│   │   └── subscription/     # Subscription pages
│   ├── component/            # Reusable React UI components
│   ├── libs/                 # API client libraries (porkast-svc)
│   ├── types/                # TypeScript type definitions
│   ├── hooks/                # Custom React hooks
│   ├── assets/               # Static assets
│   ├── App.tsx               # Root component with React Router routes
│   ├── App.css               # Global styles (Tailwind v4 + DaisyUI)
│   └── main.tsx              # Application entry point
├── public/                   # Static assets (images, redirects)
├── dist/                     # Build output (gitignored)
├── vite.config.ts            # Vite configuration
├── wrangler.jsonc            # Cloudflare Pages deployment config
└── index.html                # HTML entry point
```

## Core Features

### 1. Podcast Discovery & Search
- Keyword-based podcast search via iTunes API
- Multi-source podcast content aggregation
- Exclude specific sources from search results

### 2. Subscription Management
- Keyword subscriptions (periodically updated by porkast-svc background jobs)
- Subscribe to other users' Listen Later lists
- Exclude specific feeds functionality

### 3. Playlists
- Create and manage personalized playlists
- Share playlist as public RSS feed
- Cross-device synchronization via RSS

### 4. Listen Later
- Quickly save interesting content
- Queue management with pagination
- Share as public RSS feed

### 5. Social Features
- RSS feed sharing (subscriptions, playlists, listen later)
- Subscribe to other users' Listen Later lists
- Telegram Bot integration (@PorkcastBot)

## API Endpoints (porkast-svc)

All API endpoints are documented in the porkast-svc project. Key prefixes:
- `/api/auth/email-otp/*` - Email OTP authentication
- `/api/user/*` - User management
- `/api/subscribe/*` - Keyword subscriptions
- `/api/playlist/*` - Playlist CRUD
- `/api/listenlater/*` - Listen later CRUD
- `/api/rss/*` - RSS feed generation & CORS proxy
- `/api/membership/*` - Membership/tier management

## Development Environment Setup

### Environment Variables

Create a `.env` file (copy from `.env.sample`):

```bash
# API Base URL for porkast-svc backend
VITE_API_BASE_URL=https://api.porkast.com/api
# Enable the Dodo Payments checkout UI (production sets this in .env.production)
VITE_PAYMENTS_ENABLED=true
```

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Visit the URL shown in terminal (default http://localhost:5173).

## Build & Deployment

### Production Build

```bash
npm run build        # TypeScript check + Vite production build
```

### Cloudflare Pages Deployment

```bash
npm run deploy       # wrangler pages deploy
```

The project includes `wrangler.jsonc` and `public/_redirects` for SPA routing on Cloudflare Pages.

## Development Guidelines

### Code Style
- Use TypeScript for type-safe development
- Follow ESLint configuration (flat config in eslint.config.js)
- Use Tailwind CSS + DaisyUI for styling
- All components are functional React components

### Commit Convention
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `style:` Code formatting adjustments
- `refactor:` Code refactoring
- `chore:` Build process or auxiliary tool changes

### Debugging & Testing
```bash
npm run lint          # Code linting (ESLint)
npm run build         # TypeScript check + production build
```

## Authentication

Uses a custom Email OTP authentication flow via porkast-svc:
- **Request Code**: `POST /api/auth/email-otp/request` - sends 6-digit OTP to email
- **Verify Code**: `POST /api/auth/email-otp/verify` - validates code, returns session token
- **Session**: Bearer token stored in `localStorage`, sent via `Authorization` header

## Extended Features

### Telegram Bot
Search podcasts, manage subscriptions, and share episodes via @PorkcastBot on Telegram.

### RSS Subscription
Each user's content (subscriptions, playlists, listen later) is exposed as a public RSS feed, compatible with any podcast player.

## Contributing Guidelines
1. Fork the project repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

## License
Distributed under the MIT License. See `LICENSE` for more information.

## Contact
- Project Homepage: [https://github.com/Porkast/porkast-next-app](https://github.com/Porkast/porkast-next-app)
- Telegram Bot: [@PorkcastBot](https://t.me/PorkcastBot)
- Issue Feedback: [GitHub Issues](https://github.com/Porkast/porkast-next-app/issues)
