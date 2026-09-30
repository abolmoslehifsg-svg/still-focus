# Still — Focus & Relax

A full-screen cinematic focus and relaxation app. A minimal, immersive digital
sanctuary for concentration, studying, reading, working, meditation, or simply
relaxing.

Built with **React + TypeScript + Vite**, **Tailwind CSS**, **Framer Motion**,
and **lucide-react**.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL.

> Node.js 18+ is required. If `npm` is not found, install Node.js from
> https://nodejs.org and restart your terminal.

## What it does

- Choose a focus duration (15 / 25 / 45 / 60 minutes, or a custom value)
- Start, pause, resume, and reset a countdown timer
- Pick from 8 ambient sound categories, or upload your own audio file
- Adjust ambient volume, or mute without stopping the session
- A soft, glass-like chime sounds once when the session completes
- Focus mode gently fades the navigation and hero while a session runs
- A subtle circular progress ring tracks the session

## Audio architecture

All audio flows through `src/audio/engine.ts`:

- A single shared `AudioContext`, created lazily after the first user gesture
  to respect browser autoplay restrictions.
- Built-in sounds and uploaded files play through HTML5 `<audio>` elements,
  routed through a shared master gain so one volume control governs everything.
- Built-in sounds in `src/sounds.ts` currently have empty `src` values, so the
  engine falls back to procedurally synthesized ambient textures (Web Audio).
  **Insert real audio URLs in `src/sounds.ts` and file playback takes over
  automatically — no component changes needed.**
- Uploaded files are loaded via `URL.createObjectURL` and stay entirely local.
  Nothing is sent to a server.

## Project structure

```
still-focus/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── still.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── sounds.ts
    ├── audio/
    │   └── engine.ts
    └── components/
        ├── VideoBackground.tsx
        ├── Navigation.tsx
        ├── StaggeredFade.tsx
        ├── ProgressRing.tsx
        ├── FocusTimer.tsx
        └── SoundPanel.tsx
```
