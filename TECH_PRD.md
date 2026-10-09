# VoiceBugBot: Technical PRD

Oct 9, 2026 · @Aryan

## 1. Overview

VoiceBugBot lets a developer file, list and fix GitHub issues by talking, and ends with a reviewable pull request opened by a background coding agent.

**Problem.** Developers spot bugs while moving fast and skip filing them because tickets are tedious. Even when a bug is filed, fixing it means a context switch.

**Product.** An ElevenLabs voice agent takes a spoken bug report, asks follow-up questions, and files a structured issue. On command it starts a fix: n8n labels the issue `WIP` and triggers a GitHub Actions job that runs a headless coding agent, commits to a branch and opens a PR. A human reviews and merges.

**Goals**

- G1: create, list and check status of issues entirely by voice.
- G2: "fix issue N" produces a PR with passing tests, with no manual GitHub clicks.
- G3: a live dashboard where the issue card moves from Reported to WIP to Needs review on its own.
- G4: runs at $0 using free tiers (see section 4).

**Non-goals**

- No auto-merge, ever. A human approves every PR.
- No phone calls or telephony. Web widget only.
- No multi-repo or multi-user auth. One demo repo, one team.
- No attempt to fix arbitrary real-world bugs. The demo uses a seeded bug the agent has already fixed in rehearsal.

**Demo success criteria**

- A bug is reported by voice in under 60 seconds and lands as an issue with title, steps, environment, severity and component filled in.
- "Fix issue 1" leads to an open PR with passing tests in under 5 minutes.
- The dashboard card moves columns without a page refresh.
- Zero errors in two consecutive full rehearsals.

**Assumptions to confirm.** Hackathon length and team size are unknown, so the plan in section 14 is tiered: each tier is a shippable demo, and you stop wherever time runs out. Defaults chosen: a public GitHub repo, self-hosted n8n, Gemini free tier for the coding agent, Next.js dashboard on Vercel.

## 2. User stories and demo script

The system must handle four spoken intents; everything else in this PRD exists to make these four reliable.

| Intent | Example utterance | Tool called | Agent behavior |
| --- | --- | --- | --- |
| Report a bug | "The login button crashes on Safari." | `create_issue` | Asks up to 3 follow-ups (steps, browser, severity), reads back a summary, files only after a spoken yes |
| List issues | "What's open right now?" | `list_issues` | Reads the top 5 in one short sentence each |
| Start a fix | "Fix issue 4." | `start_fix` | Repeats the issue title, asks "Start the fix?", calls the tool only after yes |
| Check progress | "How's issue 4 going?" | `get_status` | Says the current state and whether a PR exists |

**Acceptance criteria per story**

- Report: the issue has title, description, steps, environment, one severity label and one component label. If the agent finds a likely duplicate it names it and asks what to do before filing.
- List: the spoken answer is under 20 seconds. No URLs read aloud.
- Fix: the issue gets the `WIP` label within 3 seconds of confirmation, and the agent replies immediately instead of waiting for the fix.
- Status: answers correctly for all four states (`reported`, `WIP`, `needs-review`, `fix-failed`).

**Live demo script (about 3 minutes of voice)**

1. Open the dashboard. The board shows the seeded repo with no open issues.
2. Say: "I found a bug. The checkout total is wrong when I apply a discount." Answer two follow-ups. Say yes to the read-back.
3. A card appears under Reported with severity and component labels.
4. Say: "What's open?" The agent reads the issue back.
5. Say: "Fix issue 1." Confirm. The card jumps to WIP while the agent says the fix has started.
6. While the Actions job runs (2 to 4 minutes), show the Actions tab and the repo labels. Ask "How's it going?" once to show `get_status`.
7. The card moves to Needs review. Open the PR, show the diff and the passing test, and say a human merges it.

## 3. System architecture

&#91;embedded content: system architecture · 7 components, 6 numbered calls\]

A spoken command reaches n8n through the agent (1 and 2), n8n updates GitHub (3) and, for a fix, dispatches the Actions job (4); the job pushes a branch and opens a PR (5), then calls n8n back (6) so the label flips. The dashboard only reads GitHub, which is why it needs no database.

**What each tool does end to end**

| Tool | Path | Effect on GitHub |
| --- | --- | --- |
| `create_issue` | agent, n8n, GitHub | New issue with `reported`, one `sev:` and one `comp:` label, or a comment on an existing one |
| `list_issues` | agent, n8n, GitHub | Read only |
| `start_fix` | agent, n8n, GitHub, Actions | Label becomes `WIP`, a comment is posted, the workflow is dispatched |
| `get_status` | agent, n8n, GitHub | Read only: issue labels, open PR, workflow run |
| Fix loop | Actions, GitHub, n8n | Branch and PR created, then label becomes `needs-review` or `fix-failed` |

**Design decisions**

- **GitHub is the only state store.** Labels carry the status, so there is no database to keep in sync or lose.
- **The fix is asynchronous.** `start_fix` returns in about 3 seconds; the 2 to 4 minute fix reports back through the callback, so the voice call never waits on it.
- **Confirmation is enforced twice.** The agent prompt asks for a spoken yes, and n8n rejects any call where `confirmed` is not true.

## 4. Tech stack and accounts

The whole stack runs on free tiers; the only hard limit that will bite is ElevenLabs' 15 free agent minutes, so every other part is tested without voice.

| Layer | Choice | Plan | Cost | Limit that matters |
| --- | --- | --- | --- | --- |
| Voice agent | ElevenLabs Agents (web widget) | Free | $0 | 15 call minutes, 4 concurrent calls. Overage about $0.08/min; Starter is $6/month |
| Orchestration | n8n Community Edition in Docker | Self-hosted | $0 | Unlimited executions; you run the server |
| Public URL | ngrok (free static domain) or Cloudflare Tunnel | Free | $0 | Free tunnel URLs can change on restart; use a static domain |
| Code host | GitHub, public repo | Free | $0 | Actions minutes are free on public repos; private repos get 2,000/month |
| Coding agent runner | GitHub Actions `ubuntu-latest` | Free | $0 | 15-minute job timeout set by us |
| Coding agent LLM | Gemini API via Aider | Free tier | $0 | Per-model rate limits, no commercial use, inputs may be used by Google |
| Dashboard | Next.js on Vercel Hobby | Free | $0 | Non-commercial use |
| Notifications (optional) | Telegram bot | Free | $0 | None relevant |

Figures are as of 2026-10-09 and come from search results; confirm each on the live pricing page before the event. Vercel and ngrok terms are from memory and not verified here.

**Accounts to create first (about 30 minutes, in this order)**

- [ ] GitHub account with a new public repo (section 5)
- [ ] ElevenLabs account; open the Agents page and confirm free minutes show
- [ ] Google AI Studio account and a Gemini API key
- [ ] ngrok account and a reserved static domain
- [ ] Docker installed locally and `docker run hello-world` works
- [ ] Vercel account linked to GitHub
- [ ] Optional: Telegram bot via BotFather for notifications

Ask the ElevenLabs team at the event for extra credits; they sponsor this track.

