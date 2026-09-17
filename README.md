<div align="center">
  <img src="public/porkast-text-logo-white.jpg" alt="Porkast Logo" width="400" />
  <h3>Discover, Subscribe, Share - Your Personalized Podcast Platform</h3>

  [![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare)](https://pages.cloudflare.com/)
  [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

---

## Overview

**Porkast** is a podcast exploration and management platform. The frontend is a pure **React** application built with **Vite**, while all backend logic (authentication, search, subscriptions, playlists, RSS) is handled by **porkast-svc** — a Cloudflare Workers service.

Users can discover new content, curate personal playlists, subscribe to keywords, and generate custom RSS feeds compatible with any standard podcast player.

## Key Features

- **Advanced Discovery**: Search millions of podcasts via the iTunes Apple Podcasts API.
- **Smart Subscriptions**: Subscribe to keywords to automatically track new matching episodes.
- **Personalized Playlists**: Create, manage, and share custom podcast playlists.
- **Listen Later**: A dedicated queue for episodes to catch up on.
- **RSS Feed Generation**: Turn subscriptions, playlists, and "Listen Later" queue into personal RSS feeds (Overcast, Pocket Casts, etc.).
- **Telegram Integration**: Full-featured [Telegram Bot](https://t.me/PorkcastBot) to manage podcast life on the go.
- **Modern UI**: Clean, responsive design with dark/light mode support.

## Tech Stack

- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Framework**: [React 19](https://react.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [DaisyUI v5](https://daisyui.com/)
- **Audio Engine**: [Shikwasa](https://github.com/the-mugen/shikwasa)
- **Backend**: [porkast-svc](https://github.com/Porkast/porkast-svc) (Hono / D1 / Drizzle ORM)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/your-username/porkast.git
cd porkast
npm install
```

### Environment Variables

Create a `.env` file:

```bash
VITE_API_BASE_URL=https://api.porkast.com/api
VITE_PAYMENTS_ENABLED=true
```

`VITE_PAYMENTS_ENABLED` controls the Dodo Payments checkout UI. It is set in `.env.production` for production builds and in `.env.development` for local development; when unset it defaults to disabled.

### Development

```bash
npm run dev
```

Open the URL shown in terminal (default http://localhost:5173).

### Build

```bash
npm run build        # TypeScript check + production build
```

### Deploy to Cloudflare Pages

```bash
npm run deploy
```

## Project Structure

```
├── src/
│   ├── pages/           # Route page components
│   │   ├── playlist/    # Playlist pages
│   │   └── subscription/# Subscription pages
│   ├── component/       # Reusable React UI components
│   ├── libs/            # API client libraries (calls porkast-svc)
│   ├── types/           # TypeScript type definitions
│   ├── hooks/           # Custom React hooks
│   ├── App.tsx          # Root component with routing
│   ├── App.css          # Global styles
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── vite.config.ts       # Vite configuration
├── wrangler.jsonc       # Cloudflare Pages config
└── index.html           # HTML entry point
```

## Telegram Bot

Porkast is also available as a Telegram Bot. Search podcasts, manage subscriptions, and share episodes directly in Telegram at [@PorkcastBot](https://t.me/PorkcastBot).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Developed with ❤️ for the Podcast Community.
</div>
