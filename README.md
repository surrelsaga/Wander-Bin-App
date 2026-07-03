# 🦀 Wander-Bin — Smart Recycling Robot Web App

A mobile-first web prototype for the CRAB-E smart recycling robot, designed for HDB residents in Singapore. Built as a Wizard-of-Oz prototype for user testing.

🔗 **Live app:** https://wanderbin-app.vercel.app/

## Features

- **Summon** — Browse nearby bots and request one to your location
- **En Route** — Animated robot approach with progress ring (12s simulation)
- **Scan** — Live rear camera feed with viewfinder overlay for item scanning
- **Result** — Recyclable → hand-wave → lid opens → disposal confirmation
- **Reject** — Not recyclable → locked lid → disposal guidance
- **Departure** — Robot returns to base animation
- **Audio/Haptic** — Sound chimes + vibration for all key interactions

## Tech Stack

- **React 18** + **Vite 5** — fast dev and build
- **Vercel serverless function** (`api/identify.js`) — proxies Gemini so the API key stays server-side, never shipped to the browser
- **Google Gemini AI** (`@google/generative-ai`, `gemini-2.5-flash`) — image-based recyclable detection
- **ESP32 integration** — lid control commands over HTTP (optional hardware)
- **CSS-in-JS** (inline styles) — no external CSS framework needed
- **Web Audio API** — synthesized sound effects
- **getUserMedia** — device camera access (requires a secure context: HTTPS or `localhost`)
- **Vibration API** — haptic feedback on supported devices

## Prerequisites

- **Node.js 18+** (tested with Node 20) — [download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** — [download](https://git-scm.com/)
- A **Google Gemini API key** — [get one free](https://aistudio.google.com/apikey)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/surrelsaga/Wander-Bin-App.git
cd Wander-Bin-App
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open the `.env` file and fill in your values:

```dotenv
# Required — your Gemini API key. Used ONLY by the serverless function (api/identify.js).
# No VITE_ prefix on purpose, so Vite never bundles it into the browser.
GEMINI_API_KEY=your_gemini_api_key_here

# Optional — URL of the ESP32 lid-control server
VITE_ESP32_URL=/api/esp32
```

> **Note:** The app works without an ESP32 server — lid commands will simply log a warning to the console if the server is unreachable.

### 4. Start the development server

The scan feature calls `/api/identify`, which only exists when the serverless function is running. Two options:

```bash
npm run dev        # UI only — everything works EXCEPT the AI scan (no /api)
```

```bash
vercel dev         # full app incl. the /api/identify function (recommended)
```

Then open the URL shown in the terminal (e.g. `http://localhost:5173`).

> **Camera access:** Browsers treat `localhost` as a secure context, so camera (`getUserMedia`) works without HTTPS during local development.

### 5. Build for production (optional)

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```

## Deploy to Vercel

The API key is kept server-side via the `api/identify.js` serverless function, so it is **never exposed to the browser**.

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com), **Add New → Project** and import the repo. Vercel auto-detects Vite (build `npm run build`, output `dist`).
3. Add an environment variable named **`GEMINI_API_KEY`** (⚠️ **no** `VITE_` prefix — that prefix would leak it to the client) under **Settings → Environment Variables**. Set it for Production/Preview/Development.
4. **Deploy.** Every future push to `main` auto-redeploys.

> **Changed the env var after deploying?** Vercel does not auto-redeploy on env changes. Go to **Deployments → ⋯ → Redeploy**, or push an empty commit: `git commit --allow-empty -m "redeploy" && git push`.

### Camera Access

✅ **Vercel serves over HTTPS** — camera access (`getUserMedia`) works out of the box.

⚠️ For **local development**, the dev server runs on `localhost` which browsers treat as a secure context, so camera also works locally.

## Project Structure

```
Wander-Bin-App/
├── index.html                  # Entry HTML
├── vite.config.js              # Vite config
├── package.json
├── .env.example                # Template for environment variables
├── api/
│   └── identify.js             # Vercel serverless fn — server-side Gemini call
└── src/
    ├── main.jsx                # React root
    ├── App.jsx                 # Screen router + state
    ├── styles/
    │   └── global.css          # Reset, keyframes, animations
    ├── utils/
    │   ├── colors.js           # CRAB-E color palette tokens
    │   ├── sounds.js           # Web Audio API chimes
    │   └── haptics.js          # Vibration API wrapper
    ├── services/
    │   ├── gemini.js           # Client-side: POSTs image to /api/identify
    │   └── esp32.js            # ESP32 lid-control HTTP client
    ├── components/
    │   ├── LEDFace.jsx         # Animated emoticon face (5 expressions)
    │   ├── CrabBot.jsx         # SVG crab robot illustration
    │   ├── BotCard.jsx         # Bot list item card
    │   ├── PulseDot.jsx        # Animated status dot
    │   ├── ProgressRing.jsx    # Circular progress indicator
    │   ├── ScanOverlay.jsx     # Camera viewfinder frame
    │   └── LidAnimation.jsx    # Bin lid open/close
    └── screens/
        ├── HomeScreen.jsx      # Bot list + summon CTA
        ├── EnRouteScreen.jsx   # Robot approaching animation
        ├── ScanScreen.jsx      # Camera + scan classification
        ├── RecyclableScreen.jsx    # ✅ Success flow
        ├── NotRecyclableScreen.jsx # ❌ Reject flow
        └── DepartureScreen.jsx     # Robot returns to base
```

## Troubleshooting

| Problem | Solution |
|---|---|
| `npm install` fails | Make sure you have Node.js 18+ installed (`node -v` to check) |
| Scan returns no results locally | Run `vercel dev` (not `npm run dev`) so the `/api/identify` function exists |
| Scan returns no results on Vercel | Verify `GEMINI_API_KEY` is set in Vercel env vars, then redeploy |
| Camera not working | Make sure you're on `localhost` or HTTPS; check browser permissions |
| ESP32 warnings in console | This is normal if you don't have an ESP32 server running — the app still works |

## Notes

- **Scan results** use Google Gemini AI (`gemini-2.5-flash`) for item classification, called through the server-side `api/identify.js` function
- **Robot movement** is simulated (Wizard-of-Oz) — no real hardware communication
- **Camera**: Uses rear camera by default; falls back with clear error message if denied
- Tested on iOS Safari 15+ and Chrome Android 10+
```