**Sources:** [ElevenLabs Agents overview](https://cdntest.elevenlabs.io/docs/conversational-ai) · [ElevenLabs pricing breakdown](https://quiq.com/blog/elevenlabs-pricing/) · [n8n pricing](https://www.cloudzero.com/blog/n8n-pricing/) · [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions) · [Gemini API free tier limits](https://yingtu.ai/en/blog/google-gemini-api-free-tier-limits-2026)

## 5. Step 1: GitHub setup

The demo repo is a tiny Node project with one seeded bug and one failing test, so the coding agent has an unambiguous, verifiable fix. Budget about 45 minutes.

**5.1 Create the repo and seed the bug**

Create a public repo named `bugbot-demo-shop`, clone it, and add these files.

```json
// package.json
{ "name": "bugbot-demo-shop", "version": "1.0.0", "scripts": { "test": "node --test" } }
```

```js
// src/cart.js
function calculateTotal(items, discountPercent = 0) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  // BUG: subtracts the percentage as a flat amount instead of a percent
  return subtotal - discountPercent;
}
module.exports = { calculateTotal };
```

```js
// tests/cart.test.js
const test = require('node:test');
const assert = require('node:assert');
const { calculateTotal } = require('../src/cart');

test('applies a percentage discount', () => {
  const items = [{ price: 100, qty: 2 }];
  assert.strictEqual(calculateTotal(items, 10), 180);
});
```

Run `npm test` once and confirm it fails with 190 instead of 180. Commit and push to `main`. Add two more small seeded bugs later if time allows, so you can pick whichever the agent fixes most reliably.

**5.2 Create the labels (the state machine)**

A single issue moves through these labels, and the dashboard columns map one to one onto them.

`reported` → `WIP` → `needs-review` (success) or `fix-failed` (failure). A failed issue can be sent back to `WIP` by saying "fix issue N" again.

```bash
gh label create reported     -c 1d76db -d 'Filed by VoiceBugBot'
gh label create WIP          -c fbca04 -d 'Automated fix in progress'
gh label create needs-review -c 0e8a16 -d 'PR open, human review needed'
gh label create fix-failed   -c d93f0b -d 'Automated fix failed'
gh label create sev:low      -c c2e0c6
gh label create sev:medium   -c fef2c0
gh label create sev:high     -c ff9f1c
gh label create sev:critical -c b60205
gh label create comp:frontend -c ededed
gh label create comp:api      -c ededed
gh label create comp:database -c ededed
```

**5.3 Repo settings**

1. Settings, Actions, General, Workflow permissions: choose **Read and write permissions**.
2. On the same page, tick **Allow GitHub Actions to create and approve pull requests**. Without this the PR step fails with a permissions error.
3. After the seed commit is on `main`, add a branch ruleset (Settings, Rules, Rulesets) for the default branch with **Require a pull request before merging** and **Block force pushes**. This is the safety guarantee: the agent can only ever push to `fix/*` branches.

**5.4 Create the token n8n will use**

Settings, Developer settings, Personal access tokens, Fine-grained tokens. Repository access: only `bugbot-demo-shop`. Permissions: Issues (read and write), Pull requests (read and write), Actions (read and write, needed to dispatch the workflow), Contents (read-only). Set expiry to 7 days. Save the token somewhere private; you will paste it into n8n in step 2.

**5.5 Repo secrets for the Actions job**

Settings, Secrets and variables, Actions, New repository secret. Add these three now; the callback URL comes from step 2.

| Secret | Value |
| --- | --- |
| `GEMINI_API_KEY` | Key from Google AI Studio |
| `N8N_SHARED_SECRET` | Output of `openssl rand -hex 24`. Reuse it as the webhook secret in n8n and ElevenLabs |
| `N8N_CALLBACK_URL` | `https://YOUR-DOMAIN.ngrok-free.app/webhook/bugbot/fix-callback` |

**Done when:** `npm test` fails on a fresh clone, all labels exist, and a push straight to `main` is rejected.

## 6. Step 2: n8n setup

Run n8n locally in Docker and expose it through a stable public URL, because both ElevenLabs and GitHub Actions must reach your webhooks from the internet. Budget about 30 minutes.

**6.1 Start the tunnel first** so you know the public URL before n8n starts.

```bash
ngrok config add-authtoken <YOUR_NGROK_TOKEN>
ngrok http --url=YOUR-DOMAIN.ngrok-free.app 5678
```

Older ngrok versions use `--domain` instead of `--url`. If you use Cloudflare Tunnel instead, a named tunnel gives a stable URL; quick tunnels change on every restart.

**6.2 Run n8n with that URL**

```bash
docker volume create n8n_data
docker run -d --name n8n --restart unless-stopped -p 5678:5678 \
  -e WEBHOOK_URL=https://YOUR-DOMAIN.ngrok-free.app/ \
  -e GENERIC_TIMEZONE=Asia/Kolkata -e TZ=Asia/Kolkata \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

Setting `WEBHOOK_URL` is what makes n8n display the public address on webhook nodes instead of `localhost`. Open `http://localhost:5678`, create the owner account, then confirm `https://YOUR-DOMAIN.ngrok-free.app/healthz` returns a status of ok.

**6.3 Create credentials** (Credentials, Create credential)

| Credential | Type | Value |
| --- | --- | --- |
| `github-bugbot` | GitHub API | The fine-grained token from step 1 |
| `bugbot-secret` | Header Auth | Name `x-bugbot-secret`, value = your `N8N_SHARED_SECRET` |
| `gemini` | Google Gemini (PaLM) API | Key from Google AI Studio |
| `telegram` (optional) | Telegram API | Token from BotFather |

**6.4 Webhook rules used by every workflow**

- Method POST, Authentication set to Header Auth using `bugbot-secret`. Anything without the header gets a 401 from n8n itself.
- Respond set to **Using 'Respond to Webhook' Node**, so each workflow controls its own JSON reply.
- Two URLs exist per webhook. `/webhook-test/...` works only while the editor is listening for a test event. `/webhook/...` works only when the workflow is switched to **Active**. ElevenLabs and Actions must always use the production `/webhook/` URL.

**6.5 Keep it alive during the event**

A sleeping laptop kills the tunnel. Disable sleep, plug into power, and keep a hotspot as a network fallback. If you want an always-on host, a small VPS (roughly $4 to $7 a month) running the same Docker command works with no other changes.

**Gotchas**

- If a call returns an HTML page instead of JSON, the free tunnel's browser warning page is intercepting it. Add the header `ngrok-skip-browser-warning: 1` to the request.
- If the tunnel URL ever changes, update three places: the `WEBHOOK_URL` env var (restart the container), the `N8N_CALLBACK_URL` repo secret, and every ElevenLabs tool URL.

**Done when:** `curl -X POST` to a test webhook with the right header returns your JSON, and the same call without the header returns 401.

## 7. Webhook API contract

Five endpoints form the whole backend surface; four are tools the voice agent calls, one is the callback the Actions job calls. Fix this contract before building anything so the voice, n8n and Actions work can proceed in parallel.

| Endpoint (under `https://YOUR-DOMAIN/webhook/bugbot/`) | Caller | Purpose |
| --- | --- | --- |
| `create-issue` | ElevenLabs tool | File a structured issue, or report a duplicate |
| `list-issues` | ElevenLabs tool | Return open issues with spoken summary |
| `start-fix` | ElevenLabs tool | Label WIP and dispatch the Actions workflow |
| `get-status` | ElevenLabs tool | State, PR link, run link for one issue |
| `fix-callback` | GitHub Actions | Report success or failure of a fix run |

**Rules for every endpoint**

- Auth: header `x-bugbot-secret` must equal the shared secret, otherwise n8n answers 401.
- Business outcomes always return HTTP 200 with `ok: true` or `ok: false` and a human-readable `spoken` string. The agent reads `spoken` aloud and never reads URLs. Returning 4xx for business errors makes the voice agent treat the tool as broken.
- Responses must come back in under 5 seconds. `start-fix` returns immediately; the fix runs in the background.

**`create-issue`**

```json
// request
{
  "title": "Checkout total wrong with discount",
  "description": "Applying a 10 percent code subtracts 10 dollars instead.",
  "steps_to_reproduce": "Add a 200 dollar cart, apply code SAVE10, view total.",
  "environment": "Chrome 130 on macOS",
  "severity_hint": "high",
  "component_hint": "frontend",
  "confirmed": true,
  "force_create": false,
  "append_to": null
}

// response, created
{ "ok": true, "created": true, "number": 1, "url": "https://github.com/OWNER/REPO/issues/1",
  "labels": ["reported", "sev:high", "comp:frontend"],
  "spoken": "Filed issue 1, high severity, frontend. Want me to start a fix?" }

// response, possible duplicate (nothing created)
{ "ok": true, "created": false, "duplicate_of": { "number": 7, "title": "Discount math is off" },
  "spoken": "This looks like issue 7, discount math is off. Add to it, or file a new one?" }
```

If the user says "add to it", the agent calls the same endpoint with `append_to: 7`, which posts a comment. If they say "file a new one", it sends `force_create: true`. Requests with `confirmed: false` return `ok: false, error: "confirmation_required"`.

**`list-issues`**

```json
// request
{ "status": "open", "limit": 5 }          // status: open | wip | review | failed | all

// response
{ "ok": true, "count": 2,
  "issues": [ { "number": 1, "title": "Checkout total wrong", "severity": "high", "status": "reported" },
              { "number": 2, "title": "Pagination skips last page", "severity": "medium", "status": "WIP" } ],
  "spoken": "Two open issues. Issue 1, checkout total wrong, high severity, not started. Issue 2, pagination skips last page, medium, being fixed." }
```

**`start-fix`**

```json
// request
{ "issue_number": 1, "confirmed": true }

// response, started
{ "ok": true, "issue_number": 1, "status": "WIP",
  "spoken": "Fix started for issue 1. It usually takes a few minutes. Ask me for status any time." }

// response, refused
{ "ok": false, "error": "already_in_progress",
  "spoken": "Issue 1 already has a fix running." }
```

Error codes: `confirmation_required`, `issue_not_found`, `issue_closed`, `already_in_progress`, `dispatch_failed`.

**`get-status`**

```json
// request
{ "issue_number": 1 }

// response
{ "ok": true, "issue_number": 1, "status": "needs-review",
  "pr_url": "https://github.com/OWNER/REPO/pull/3", "run_url": "https://github.com/OWNER/REPO/actions/runs/123",
  "spoken": "Issue 1 has a fix ready for review. The pull request is number 3." }
```

**`fix-callback`** (called by the Actions job with the same header)

```json
{ "issue_number": 1, "status": "success",       // success | failure | cancelled
  "pr_url": "https://github.com/OWNER/REPO/pull/3",
  "run_url": "https://github.com/OWNER/REPO/actions/runs/123" }
```

## 8. Step 3: n8n workflows

Build five workflows, one per endpoint in section 7, and test each with curl before touching ElevenLabs. Budget about 2 to 3 hours in total.

**Conventions**

- For every GitHub call use an **HTTP Request** node with the predefined credential type GitHub API (`github-bugbot`) and the header `Accept: application/vnd.github+json`. It is more predictable than the built-in GitHub node's label fields.
- Replace `OWNER/REPO` in every URL with your repo. There is no safe shared variable for this, so after the first workflow works, export it as JSON and use find-and-replace for the rest.
- On any HTTP node whose failure you handle yourself (such as fetching an issue that may not exist), set **On Error** to *Continue (regular output)*.

### 8.1 `create-issue`

1. **Webhook**: POST, path `bugbot/create-issue`, Header Auth `bugbot-secret`, Respond using the Respond to Webhook node.
2. **IF** `{{ $json.body.confirmed }}` is true. False branch goes to a Respond node returning `{ "ok": false, "error": "confirmation_required", "spoken": "I need a yes from you before I file this." }`.
3. **IF** `{{ $json.body.append_to }}` is not empty. True branch: HTTP POST `https://api.github.com/repos/OWNER/REPO/issues/{{ $json.body.append_to }}/comments` with the description and steps as the comment body, then Respond `ok: true` with spoken "Added your details to issue N."
4. **HTTP Request** (GET `https://api.github.com/repos/OWNER/REPO/issues?state=open&per_page=30`). Set *Always Output Data* on, and collapse the items into one with a **Code** node or an Aggregate node so the next step gets one list.
5. **Basic LLM Chain** with the Gemini chat model. Prompt:

```text
You triage bug reports. New report:
Title: {{ $('Webhook').first().json.body.title }}
Description: {{ $('Webhook').first().json.body.description }}

Open issues (number: title): {{ list built from step 4 }}

Reply with JSON only, no markdown:
{"duplicate_of": <issue number or null>, "severity": "low|medium|high|critical", "component": "frontend|api|database"}
Only set duplicate_of if it is clearly the same bug.
```

6. **Code** node "Build issue". It parses the LLM reply defensively and falls back to the agent's hints if the model returns junk:

````js
const b = $('Webhook').first().json.body;
let llm = {};
try { llm = JSON.parse(($json.text || $json.output).replace(/```json|```/g, '').trim()); } catch (e) {}
const sev = ['low','medium','high','critical'].includes(llm.severity) ? llm.severity : (b.severity_hint || 'medium');
const comp = ['frontend','api','database'].includes(llm.component) ? llm.component : (b.component_hint || 'frontend');
const body = [
  '## Description', b.description,
  '## Steps to reproduce', b.steps_to_reproduce || '_not provided_',
  '## Environment', b.environment || '_not provided_',
  '---', '_Filed by VoiceBugBot_'
].join('\n\n');
return [{ json: {
  duplicate_of: b.force_create ? null : (llm.duplicate_of || null),
  title: b.title, body, sev, comp,
  labels: ['reported', `sev:${sev}`, `comp:${comp}`]
} }];
````

The field holding the LLM text is `text` or `output` depending on the n8n version; check the execution pane once and adjust.

7. **IF** `duplicate_of` is not empty. True: Respond `{ ok: true, created: false, duplicate_of: { number }, spoken }` using the number and the matching title from step 4.
8. False: **HTTP POST** `https://api.github.com/repos/OWNER/REPO/issues` with JSON body `{ title, body, labels }` from the Code node.
9. **Respond to Webhook** with the created-issue shape from section 7, using `number` and `html_url` from step 8 and `sev` and `comp` from the Code node for the spoken line.

Expected latency is about 3 seconds (list, one Gemini call, create).

### 8.2 `list-issues`

1. **Webhook** (`bugbot/list-issues`).
2. **HTTP GET** `https://api.github.com/repos/OWNER/REPO/issues?state=open&per_page=30`, with *Always Output Data* on. The issues endpoint also returns pull requests, so the next step filters them out.
3. **Code** (run once for all items):

```js
const req = $('Webhook').first().json.body || {};
const limit = Math.min(req.limit || 5, 8);
const statusOf = (names) => names.includes('fix-failed') ? 'fix-failed'
  : names.includes('needs-review') ? 'needs-review' : names.includes('WIP') ? 'WIP' : 'reported';
const sevOf = (labels) => (labels.find(l => l.name.startsWith('sev:')) || { name: 'sev:medium' }).name.slice(4);
let issues = $input.all().map(i => i.json).filter(i => i.number && !i.pull_request).map(i => ({
  number: i.number, title: i.title, severity: sevOf(i.labels), status: statusOf(i.labels.map(l => l.name))
}));
const want = { wip: 'WIP', review: 'needs-review', failed: 'fix-failed' }[req.status];
if (want) issues = issues.filter(i => i.status === want);
issues = issues.slice(0, limit);
const say = { reported: 'not started', WIP: 'being fixed', 'needs-review': 'fix ready for review', 'fix-failed': 'last fix failed' };
const spoken = issues.length
  ? `${issues.length} issue${issues.length > 1 ? 's' : ''}. ` + issues.map(i => `Issue ${i.number}, ${i.title}, ${i.severity} severity, ${say[i.status]}.`).join(' ')
  : 'No matching issues.';
return [{ json: { ok: true, count: issues.length, issues, spoken } }];
```

4. **Respond to Webhook** with the Code node output as JSON.

### 8.3 `start-fix`

1. **Webhook** (`bugbot/start-fix`).
2. **IF** `confirmed` is true, else Respond `{ ok: false, error: "confirmation_required", spoken: "Say yes and I will start the fix." }`.
3. **HTTP GET** `https://api.github.com/repos/OWNER/REPO/issues/{{ $json.body.issue_number }}` with On Error set to Continue (regular output).
4. **Code** "Decide":

```js
const req = $('Webhook').first().json.body;
const issue = $json;
const n = req.issue_number;
const names = (issue.labels || []).map(l => l.name);
if (issue.message === 'Not Found') return [{ json: { allowed: false, error: 'issue_not_found', spoken: `I can't find issue ${n}.` } }];
if (issue.state === 'closed') return [{ json: { allowed: false, error: 'issue_closed', spoken: `Issue ${n} is already closed.` } }];
if (names.includes('WIP')) return [{ json: { allowed: false, error: 'already_in_progress', spoken: `Issue ${n} already has a fix running.` } }];
const labels = names.filter(x => !['reported','needs-review','fix-failed'].includes(x)).concat('WIP');
return [{ json: { allowed: true, number: issue.number, labels } }];
```

5. **IF** `allowed` is true. False branch: Respond `{ ok: false, error, spoken }`.
6. **HTTP PUT** `.../issues/{{ number }}/labels` with body `{ "labels": {{ $json.labels }} }`. PUT replaces the label set, so the `WIP` swap is atomic and keeps the severity and component labels.
7. **HTTP POST** `.../issues/{{ number }}/comments` with body `{ "body": "Voice-triggered fix started. A pull request will be opened for human review. Nothing is merged automatically." }`.
8. **HTTP POST** `https://api.github.com/repos/OWNER/REPO/actions/workflows/bugbot-fix.yml/dispatches` with body `{ "ref": "main", "inputs": { "issue_number": "{{ number }}" } }`. GitHub returns 204 on success. Set On Error to Continue (using error output).
9. Success output: Respond `{ ok: true, issue_number, status: "WIP", spoken: "Fix started for issue N. It usually takes a few minutes. Ask me for status any time." }`.
10. Error output: HTTP PUT the label set back to `reported`, then Respond `{ ok: false, error: "dispatch_failed", spoken: "I could not start the fix run. The issue is back to not started." }`.

The workflow file must already exist on `main` (section 9), or the dispatch call fails with 404.

### 8.4 `fix-callback`

1. **Webhook** (`bugbot/fix-callback`).
2. **Respond to Webhook** immediately with `{ "ok": true }` so the Actions step does not wait. n8n keeps executing the rest after responding.
3. **HTTP GET** the issue, then **Code**:

```js
const cb = $('Webhook').first().json.body;
const ok = cb.status === 'success' && cb.pr_url;
const names = ($json.labels || []).map(l => l.name).filter(x => !['WIP','reported','needs-review','fix-failed'].includes(x));
const labels = names.concat(ok ? 'needs-review' : 'fix-failed');
const comment = ok
  ? `Fix ready for review: ${cb.pr_url}\nRun: ${cb.run_url}\nA human must review and merge.`
  : `The automated fix did not succeed. Logs: ${cb.run_url}\nSay "fix issue ${$json.number}" to retry.`;
return [{ json: { number: $json.number, labels, comment, ok, pr_url: cb.pr_url } }];
```

4. **HTTP PUT** labels, then **HTTP POST** the comment.
5. Optional **Telegram** node: "Issue N: needs review, PR link" or "fix failed". This is your notification when you are not looking at the dashboard.

### 8.5 `get-status`

1. **Webhook** (`bugbot/get-status`).
2. **HTTP GET** the issue (On Error: Continue).
3. **HTTP GET** `https://api.github.com/repos/OWNER/REPO/pulls?state=open&head=OWNER:fix/issue-{{ issue_number }}` to find the PR.
4. **HTTP GET** `https://api.github.com/repos/OWNER/REPO/actions/workflows/bugbot-fix.yml/runs?per_page=10` to find the active run. Dispatch runs report the branch they were started on (`main`), not the fix branch, so match on the run's `display_title`. The workflow in section 9 sets `run-name: Fix issue #N` for exactly this reason.
5. **Code** builds `status` from the labels and a spoken line: reported becomes "not started", WIP with an in-progress run becomes "being fixed", needs-review with a PR becomes "fix ready, pull request number X", fix-failed becomes "the last fix failed, say fix issue N to retry".
6. **Respond to Webhook**.

### 8.6 Optional hardening (tier 3)

- **Reconciler**: a Schedule trigger every 2 minutes lists `WIP` issues older than 20 minutes with no running workflow and flips them to `fix-failed`. This covers a missed callback if n8n or the tunnel was down.
- **Dedupe window**: ignore a second `start-fix` for the same issue within 30 seconds (the `WIP` check already covers most cases).

**Done when:** each endpoint passes its curl test in section 13, using the test URL first and then the production URL with the workflow Active.

## 9. Step 4: coding agent in GitHub Actions

The fix runs as a GitHub Actions job that n8n triggers with `workflow_dispatch`; the job runs the headless coding agent Aider on a fix branch, runs the tests, opens a PR, and calls n8n back. Budget about 2 hours, mostly for getting one rehearsal run green.

**Why this design:** the job has a hard 15-minute timeout, runs in a throwaway VM, can only push to `fix/*` branches (the ruleset blocks `main`), and costs nothing on a public repo. n8n never holds code or model keys.

**9.1 Prove the agent works on your laptop first**

```bash
pip install aider-chat
export GEMINI_API_KEY=<your key>
cd bugbot-demo-shop
aider --model gemini/<FREE_MODEL_ID> --yes-always --test-cmd "npm test" --auto-test \
  --message "Fix the failing discount test in src/cart.js" src/cart.js tests/cart.test.js
```

Pick `<FREE_MODEL_ID>` from the models Google AI Studio currently lists as free; the free lineup changed several times this year. Reset with `git reset --hard origin/main` and run it three times. If it fixes the bug all three times, move on. If not, try a stronger free model, or see the paid alternative below.

**9.2 The workflow file** at `.github/workflows/bugbot-fix.yml`. It must be committed to `main` before n8n can dispatch it.

```yaml
name: bugbot-fix
run-name: Fix issue #${{ inputs.issue_number }}

on:
  workflow_dispatch:
    inputs:
      issue_number:
        description: Issue number to fix
        required: true
        type: string

permissions:
  contents: write
  pull-requests: write
  issues: write

concurrency:
  group: bugbot-fix-${{ inputs.issue_number }}
  cancel-in-progress: false

jobs:
  fix:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      GH_TOKEN: ${{ github.token }}
      ISSUE: ${{ inputs.issue_number }}
      N8N_URL: ${{ secrets.N8N_CALLBACK_URL }}
      N8N_SECRET: ${{ secrets.N8N_SHARED_SECRET }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Read the issue
        run: |
          gh issue view "$ISSUE" --json title,body > issue.json
          jq -r '"Fix this bug. Make the smallest change that makes the tests pass.\n\nTitle: \(.title)\n\n\(.body)"' issue.json > task.txt

      - name: Create fix branch
        run: |
          git config user.name "bugbot[bot]"
          git config user.email "bugbot@users.noreply.github.com"
          git checkout -B "fix/issue-$ISSUE"

      - name: Run coding agent
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: |
          python -m pip install aider-chat
          for i in 1 2 3; do
            aider --model gemini/<FREE_MODEL_ID> --yes-always --message-file task.txt \
              --test-cmd "npm test" --auto-test $(git ls-files 'src/*' 'tests/*') && break
            echo "attempt $i failed, retrying"; sleep 20
          done

      - name: Verify tests and that something changed
        run: |
          npm test
          test "$(git rev-list --count origin/main..HEAD)" -gt 0

      - name: Push and open PR
        id: pr
        run: |
          git push --force origin "fix/issue-$ISSUE"
          TITLE=$(jq -r .title issue.json)
          URL=$(gh pr view "fix/issue-$ISSUE" --json url -q .url 2>/dev/null || \
            gh pr create --base main --head "fix/issue-$ISSUE" \
              --title "Fix #$ISSUE: $TITLE" \
              --body "Closes #$ISSUE. Opened automatically by VoiceBugBot. Tests pass in this run. A human must review before merging.")
          echo "url=$URL" >> "$GITHUB_OUTPUT"

      - name: Callback to n8n
        if: always()
        run: |
          jq -n --arg issue "$ISSUE" --arg status "${{ job.status }}" \
            --arg pr "${{ steps.pr.outputs.url }}" \
            --arg run "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}" \
            '{issue_number: ($issue|tonumber), status: $status, pr_url: $pr, run_url: $run}' \
          | curl -sS -X POST "$N8N_URL" -H 'Content-Type: application/json' \
              -H "x-bugbot-secret: $N8N_SECRET" -d @-
```

**How it works**

- `run-name` makes each run show up as "Fix issue #N", which `get-status` in section 8.5 matches on.
- Passing every file under `src/` and `tests/` to Aider is the main reliability trick for a small repo: the agent never has to guess which file to edit.
- `--test-cmd` with `--auto-test` makes Aider run the tests itself and keep iterating until they pass. The separate verify step is the independent check.
- The callback has `if: always()`, so n8n hears about failures and cancellations too, and flips the label to `fix-failed`.
- Aider commits as it edits, so the branch carries real commits that show in the PR.

**9.3 Test it with no voice and no n8n**

```bash
gh issue create -t 'Checkout total wrong with discount' -b 'Applying 10 percent subtracts 10 dollars instead.' -l reported
gh workflow run bugbot-fix.yml -f issue_number=1
gh run watch
```

The callback step will fail to reach n8n if it is not up yet; that is fine at this stage. Confirm a branch `fix/issue-1` and a PR appear. A typical run takes 2 to 4 minutes, with most of that spent on `pip install`.

**Gotchas**

- A PR or push created with the default `GITHUB_TOKEN` does not trigger other workflows (such as a CI workflow). That is expected here since the job runs the tests itself.
- If PR creation fails with a permissions error, recheck the two settings in section 5.3.
- Free-tier Gemini returns 429 when rate limited. The retry loop handles short bursts; for the demo, do not run rehearsals back to back right before going on stage.
- Issue text is untrusted input to the agent. See section 12.

**Paid alternative if the free model is unreliable**

Swap the agent step for Claude Code in headless mode: install it with npm, then run `claude -p "$(cat task.txt)"` with `ANTHROPIC_API_KEY` set as a repo secret, restricting its tools to file edits and `npm test`. Commit the result with `git add -A && git commit -m "Fix #$ISSUE"` afterwards. Check the current Claude Code docs for the exact flags, since they change; a single small fix costs on the order of cents.

**Done when:** `gh workflow run` produces a PR with a green local test and the callback reaches n8n (check the n8n executions list).

## 10. Step 5: ElevenLabs voice agent

The agent is a system prompt plus four webhook tools that point at the n8n endpoints from section 7. Do this only after all four endpoints pass their curl tests, so voice minutes go to testing the conversation, not debugging JSON. Budget about 1 hour. Menu names in the ElevenLabs UI change often; the settings below exist, but the labels may differ slightly.

**10.1 Create the agent**

1. In ElevenLabs, open Agents and create a blank agent named `BugBot`.
2. First message: `Hi, I'm BugBot. I can log a bug, list open issues, or start a fix. What's up?`
3. Language: English.
4. LLM: choose a fast model that supports tool calling well. Latency matters more than depth here, so a Flash-class model is a good default. Pick from whatever the dropdown currently offers.
5. Voice: pick a clear, neutral voice and use the low-latency speech model option if there is one.
6. Paste the system prompt below.

**10.2 System prompt**

```text
You are BugBot, a calm, brisk voice assistant that helps developers log, list and fix bugs in one GitHub repository called bugbot-demo-shop. Keep replies to one or two sentences. This is a voice call, so never read URLs, code or long numbers aloud, and say issue numbers like "issue four".

You can do four things:
1. Report a bug (tool: create_issue)
2. List issues (tool: list_issues)
3. Start an automated fix (tool: start_fix)
4. Check progress (tool: get_status)

Reporting a bug
- Collect what happened (title and description), steps to reproduce, environment (browser, device or OS) and how severe it feels. If the person already gave something, do not ask again.
- Ask at most two questions at a time. If they do not know something, move on and leave it blank.
- Before filing, read back a one-sentence summary and ask "Should I file that?". Only after a clear yes, call create_issue with confirmed set to true.
- If the result says it may be a duplicate, name that issue and ask whether to add to it or file a new one. Then call create_issue again with append_to (add to it) or force_create (file new).

Starting a fix
- When they say "fix issue N", or "fix that one" right after you filed or listed it, say the issue number and title and ask "Start the fix?". Only after a clear yes, call start_fix with confirmed set to true.
- Never call start_fix without a spoken yes for that exact issue in this conversation.
- After it starts, say it takes a few minutes and that they can ask you for status any time. Do not wait or poll.

Rules
- Base what you say on the "spoken" field in tool results. If a tool returns ok false, say the spoken message and offer the next step.
- If a tool fails or times out, say so plainly and offer to try once more. Never claim something was filed or started unless a tool result says so.
- If the issue number is unclear, call list_issues first.
- Stay on bugs and fixes. If asked about anything else, say what you can do.
```

**10.3 Add the four tools**

On the agent's Tools tab add four webhook (server) tools. For each: method `POST`, URL `https://YOUR-DOMAIN.ngrok-free.app/webhook/bugbot/<endpoint>`, and a header `x-bugbot-secret` carrying your shared secret. Use the workspace secrets feature for the header value if it is offered, so the secret is not pasted into the prompt or visible in transcripts.

| Tool name | URL path | Description the model reads |
| --- | --- | --- |
| `create_issue` | `create-issue` | Files a bug as a GitHub issue. Call only after the user said yes to your read-back. |
| `list_issues` | `list-issues` | Lists issues so you can read them out. Use before any fix if the number is unclear. |
| `start_fix` | `start-fix` | Starts the automated fix for one issue. Call only after the user said yes to starting that exact fix. |
| `get_status` | `get-status` | Gets the current state of one issue, including whether a pull request exists. |

Body parameters (all sent as JSON; give every parameter a plain-English description because the model decides what to fill from it):

| Tool | Parameter | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `create_issue` | `title` | string | yes | Short title, under 12 words |
| `create_issue` | `description` | string | yes | What went wrong and what was expected |
| `create_issue` | `steps_to_reproduce` | string | no | Steps in order |
| `create_issue` | `environment` | string | no | Browser, device or OS |
| `create_issue` | `severity_hint` | string | no | One of low, medium, high, critical; a guess only |
| `create_issue` | `component_hint` | string | no | One of frontend, api, database |
| `create_issue` | `confirmed` | boolean | yes | True only if the user said yes to the read-back |
| `create_issue` | `force_create` | boolean | no | True to file even though a duplicate was suggested |
| `create_issue` | `append_to` | integer | no | Existing issue number to add the details to instead |
| `list_issues` | `status` | string | no | open, wip, review, failed or all; default open |
| `list_issues` | `limit` | integer | no | How many to return; default 5 |
| `start_fix` | `issue_number` | integer | yes | The issue to fix |
| `start_fix` | `confirmed` | boolean | yes | True only if the user said yes to starting this fix |
| `get_status` | `issue_number` | integer | yes | The issue to check |

Set each tool to wait for its response before the agent continues, and set the response timeout to around 10 seconds, enough for the roughly 3-second `create_issue` path with margin.

**10.4 Widget and security**

- On the Widget tab choose a compact layout and a short avatar label. Copy the agent id; the dashboard in section 11 embeds it.
- In the agent's security settings, add an allowlist of the hosts that may use the widget: `localhost` and your Vercel domain. Keep the agent public for the hackathon; authenticated agents need a signed-URL backend you do not need.

**10.5 Test inside the ElevenLabs builder**

Run the four scripted conversations from section 13 using the built-in test call. After each one, open the conversation history and confirm that each tool call shows the request body and the `spoken` field you expect. Fix the prompt, not the n8n workflow, when the agent sends the wrong parameter.

**Minute discipline**

- Every test call burns free minutes, including silences. End calls promptly by closing the widget.
- Prefer two short tests over one long one, and write down the 4 utterances you will test before you start the call.

**Done when:** a spoken bug report ends with a real issue in GitHub, and "fix issue one" ends with the `WIP` label and a running Actions job.

## 11. Step 6: status dashboard (Next.js)

The dashboard is a four-column board that reads GitHub labels every few seconds, plus the ElevenLabs widget docked in the corner. It needs no database: GitHub is the source of truth. Budget about 2 hours, and it is the first thing to cut if time runs short (section 14).

**11.1 Scaffold and configure**

```bash
npx create-next-app@latest bugbot-dashboard --ts --app --tailwind
cd bugbot-dashboard && npm i swr
```

Create `.env.local` (and the same three variables in Vercel later):

```bash
GITHUB_REPO=OWNER/bugbot-demo-shop
GITHUB_TOKEN=<fine-grained token, read-only: Issues and Pull requests>
NEXT_PUBLIC_AGENT_ID=<ElevenLabs agent id>
```

Use a separate read-only token here so the dashboard can never write to the repo.

**11.2 API route: `app/api/issues/route.ts`**

The route calls GitHub server-side, so the token never reaches the browser, maps labels to a status, attaches the PR link, and caches for 3 seconds so several open tabs share one upstream call (GitHub allows 5,000 authenticated requests per hour).

```ts
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

let cache: { at: number; body: unknown } | null = null;
const gh = (path: string) =>
  fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}${path}`, {
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  }).then(r => r.json());

