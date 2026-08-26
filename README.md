# Agentflow_AI: Agentic AI Operations Automation Platform

**Agentflow_AI** is a full-stack, enterprise-grade AI operations platform that allows operators to describe complex business automations in natural language, automatically synthesize visual Directed Acyclic Graphs (DAGs), customize them on a drag-and-drop React Flow canvas, and execute them reliably through a cooperating chain of 5 specialized AI agents.

---

## 🌟 Key Features

- **Prompt-to-Graph AI Synthesis:** Natural language prompt input converts directly into structured DAG workflows with horizontal auto-layout, node parameters, and animated edges (powered by OpenRouter, Google Gemini, or built-in deterministic rule engine).
- **5-Agent Autonomous Orchestration Mesh:**
  1. **Planner Agent:** Topologically sorts the workflow DAG, resolves dependency order, detects cycles, and computes plan confidence score.
  2. **Execution Agent:** Executes node actions against integrations (Gmail, Slack, Discord, Google Sheets) or AI transforms while persisting step context in `AgentMemory`.
  3. **Validation Agent:** Validates output schemas, parameters, and invariants for every step.
  4. **Recovery Agent:** Classifies errors (`MISSING_FIELDS`, `API_FAILURE`, `AUTH_EXPIRED`, `RATE_LIMIT`, `TRANSIENT`), executing exponential backoff retries or alerting the operator console.
  5. **Monitoring Agent:** Emits real-time timeline logs and broadcasts WebSocket events via Socket.IO.
- **Interactive Visual Canvas:** Built with `@xyflow/react` (React Flow), custom glowing nodes, animated connecting edges, minimap, drag-and-drop node catalog, and contextual configuration panel.
- **Third-Party Integrations:** OAuth and API token connectors for **Gmail**, **Slack**, **Discord**, and **Google Sheets**, with sensitive credentials encrypted at rest using application-level **AES-256-GCM**.
- **Real-Time Execution Inspector:** Live Socket.IO streaming of agent events with color-coded badges, step payload inspector, and state machine controls (**Pause**, **Resume**, **Cancel**).
- **Zero-Config Local Development:** Automatic in-memory fallback for MongoDB (`mongodb-memory-server`) and async execution queue fallback for Redis/BullMQ.

---

## 🛠️ Architecture & Tech Stack

```
                                  Agentflow_AI Architecture
                                  
+-----------------------------------------------------------------------------------+
|                            FRONTEND (Next.js Pages Router)                        |
|   Tailwind CSS (Dark Console) | React Flow (@xyflow/react) | Zustand | Socket.IO  |
+-----------------------------------------+-----------------------------------------+
                                          | HTTP / WebSocket
+-----------------------------------------v-----------------------------------------+
|                                BACKEND (Node.js & Express)                        |
|   Security: Helmet, CORS, Rate-Limit, Express-Validator, AES-256-GCM, Bcrypt     |
+-----------------------------------------+-----------------------------------------+
                                          |
        +---------------------------------+---------------------------------+
        |                                                                   |
+-------v-------------------------+                       +-----------------v-------+
|    5-Agent Orchestration Mesh   |                       |    Integrations Layer   |
|  - Planner Agent (Topological)  |                       |  - Gmail (Send/Read)    |
|  - Execution Agent (Context)    |                       |  - Slack (Chat/Webhooks)|
|  - Validation Agent (Schema)    |                       |  - Discord (Bot/Hooks)  |
|  - Recovery Agent (Self-Heal)   |                       |  - Google Sheets        |
|  - Monitoring Agent (Socket.IO) |                       |  - OpenRouter / Gemini  |
+---------------------------------+                       +-------------------------+
        |                                                                   |
+-------v-------------------------------------------------------------------v-------+
|                             DATA PERSISTENCE & QUEUES                             |
|       MongoDB / In-Memory Database   •   BullMQ / In-Memory Async Queue           |
+-----------------------------------------------------------------------------------+
```

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- **Node.js**: `v18.0.0` or higher (tested with `v24.x`)
- **npm**: `v9.0.0` or higher

> [!TIP]
> **No external MongoDB or Redis installation is required for local development!** The application automatically boots an in-memory MongoDB and asynchronous execution queue if external databases are not detected.

---

### Step 1: Clone and Install Dependencies

Install all root, server, and client dependencies with a single command:

```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

Alternatively, install in each directory:
```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

---

### Step 2: Configure Environment Variables

The default environment files are pre-configured to work out of the box with zero setup.

If you wish to configure real third-party OAuth apps or AI API keys, edit `server/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Leave blank for automatic in-memory fallback
MONGODB_URI=
REDIS_URL=

# Security Keys
JWT_SECRET=agentflow_jwt_secret_dev_key_super_secure_987654321
CREDENTIAL_ENCRYPTION_KEY=e83921bf7a8e90c4871e23f9901d84a1e83921bf7a8e90c4871e23f9901d84a1

# AI Providers (Optional - Rule-based generator used if omitted)
OPENROUTER_API_KEY=
GEMINI_API_KEY=

# Third-Party Integrations (Optional)
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
GOOGLE_SHEETS_CLIENT_ID=
GOOGLE_SHEETS_CLIENT_SECRET=
```

---

### Step 3: Run the Application

Start both the backend server (Port 5000) and Next.js frontend (Port 3000) concurrently:

```bash
npm run dev
```

The services will be available at:
- **Frontend Operator Console**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Health**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Real-Time WebSocket Server**: `ws://localhost:5000`

---

## 📖 Walkthrough & Usage Guide

