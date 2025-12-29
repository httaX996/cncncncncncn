# 🎬 StreamFlix - Open Source Streaming Platform

A modern, feature-rich streaming platform template built with React, TypeScript, and Vite. Fork this project to create your own movie and TV show streaming site.

> **Note**: This is a template project. You need to configure your own TMDB API key and embed servers.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Required: Get your free API key at https://themoviedb.org/settings/api
VITE_TMDB_API_KEY=your_tmdb_api_key_here

# Optional: Sports streaming API
VITE_SPORTS_API_URL=

# Optional: Custom branding
VITE_APP_NAME=StreamFlix
VITE_LOGO_URL=
```

### 3. Configure Streaming Servers

Edit `src/config/servers.ts` to add your embed server URLs:

```typescript
export const STREAMING_SERVERS: StreamingServer[] = [
  {
    id: 'myserver',
    name: 'My Server',
    description: 'Primary streaming',
    isActive: true,
    movieUrlTemplate: 'https://your-server.com/movie/{tmdbId}',
    tvUrlTemplate: 'https://your-server.com/tv/{tmdbId}/{season}/{episode}',
  },
]
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## ✨ Features

- **Modern UI/UX** - React + Tailwind CSS, mobile-first design
- **Progressive Web App** - Installable with offline support
- **Smooth Animations** - Framer Motion transitions
- **Type-Safe** - Full TypeScript
- **Theme Support** - Multiple color themes
- **SEO Ready** - React Helmet for meta tags

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| Core | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Framer Motion |
| Routing | React Router DOM |
| HTTP | Axios |
| PWA | Vite Plugin PWA, Workbox |

## 📁 Key Files to Configure

| File | Purpose |
|------|---------|
| `.env` | API keys and app config |
| `src/config/servers.ts` | Streaming server URLs |
| `src/config/themes.ts` | Color themes |

## 📋 Available Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production
npm run lint     # Run ESLint
```

## ⚠️ Disclaimer

This is a template for educational purposes. The developers are not responsible for how this software is used. Ensure you comply with all applicable laws and terms of service when configuring streaming sources.

---

## 📄 License

MIT License - feel free to use and modify for your own projects.