export async function GET() {
  if (cache && Date.now() - cache.at < 3000) return NextResponse.json(cache.body);
  const [issues, pulls] = await Promise.all([
    gh('/issues?state=open&per_page=50'),
    gh('/pulls?state=open&per_page=50'),
  ]);
  if (!Array.isArray(issues) || !Array.isArray(pulls)) return NextResponse.json([], { status: 502 });

  const prByIssue: Record<string, string> = {};
  for (const p of pulls) {
    const m = /^fix\/issue-(\d+)$/.exec(p.head?.ref ?? '');
    if (m) prByIssue[m[1]] = p.html_url;
  }
  const body = issues
    .filter((i: any) => !i.pull_request)
    .map((i: any) => {
      const names: string[] = i.labels.map((l: any) => l.name);
      const status = names.includes('fix-failed') ? 'fix-failed'
        : names.includes('needs-review') ? 'needs-review'
        : names.includes('WIP') ? 'WIP' : 'reported';
      return {
        number: i.number, title: i.title, status, url: i.html_url,
        sev: (names.find(n => n.startsWith('sev:')) ?? 'sev:medium').slice(4),
        comp: (names.find(n => n.startsWith('comp:')) ?? '').slice(5),
        pr: prByIssue[i.number] ?? null,
      };
    });
  cache = { at: Date.now(), body };
  return NextResponse.json(body);
}
```

**11.3 Board component: `app/Board.tsx`**

```tsx
'use client';
import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then(r => r.json());
const COLS = [
  { key: 'reported', title: 'Reported' },
  { key: 'WIP', title: 'In progress' },
  { key: 'needs-review', title: 'Needs review' },
  { key: 'fix-failed', title: 'Failed' },
];