### 1. Operator Authentication & 1-Click Login
1. Open [http://localhost:3000](http://localhost:3000).
2. Click **"Get Started"** or **"Sign In"**.
3. Use the **"1-Click Demo Operator Login"** button on `/login` to instantly create and authenticate a local operator session with preloaded permissions.

### 2. Prompt-to-Workflow Synthesis (`/workflows/builder`)
1. Navigate to **AI Builder** from the sidebar.
2. Choose one of the curated templates or write your own prompt:
   > *"When a new lead email arrives in Gmail, extract lead details with AI, append a row to Google Sheets, and post a summary alert to Slack #ops-alerts"*
3. Click **"Generate Workflow Graph"**.
4. Watch the AI engine synthesize the nodes, actions, configurations, and horizontal positions.
5. Click **"Open in Canvas Editor"** to save and load into the interactive editor.

### 3. Visual Workflow Canvas (`/workflows/[id]`)
1. Drag new nodes from the **Node Catalog** on the left onto the canvas.
2. Click any node to open the **Node Properties** configuration panel on the right.
3. Connect output handles (cyan) to input handles (indigo) to create animated execution paths.
4. Click **"Save Graph"** to version your workflow in MongoDB.
5. Click **"Execute Run"** to trigger the 5-agent execution pipeline.

### 4. Real-Time Multi-Agent Execution Inspector (`/executions/[id]`)
1. Watch the live execution stream powered by Socket.IO:
   - 🔵 **Planner Agent (Cyan):** Topological sort, cycle check & confidence score.
   - 🟢 **Execution Agent (Emerald):** Node actions & intermediate context memory.
   - 🟣 **Validation Agent (Indigo):** Output schema & parameter invariant checks.
   - 🟡 **Recovery Agent (Amber):** Error classification & self-healing backoff retries.
   - 🟪 **Monitoring Agent (Violet):** Real-time timeline logging.
2. Test lifecycle controls: Click **Pause**, **Resume**, or **Cancel** on active runs.

### 5. Third-Party Integrations (`/integrations`)
1. View connection health for Gmail, Slack, Discord, Google Sheets, OpenRouter, and Gemini.
2. Click **Connect OAuth** or configure manual API keys and webhook URLs.
3. Notice that sensitive tokens are encrypted using AES-256-GCM before saving to MongoDB.

---

## 🧪 Automated Testing

To run the automated end-to-end test suite against the backend:

```bash
# Ensure server is running or start it, then:
npm run test --prefix server
```

The test script validates:
- System heartbeat (`/api/health`)
- Operator registration, login, and JWT validation (`/api/auth/*`)
- Prompt-to-graph AI workflow generator (`/api/workflows/generate`)
- Workflow CRUD, cloning, and versioning (`/api/workflows/*`)
- Multi-agent execution trigger and Socket.IO log creation (`/api/executions/*`)
- Integration connector security & AES-256-GCM encryption

---

## 🛡️ API Endpoints Reference

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/health` | System heartbeat and agent cluster status |
| **Auth** | `POST` | `/api/auth/register` | Register new operator |
| **Auth** | `POST` | `/api/auth/login` | Authenticate and issue JWT |
| **Auth** | `GET` | `/api/auth/me` | Current operator profile |
| **Workflows** | `GET` | `/api/workflows/dashboard` | Dashboard KPIs and execution stats |
| **Workflows** | `GET` | `/api/workflows` | List workflows with search/filter |
| **Workflows** | `POST` | `/api/workflows` | Create new workflow |
| **Workflows** | `POST` | `/api/workflows/generate` | AI prompt-to-graph synthesis |
| **Workflows** | `GET` | `/api/workflows/:id` | Get workflow details |
| **Workflows** | `PUT` | `/api/workflows/:id` | Update workflow & bump version |
| **Workflows** | `POST` | `/api/workflows/:id/duplicate`| Clone workflow |
| **Workflows** | `POST` | `/api/workflows/:id/execute` | Trigger multi-agent execution |
| **Workflows** | `DELETE`| `/api/workflows/:id` | Delete workflow |
| **Executions**| `GET` | `/api/executions` | List execution history |
| **Executions**| `GET` | `/api/executions/:id` | Execution run details |
| **Executions**| `GET` | `/api/executions/:id/timeline` | Detailed agent timeline logs |
| **Executions**| `POST` | `/api/executions/:id/pause` | Pause running execution |
| **Executions**| `POST` | `/api/executions/:id/resume` | Resume paused execution |
| **Executions**| `POST` | `/api/executions/:id/cancel` | Cancel active execution |
| **Integrations**| `GET`| `/api/integrations` | List user integrations |
| **Integrations**| `GET`| `/api/integrations/status` | Health check connectors |
| **Integrations**| `GET`| `/api/integrations/oauth/:p/start` | Initiate OAuth flow |
| **Integrations**| `GET`| `/api/integrations/oauth/:p/callback` | OAuth redirect callback |
| **Integrations**| `POST`| `/api/integrations` | Manual credential setup |
| **Notifications**| `GET`| `/api/notifications` | List notifications & unread count |
| **Notifications**| `PUT`| `/api/notifications/:id/read` | Mark alert as read |

---

## 🔒 Security Best Practices

- **Password Hashing:** Passwords hashed with `bcryptjs` using a cost factor of 12.
- **Credential Encryption:** All OAuth access tokens, refresh tokens, and bot secrets are encrypted at rest with `AES-256-GCM` using `CREDENTIAL_ENCRYPTION_KEY`.
- **HTTP Security Headers:** Implemented via `helmet` and custom Content Security Policies.
- **Rate Limiting:** Auth endpoints protected by `express-rate-limit` against brute-force attacks.
- **Strict Input Validation:** Request payloads validated with `express-validator`.
- **No Token Leaks:** Decrypted tokens are never returned over public HTTP API envelopes or logged in console traces.

---

## 📄 License
MIT License. Built for enterprise autonomous operations.
