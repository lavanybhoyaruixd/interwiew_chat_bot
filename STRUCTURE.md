# Project Structure & Flowcharts

## Tech Chatbot Flow

User → `src/components/TechChatbot.jsx`
- Sends message → `src/api/groqAPI.js` (`streamChat`)
- POST `API_BASE/groq/stream` (SSE)

Backend → `backend/server.js`
- Mounts `backend/routes/groq.js`
- Streams via `services/aiService.js` (Groq client)
- Model: `llama-3.1-8b-instant`

Groq → returns streaming tokens
- `routes/groq.js` emits `data: { choices: [{ delta: { content } }] }`
- `groqAPI.js` appends chunks in `TechChatbot.jsx`

```mermaid
flowchart TD
	U[User] --> C1[TechChatbot.jsx]
	C1 --> A1[groqAPI.streamChat]
	A1 -->|POST SSE| R1[/api/groq/stream]
	R1 --> S1[Express server.js]
	S1 --> H1[routes/groq.js]
	H1 --> AI1[services/aiService.groq]
	AI1 --> M1[Groq model: llama-3.1-8b-instant]
	M1 -->|tokens| H1
	H1 -->|data:{delta.content}| A1
	A1 --> C1
```


## Resume Analysis Flow

User → Upload in `frontend/src/components/ResumeUploader.jsx` or `src/components/ResumeUploader.jsx`
- Calls backend `/api/resume/...`

Backend → `backend/routes/resume.js`
- Delegates to `services/resumeService.js`
- PDF extract (`pdf-parse`) → basic info
- AI JSON analysis via `aiService.groq.chat.completions.create(...)`

Return → Structured analysis JSON → frontend displays (`ResumeAnalyzer.jsx`)

```mermaid
flowchart TD
	U[User Upload] --> FU[ResumeUploader.jsx]
	FU -->|POST| BR[/api/resume/*]
	BR --> RS[resumeService.js]
	RS --> PDF[pdf-parse]
	RS --> AI2[aiService.groq]
	AI2 --> M2[Groq model]
	M2 --> RS
	RS --> FE[ResumeAnalyzer.jsx]
```

## Interview Chat (non-stream)

User → `src/api/chatAPI.js` → `/api/chat/ask`
Backend → `routes/chat.js` → `controllers/chatController.js`
- Topic gate via `enhancedAiService.checkIfInterviewRelated`
- Completion via shared Groq clients
- Returns formatted Markdown

```mermaid
flowchart TD
	U[User] --> A2[chatAPI.js]
	A2 -->|POST| RC[/api/chat/ask]
	RC --> CC[chatController.js]
	CC --> EA[enhancedAiService.checkIfInterviewRelated]
	CC --> AI3[aiService.groq or enhancedAiService.groq]
	AI3 --> M3[Groq model]
	M3 --> CC
	CC --> A2
```

## Backend Layout

`backend/server.js` — Express setup, CORS, rate limits, routes
`backend/routes/` — `auth.js`, `chat.js`, `groq.js`, `resume.js`, `jobs.js`, etc.
`backend/controllers/` — `chatController.js`, `resumeController.js`
`backend/services/` —
- `aiService.js` (Groq client, shared)
- `enhancedAiService.js` (prompts, topic gating)
- `resumeService.js` (PDF + Groq JSON analysis)
`backend/middleware/` — `auth.js`, `rateLimiter.js`, `requestTimeout.js`
`backend/models/` — `User.js`, `Question.js`, etc.
`backend/utils/` — `logger.js`, `ApiError.js`
`backend/uploads/` — resume files

## Frontend Layout (Vite React)

`src/App.jsx` — Routes (`/`, `/login`, `/chat`)
`src/components/TechChatbot.jsx` — Real-time chat UI
`src/api/groqAPI.js` — SSE streaming client
`src/api/base.js` — API base URL helper
`src/pages/ResumeAnalyzer/` — Analyzer page
`public/`, `dist/` — static and built assets

## Key Endpoints

- `POST /api/groq/stream` — Groq streaming (SSE)
- `GET /api/chat/stream` — Chat SSE (interview-focused)
- `POST /api/chat/ask` — Non-stream chat
- `POST /api/resume/...` — Resume processing

## Quick Start

Backend:
```
cd backend
$env:NODE_ENV="development"; $env:PORT="5001"; npm install
npm start
```

Frontend:
```
cd ..
npm install
npm run dev
```
