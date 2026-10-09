# GitHub Actions Coding Agent Workflow

This folder contains the automated fix pipeline designed to run headless inside [aryanSharma48/smoothapi](https://github.com/aryanSharma48/smoothapi).

---

## File Overview

* **`bugbot-fix.yml`**: The autonomous coding agent workflow triggered by n8n via GitHub's `workflow_dispatch` API.

---

## How to Install into `smoothapi`

### 1. Copy the Workflow
Copy `bugbot-fix.yml` into your `smoothapi` repository at:
```text
smoothapi/.github/workflows/bugbot-fix.yml
```
Commit and push this file to the default branch (`main`).

### 2. Configure Repository Settings
In `aryanSharma48/smoothapi` on GitHub:
1. Navigate to **Settings → Actions → General**.
2. Under **Workflow permissions**, select:
   * **Read and write permissions**
   * Tick **Allow GitHub Actions to create and approve pull requests** *(CRITICAL: without this, automated PR creation fails)*.
3. Save settings.

### 3. Add Repository Secrets
Navigate to **Settings → Secrets and variables → Actions** and add:

| Secret Name | Description | Example / Source |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google AI Studio Gemini API Key | Free tier key from Google AI Studio |
| `N8N_CALLBACK_URL` | Public webhook URL for n8n callback | `https://your-domain.ngrok-free.app/webhook/bugbot/fix-callback` |
| `N8N_SHARED_SECRET` | Secret token used to authenticate the callback | Matches `x-bugbot-secret` header in n8n |

---

## How the Fix Pipeline Works

1. **Triggered by n8n:** When the user confirms "Fix issue N", n8n dispatches `bugbot-fix.yml` with input `issue_number: N`.
2. **Setup Runner:** Provisions an isolated Ubuntu runner with Node.js 20 and Python 3.12.
3. **Branch Creation:** Creates a clean fix branch `fix/issue-N`.
4. **Agent Execution:** Launches `aider-chat` with Gemini to analyze tests and source code (`packages/**/*`), applying code patches and validating with `npm test`.
5. **PR Creation:** Once tests pass, pushes the branch and opens a reviewable pull request (`Closes #N`).
6. **Callback:** Reports back to n8n with the PR URL and workflow run URL, which triggers n8n to transition the issue label to `needs-review`.