export default function Board() {
  const { data = [] } = useSWR('/api/issues', fetcher, { refreshInterval: 4000 });
  return (
    <div className="grid grid-cols-4 gap-4 p-6">
      {COLS.map(c => (
        <section key={c.key}>
          <h2 className="mb-2 font-semibold">{c.title}</h2>
          {data.filter((i: any) => i.status === c.key).map((i: any) => (
            <a key={i.number} href={i.pr ?? i.url} target="_blank"
               className="mb-2 block rounded-lg border p-3 transition-all">
              <div className="text-sm text-gray-500">#{i.number} · {i.sev}{i.comp && ` · ${i.comp}`}</div>
              <div>{i.title}</div>
              {c.key === 'WIP' && <div className="mt-1 animate-pulse text-xs">fix running…</div>}
            </a>
          ))}
        </section>
      ))}
    </div>
  );
}
```

**11.4 Voice widget: `app/VoiceWidget.tsx`**

Creating the custom element with `createElement` avoids TypeScript errors about an unknown JSX tag.

```tsx
'use client';
import Script from 'next/script';
import { createElement } from 'react';

export default function VoiceWidget() {
  return (
    <>
      {createElement('elevenlabs-convai', { 'agent-id': process.env.NEXT_PUBLIC_AGENT_ID })}
      <Script src="https://unpkg.com/@elevenlabs/convai-widget-embed" strategy="afterInteractive" />
    </>
  );
}
```

Then render `<Board />` and `<VoiceWidget />` in `app/page.tsx`. Check the ElevenLabs widget tab for the current embed snippet in case the script URL or attribute name has changed.

**11.5 Deploy**

1. Push the dashboard to its own GitHub repo.
2. Import it in Vercel, add the three environment variables, deploy.
3. Add the Vercel domain to the agent's allowlist in ElevenLabs (section 10.4).
4. Open the deployed site on the laptop you will demo on and grant microphone permission once, ahead of time.

**11.6 Optional upgrades, in order of demo value**

- A flash highlight when a card changes column (compare the previous poll in a `useRef`).
- A live transcript panel using the `@elevenlabs/react` `useConversation` hook with an `onMessage` handler, in place of the stock widget. This also lets you show the tool calls as they fire.
- An activity feed built from the issue comments the workflows post ("fix started", "fix ready").
- Supabase Realtime for a streaming run log, if you want sub-second updates instead of polling. The core system does not need it.

**Done when:** a card created by a curl call shows up on the board within about 5 seconds, and relabeling the issue in GitHub moves it between columns.

## 12. Safety, error handling and edge cases

The pitch is "voice-controlled, human-approved", so the design has three hard guarantees: nothing starts without a spoken yes, nothing reaches `main` without a human merge, and every failure ends in a visible `fix-failed` label rather than silence.

**The three guarantees and how they are enforced**

1. **Spoken confirmation.** The prompt demands a yes, and the n8n endpoints independently reject `confirmed: false`, so a prompt slip cannot start a fix.
2. **Human merge only.** The ruleset on `main` requires a pull request and blocks force pushes; the agent only pushes to `fix/*`; the workflow never merges.
3. **Visible failures.** The callback runs with `if: always()`, the job has a 15-minute timeout, and the optional reconciler catches missed callbacks.

**Edge cases**

| Case | What happens | Mitigation |
| --- | --- | --- |
| Speech recognized wrongly ("issue 14" vs "issue 40") | Wrong issue gets fixed | The agent says the number and title back and asks "Start the fix?" before calling `start_fix` |
| User says "fix issue 4" twice | Two runs for one issue | `WIP` check in `start-fix` plus the Actions `concurrency` group |
| Issue is closed or missing | Nothing to fix | `start-fix` returns `ok: false` with a spoken explanation, HTTP 200 |
| n8n or the tunnel is down mid-demo | Tool call fails | Agent prompt says to report the failure and offer one retry; keep the curl fallback script from section 13 ready |
| Actions job fails, times out or is cancelled | No PR | Callback sets `fix-failed` and comments the run link; saying "fix issue N" again retries |
| Callback never arrives | Issue stuck on `WIP` | Reconciler workflow (section 8.6) or `get-status`, which also reads the run state |
| Agent edits the wrong file or breaks other tests | Bad PR | Job runs `npm test` independently and fails if red; a human reviews the diff before merge |
| Gemini returns 429 | Agent step fails | Three attempts with a 20-second pause; avoid back-to-back rehearsals just before the demo |
| Duplicate bug reported by voice | Noise in the tracker | LLM duplicate check compares against open issues and asks the user |
| ElevenLabs free minutes run out | Voice stops working | Track minutes; ask organizers for credits; Starter plan is about $6/month; the curl fallback keeps the demo alive |
| Tool called with missing fields | n8n expression errors | Code nodes default every field (`b.steps_to_reproduce \|\| 'not provided'`) |

**Prompt injection: the one real security issue**

The spoken bug description becomes the issue body, and the issue body becomes the coding agent's instructions. Anyone who can file issues could therefore try to steer the agent (for example, "also add this line that sends the environment variables somewhere"). For the hackathon, only the bot files issues in a repo you control, so the risk is low, but you should still be able to explain the controls:

- The job's only secrets are the Gemini key, the callback secret and a repo-scoped `GITHUB_TOKEN`; the token cannot touch `main`.
- The agent's output is a PR diff that a human reads before merge.
- For anything beyond a demo: restrict `start-fix` to issues carrying a label that only maintainers can apply, and never run it on issues filed by outside users.

**Secrets hygiene**

- Use fine-grained tokens limited to one repo with a 7-day expiry.
- Never put the shared secret in the system prompt; it lives in the tool header only.
- Do not commit `.env.local` or paste tokens into screen shares during the demo.

## 13. Testing plan and demo readiness

Test bottom-up: curl proves the backend, a manual workflow dispatch proves the agent, and only then do voice minutes go to the conversation. Every layer is verified before the next one depends on it.

**13.1 Backend tests with curl (no voice minutes)**

```bash
export BASE=https://YOUR-DOMAIN.ngrok-free.app/webhook/bugbot
export S=<shared secret>
call() { curl -s -X POST "$BASE/$1" -H "x-bugbot-secret: $S" -H 'Content-Type: application/json' -d "$2"; echo; }

call create-issue '{"title":"Checkout total wrong with discount","description":"A 10 percent code subtracts 10 dollars","steps_to_reproduce":"Add 200 dollar cart, apply SAVE10","environment":"Chrome 130","severity_hint":"high","component_hint":"frontend","confirmed":true}'
call list-issues '{"status":"open","limit":5}'
call start-fix '{"issue_number":1,"confirmed":true}'
call get-status '{"issue_number":1}'
```

| Test | Expected result |
| --- | --- |
| `create-issue` with `confirmed: true` | `created: true`, issue appears in GitHub with `reported`, one `sev:` and one `comp:` label |
| `create-issue` with `confirmed: false` | `ok: false`, `confirmation_required`, nothing created |
| `create-issue` with the same title again | `created: false` and `duplicate_of` pointing at issue 1 |
| `list-issues` | Spoken summary under 20 seconds, no PRs in the list |
| `start-fix` with `confirmed: false` | `confirmation_required`, no label change, no Actions run |
| `start-fix` valid | `WIP` label, a comment, and a run named "Fix issue #1" appears in Actions |
| `start-fix` again while running | `already_in_progress` |
| `get-status` while running | Says the fix is in progress |
| `fix-callback` with `status: success` and a PR URL | Label becomes `needs-review`, comment posted |
| `fix-callback` with `status: failure` | Label becomes `fix-failed` |
| Any endpoint without the header | HTTP 401 |

To test `fix-callback` alone: `call fix-callback '{"issue_number":1,"status":"success","pr_url":"https://github.com/OWNER/REPO/pull/3","run_url":"https://example.com"}'`.

**13.2 Agent test (Actions only):** run section 9.3 three times in a row, resetting between runs. Do not proceed unless the PR appears with green tests each time.

**13.3 Voice tests (about 6 minutes of free minutes in total)**

Write these utterances down before starting each call, and end the call as soon as the check passes.

1. **Report.** "I found a bug. The checkout total is wrong when I apply a discount code." Answer follow-ups with "add a two hundred dollar cart and apply SAVE10", "Chrome on Mac", "pretty serious", then "yes". Check: issue exists with labels, and the agent said the issue number.
2. **Duplicate.** Report the same bug again. Check: the agent names the existing issue and asks what to do, and nothing is created until you answer.
3. **List and fix.** "What's open?" then "Fix issue one." then "Yes." Check: `WIP` label appears within a few seconds, and the agent does not wait for the fix.
4. **Status.** "How's issue one going?" Check: the answer matches the label and PR state.

**13.4 Reset script between rehearsals**

```bash
#!/usr/bin/env bash
# usage: ./reset-demo.sh 1
N=${1:-1}
gh pr close "fix/issue-$N" --delete-branch 2>/dev/null || true
gh issue reopen "$N" 2>/dev/null || true
gh issue edit "$N" --remove-label WIP --remove-label needs-review --remove-label fix-failed --add-label reported
```

Do not merge the PR during rehearsals, because a merge puts the fix on `main` and removes your seeded bug. If you want to merge live on stage, keep a second seeded bug on a separate branch you can re-apply.

**13.5 Demo readiness checklist**

- [ ] n8n container running and all five workflows set to Active
- [ ] Tunnel up, `/healthz` OK, and the URL matches the ElevenLabs tools and the `N8N_CALLBACK_URL` secret
- [ ] GitHub token not expired (7-day expiry)
- [ ] Gemini key works and no 429 in the last 10 minutes
- [ ] Repo reset: seeded bug present, no stale `fix/*` branches or open PRs
- [ ] Dashboard deployed, microphone permission already granted, widget loads
- [ ] At least 8 ElevenLabs minutes left
- [ ] A screen recording of one full successful run, with audio, as a backup video
- [ ] A `demo-fallback.sh` that fires the same four curl calls with pauses while you narrate, in a second terminal
- [ ] Laptop plugged in, sleep disabled, phone hotspot ready as a network fallback
- [ ] Final smoke test done with curl only, 30 minutes before; no full voice rehearsal in the last 15 minutes (it burns minutes and Gemini rate limit)

## 14. Timeline, team split, cost and risks

Build in five tiers, where each tier is a complete demo you could present, so running out of time costs polish rather than the whole project. Hour counts are my estimates for a team that has used these tools before; add 50 percent if n8n or ElevenLabs is new to you.

**Build tiers (do not start a tier until the previous one's check passes)**

| Tier | What ships | Est. hours | Done when |
| --- | --- | --- | --- |
| T0 Foundations | Accounts, repo with seeded bug, labels, ruleset, n8n plus tunnel, tokens, secrets (sections 4 to 6) | 2 | A curl to a test webhook returns JSON, and a push to `main` is rejected |
| T1 Voice report and list | Workflows 8.1 and 8.2 (hints-based labels first, LLM triage later), ElevenLabs agent with `create_issue` and `list_issues` | 3 | A spoken bug becomes a labeled GitHub issue, and "what's open" is read back |
| T2 Fix loop (minimum viable demo) | Workflows 8.3 to 8.5, Actions workflow, `start_fix` and `get_status` tools | 4 | "Fix issue one" leads to `WIP`, a PR with green tests, then `needs-review` |
| T3 Dashboard | Board, widget, Vercel deploy (section 11) | 2 | A card moves columns on its own within 5 seconds |
| T4 Polish | LLM duplicate and severity triage, Telegram notice, reconciler, live transcript, backup video, rehearsals | 3 or more | Two clean runs in a row, backup video recorded |

If time runs short, cut T4 first, then T3. Without the dashboard, show the GitHub issue list with its labels on a second screen; the demo still works.

**Team split**

| Person | Owns | Interface they rely on |
| --- | --- | --- |
| A: voice and backend | n8n workflows, ElevenLabs agent and prompt | The contract in section 7 |
| B: fix pipeline | Repo, seeded bug, Actions workflow, Aider tuning, callback | The label state machine in section 5.2 and the callback payload in section 7 |
| C: dashboard and demo | Next.js board, Vercel, reset and fallback scripts, backup video, pitch | The label names and the `/api/issues` shape |

With two people, merge B and C. Solo, follow the tiers strictly in order. Agree the section 7 contract in the first 30 minutes so A, B and C can work in parallel against it.

**Cost summary**

| Item | Expected | Realistic worst case |
| --- | --- | --- |
| ElevenLabs agent minutes | $0 (15 free minutes) | $6 for the Starter plan |
| n8n | $0 (self-hosted) | About $7 for a small VPS |
| GitHub and Actions | $0 (public repo) | $0 |
| Coding agent LLM | $0 (Gemini free tier) | A few dollars if you switch to a paid model |
| Vercel and tunnel | $0 | $0 |
| **Total** | **$0** | **About $15** |

**Risks and mitigations**

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| The coding agent does not fix the bug reliably | Medium | High | Test it 3 times locally first, pass all files, try a stronger model, keep the backup video |
| Free ElevenLabs minutes run out | High | High | Test with curl first, ask the sponsor for credits, Starter plan as backup |
| Tunnel or laptop drops during the demo | Medium | High | Static domain, power and no sleep, hotspot, `demo-fallback.sh`, backup video |
| Agent skips confirmation or sends wrong parameters | Medium | Medium | Server-side `confirmed` check, clear tool descriptions, scripted voice tests |
| Awkward silence while a tool runs | Low | Medium | Keep tools under 5 seconds, `start_fix` returns immediately |
| Free Gemini limits or models change | Medium | Medium | Check limits early, keep a paid key as a backup |
| Other teams build the same voice and GitHub idea | High | Medium | Differentiate with the fix loop, duplicate detection, the live board and the human-approved safety story |

**Decisions still open**

- Hackathon duration and team size, which decide how many tiers fit.
- Which currently-free Gemini model gives the most reliable fixes (section 9.1).
- Whether ElevenLabs sponsor credits are available at the event.
- Whether to merge a PR live in the demo (needs a re-seedable second bug).
