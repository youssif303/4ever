# 4Ever

4Ever is a calm wellbeing and self-reflection MVP. It helps people explain what happened, feel heard, reflect on what they are experiencing, and consider whether human support could help.

It is **not** an AI therapist, a diagnostic tool, or a replacement for professional mental-health care.

## What is included

- Supportive AI conversation with a modular safety check
- Local conversation history
- Mood check-ins with optional notes
- Therapist support request flow (stored locally in this MVP)
- Simple profile, privacy notice, and local-data deletion
- Responsive Expo UI for Android and web
- Development fallback when no OpenAI key is configured

## Architecture

The mobile/web app lives in `artifacts/4ever`. It uses Expo Router, TypeScript, AsyncStorage, and a small portable API client in `services/api.ts`.

The Express API lives in `artifacts/api-server`. `POST /api/chat` accepts a conversation ID, message, and recent context. The server calls OpenAI only when `OPENAI_API_KEY` is present; otherwise it returns a clearly marked development response so the UI can be tested without a key.

The frontend never contains an OpenAI key. Local persistence is isolated behind `services/storage.ts` so it can later be replaced by a PostgreSQL or Supabase repository.

## Requirements

- Node.js 20+
- npm 10+ or pnpm 10+
- Expo Go for Android development, or an Android emulator
- An OpenAI API key only if you want live AI responses

## Install

From the project root:

```bash
pnpm install
```

To export this artifact as a standalone project, copy the `artifacts/4ever` directory and install its dependencies with the generated package manifest.

## Environment variables

Copy `.env.example` to `.env` when running the backend locally:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.2
```

For the Expo client, `EXPO_PUBLIC_API_URL` is the API base URL used by a standalone local setup. In this workspace, the managed preview injects the API domain automatically.

## Run the frontend

```bash
pnpm --filter @workspace/4ever run dev
```

For a portable standalone copy:

```bash
npm install
npx expo start
```

## Run the backend

From the project root:

```bash
pnpm --filter @workspace/api-server run dev
```

The API listens on the workflow-provided `PORT` (port `5000` in a normal local setup). It exposes:

```text
POST /api/chat
```

Without `OPENAI_API_KEY`, the endpoint returns a safe development fallback. It never logs full conversation content.

## Run web

```bash
npx expo start --web
```

The web layout centers the app at a readable desktop width while remaining full-width on mobile.

## Run Android

```bash
npx expo start --android
```

With an Android emulator, `localhost` from the device may need to be replaced with `http://10.0.2.2:5000`. With a physical phone, use the computer's local network IP.

## Android build configuration

`eas.json` includes development, preview, and production profiles. The static `app.json` contains the Android package identifier and Expo Router configuration.

## Changing the AI system prompt

Edit `artifacts/api-server/src/services/ai.ts`. Keep the supportive-companion boundaries intact: no diagnosis, no therapist claims, no dependency cues, and real-world support when appropriate.

## Therapist requests

The request flow is implemented locally through `AppContext`. A request is saved with a pending status and is ready to migrate to `POST /api/therapist-request` when a secure professional-support workflow exists.

## Local storage

`services/storage.ts` stores conversations, messages, mood entries, profile details, and the therapist request under one versioned AsyncStorage key. Delete it from Profile → Delete my local data.

## Current MVP limitations

- No account system
- No production therapist routing
- No database sync between devices
- The safety check is a simple modular keyword layer, not a clinically validated safety system
- No payments, subscriptions, ads, social network, video calls, or diagnosis

## Future migration

Replace the repository functions in `services/storage.ts` with authenticated API calls backed by PostgreSQL or Supabase. Conversation and mood types are already separated from storage so the UI does not need to change.

## Security and privacy

- Never commit `.env` or an OpenAI key.
- Keep all AI credentials on the backend.
- Do not add analytics that capture conversation content.
- Review the placeholder privacy notice with a qualified lawyer before public launch.
- Add professional safety review before treating the safety layer as a launch-ready crisis system.