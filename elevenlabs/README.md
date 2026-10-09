# ElevenLabs Conversational AI Setup

This directory contains the system prompt and tool definitions for configuring the **BugBot** voice agent in the ElevenLabs Agents platform.

---

## Configuration Steps

### 1. Create the Agent
1. Log in to [ElevenLabs](https://elevenlabs.io/) and open the **Conversational AI / Agents** tab.
2. Click **Create Agent** (Blank Agent) and name it `BugBot`.
3. Set First Message:
   ```text
   Hi, I'm BugBot. I can log a bug, list open issues, or start a fix for smoothAPI. What's up?
   ```
4. LLM: Select a fast, low-latency model with tool-calling capabilities (e.g. Gemini 2.5 Flash / Claude 3.5 Haiku).
5. Voice: Choose a clear, neutral voice.

### 2. Set System Prompt
Copy the full text from **[`system-prompt.txt`](./system-prompt.txt)** and paste it into the **System Prompt** field.

---

### 3. Add Webhook Tools
Go to the **Tools** tab in the ElevenLabs agent builder and add four webhook tools pointing to your public n8n URL (e.g. `https://your-domain.ngrok-free.app/webhook/bugbot/`):

| Tool Name | Method | URL Path | Header | Schema |
| :--- | :--- | :--- | :--- | :--- |
| `create_issue` | `POST` | `.../webhook/bugbot/create-issue` | `x-bugbot-secret: <SECRET>` | [`tools/create_issue.json`](./tools/create_issue.json) |
| `list_issues` | `POST` | `.../webhook/bugbot/list-issues` | `x-bugbot-secret: <SECRET>` | [`tools/list_issues.json`](./tools/list_issues.json) |
| `start_fix` | `POST` | `.../webhook/bugbot/start-fix` | `x-bugbot-secret: <SECRET>` | [`tools/start_fix.json`](./tools/start_fix.json) |
| `get_status` | `POST` | `.../webhook/bugbot/get-status` | `x-bugbot-secret: <SECRET>` | [`tools/get_status.json`](./tools/get_status.json) |

*Note: For each tool, set the response timeout to 10 seconds to account for LLM duplicate checks.*

---

### 4. Connect to Dashboard
1. On the **Widget** tab in ElevenLabs, copy your **Agent ID**.
2. Open `dashboard/.env.local` and add:
   ```env
   NEXT_PUBLIC_AGENT_ID=your_agent_id_here
   ```
3. Restart or reload your dashboard. The interactive voice widget will now be active in the bottom-right corner!
