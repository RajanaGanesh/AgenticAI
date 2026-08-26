# 🚀 Complete Deployment Guide: Render (Backend) + Vercel (Frontend)

This guide walks you through deploying **Agentflow_AI** to production using:
- **Render** for the Node.js/Express 5-Agent Multi-Agent Backend & WebSocket engine
- **Vercel** for the Next.js Frontend Console & React Flow Canvas
- **MongoDB Atlas** for persistent database storage

---

## 📋 Architecture Overview

```
               +-------------------------------------------+
               |           Vercel (Frontend UI)            |
               |  Next.js + React Flow + Zustand + Theme   |
               |  https://agentflow-ai.vercel.app          |
               +---------------------+---------------------+
                                     |
                          HTTPS / WSS Requests
                                     |
               +---------------------v---------------------+
               |           Render (Backend API)            |
               |  Node.js + Express + Socket.IO + 5 Agents |
               |  https://agentflow-backend.onrender.com   |
               +---------------------+---------------------+
                                     |
                             Encrypted TLS (SRV)
                                     |
               +---------------------v---------------------+
               |              MongoDB Atlas                |
               |  Users, Workflows, Executions, Audit Logs |
               +-------------------------------------------+
```

---

## ⚡ STEP 1: Configure MongoDB Atlas Network Access

Before deploying to Render, ensure your MongoDB Atlas cluster allows incoming connections from cloud servers:

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. In the left navigation, click **Network Access** (under *Security*).
3. Click **Add IP Address**.
4. Select **Allow Access From Anywhere** (`0.0.0.0/0`).
5. Click **Confirm**.

> [!NOTE]
> Render servers use dynamic IP addresses, so `0.0.0.0/0` is required for cloud connections. Your database remains protected by your strong database username and password.

---

## 📦 STEP 2: Commit & Push Code to GitHub

Open a terminal at the project root (`c:\Users\ganesh.r\OneDrive\Desktop\project folder`) and run:

```bash
# 1. Initialize git repository (if not already initialized)
git init

# 2. Check status to verify that .env files and node_modules are ignored
git status

# 3. Add all project files
git add .

# 4. Create your initial commit
git commit -m "feat: complete agentflow platform with multi-agent engine, canvas, and light/dark theme"

# 5. Create a new repository on GitHub (e.g. named agentflow-ai)
# 6. Link your local repo to GitHub and push:
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/agentflow-ai.git
git push -u origin main
```

---

## 🌐 STEP 3: Deploy Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
2. Connect your GitHub repository (`agentflow-ai`).
3. Fill in the following settings:

| Setting | Value |
| :--- | :--- |
| **Name** | `agentflow-backend` (or any preferred name) |
| **Region** | Choose closest to you (e.g., *Singapore*, *Oregon*, *Frankfurt*) |
| **Branch** | `main` |
| **Root Directory** | `server` *(Important: specify `server`)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node src/server.js` |
| **Plan Type** | `Free` (or higher) |

4. Scroll down to **Environment Variables** and add the following keys:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | `5000` | (Render sets this automatically, but good to add) |
| `MONGODB_URI` | `mongodb+srv://rajanaganesh143143_db_user:MqidgnPW4TsHfoDA@agentiai.iv5cvjq.mongodb.net/agentflow_ai?retryWrites=true&w=majority&appName=AgentiAI` | Your Atlas connection URI |
| `CLIENT_URL` | `https://your-frontend.vercel.app` | *(Set to `*` initially, then update with your Vercel URL in Step 5)* |
| `JWT_SECRET` | `agentflow_jwt_secret_dev_key_super_secure_987654321` | Or generate a custom 64-char secret |
| `CREDENTIAL_ENCRYPTION_KEY` | `e83921bf7a8e90c4871e23f9901d84a1e83921bf7a8e90c4871e23f9901d84a1` | 32-byte hex key for AES-256-GCM vault |
| `OPENROUTER_API_KEY` | `your_openrouter_api_key` *(optional)* | For live LLM prompt graph synthesis |
| `GEMINI_API_KEY` | `your_gemini_api_key` *(optional)* | For Google Gemini intelligence |

5. Click **Create Web Service**.
6. Wait 2-3 minutes for the build to finish. Once live, copy your Render URL:
   - Example: `https://agentflow-backend.onrender.com`
7. Test the health endpoint in your browser:
   - `https://agentflow-backend.onrender.com/api/health` -> should return `{"success":true,"message":"Agentflow AI platform is operational",...}`

---

## ⚡ STEP 4: Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** > **Project**.
2. Import your GitHub repository (`agentflow-ai`).
3. Configure the project settings:

| Setting | Value |
| :--- | :--- |
| **Project Name** | `agentflow-ai` |
| **Framework Preset** | `Next.js` |
| **Root Directory** | Click **Edit** and select `client` *(Important)* |
| **Build Command** | `next build` (default) |
| **Output Directory** | `.next` (default) |

4. Expand the **Environment Variables** section and add:

| Key | Value | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `<YOUR_RENDER_URL>/api` | `https://agentflow-backend.onrender.com/api` |
| `NEXT_PUBLIC_SOCKET_URL` | `<YOUR_RENDER_URL>` | `https://agentflow-backend.onrender.com` |

5. Click **Deploy**.
6. Vercel will build and assign your production domain:
   - Example: `https://agentflow-ai.vercel.app`

---

## 🔄 STEP 5: Link Frontend URL to Backend CORS

Now that your Vercel URL is live:

1. Return to the [Render Dashboard](https://dashboard.render.com/).
2. Select your `agentflow-backend` service > **Environment**.
3. Update `CLIENT_URL` to your Vercel URL:
   - `CLIENT_URL=https://agentflow-ai.vercel.app`
4. Click **Save Changes** (Render will auto-redeploy in 30 seconds).

---

## ✅ STEP 6: Live Production Verification Checklist

Visit your live Vercel frontend: `https://your-project.vercel.app`

- [ ] **Landing Page:** Check hero text, 5-agent showcase, and responsive layout.
- [ ] **Theme Switcher:** Click the Sun/Moon toggle in the navbar to test Dark Console & Light Clean modes.
- [ ] **Operator Registration & Login:** Create a new operator account or sign in with your credentials.
- [ ] **AI Workflow Builder:** Go to `/workflows/builder`, select a template, and click *Generate Workflow Graph*.
- [ ] **Interactive Canvas:** Open the generated workflow in `/workflows/[id]` and test node dragging & palette tools.
- [ ] **Execute Run & Real-Time Inspector:** Click *Execute Run* and observe the live streaming timeline events from the 5 agents (Planner, Execution, Validation, Monitoring).
- [ ] **Database Persistence:** Check your [MongoDB Atlas Collections](https://cloud.mongodb.com) to see live documents in `users`, `workflows`, `executions`, and `executionlogs`.

---

## 🛠️ Troubleshooting & Tips

### Backend Render Cold Starts (Free Tier)
Free-tier Web Services on Render sleep after 15 minutes of inactivity. When a request arrives, it may take 30-40 seconds to wake up.
- *Tip:* You can use a free uptime monitor (like [UptimeRobot](https://uptimerobot.com)) pointing to `https://your-backend.onrender.com/api/health` every 10 minutes to keep it awake!

### WebSocket Connections on Render
Socket.IO automatically falls back between WebSocket and HTTP long-polling, ensuring 100% reliable connection over Render's reverse proxy.