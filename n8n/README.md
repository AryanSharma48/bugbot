# BugBot n8n Orchestration

This folder contains the complete n8n setup and workflows that connect **ElevenLabs Conversational AI**, **GitHub**, and **GitHub Actions**.

## Quick Start

### 1. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in:
- `WEBHOOK_URL`: Your static ngrok or Cloudflare domain (e.g. `https://your-domain.ngrok-free.app/`)
- `N8N_SHARED_SECRET`: A secure random hex string for authentication

### 2. Start n8n
```bash
docker compose up -d
```
Open [http://localhost:5678](http://localhost:5678) in your browser and complete the initial account setup.

### 3. Add Credentials in n8n
Go to **Settings → Credentials → Add Credential**:
1. **GitHub API (`github-bugbot`)**:
   - Credential Type: `Header Auth` (or GitHub API)
   - Name: `x-bugbot-secret`
   - Value: Your `N8N_SHARED_SECRET`
2. **GitHub Fine-grained PAT**:
   - Under Header Auth or HTTP Basic Auth, set header `Authorization: Bearer <GITHUB_PAT>`
   - Permissions needed on `aryanSharma48/smoothapi`: Issues (read/write), Pull Requests (read/write), Actions (read/write).

### 4. Import Workflows
In n8n UI, go to **Workflows → Import from File** and import the 5 JSON files in `./workflows/`:
1. `create-issue.json` (`/webhook/bugbot/create-issue`)
2. `list-issues.json` (`/webhook/bugbot/list-issues`)
3. `start-fix.json` (`/webhook/bugbot/start-fix`)
4. `get-status.json` (`/webhook/bugbot/get-status`)
5. `fix-callback.json` (`/webhook/bugbot/fix-callback`)

Activate each workflow (toggle top-right switch to **Active**).
