# BugBot Automation Scripts

This folder contains PowerShell utility scripts to streamline repository setup, local API testing, and rehearsal resets.

---

## Scripts

### 1. `setup-labels.ps1`
Initializes the BugBot state machine and triage labels on your GitHub repository (`aryanSharma48/smoothapi`).

```powershell
# Usage:
.\setup-labels.ps1 -Repo "aryanSharma48/smoothapi" -Token "your_github_token"
```

Creates:
- Status Labels: `reported`, `WIP`, `needs-review`, `fix-failed`
- Severity Labels: `sev:low`, `sev:medium`, `sev:high`, `sev:critical`
- Component Labels: `comp:typescript`, `comp:python`, `comp:docs`

---

### 2. `test-endpoints.ps1`
Validates the n8n webhook API contract without burning ElevenLabs voice call minutes.

```powershell
# Usage:
.\test-endpoints.ps1 -BaseUrl "https://your-domain.ngrok-free.app/webhook/bugbot" -Secret "your_shared_secret"
```

Tests:
- `list-issues`
- `create-issue` (verifies double confirmation rejection when `confirmed: false`)
- `get-status`

---

### 3. `reset-demo.ps1`
Restores an issue back to its initial reported state between demo rehearsals.

```powershell
# Usage:
.\reset-demo.ps1 -IssueNumber 1 -Repo "aryanSharma48/smoothapi" -Token "your_github_token"
```

Actions taken:
1. Resets issue labels back to `reported`, `sev:high`, `comp:typescript`.
2. Locates and closes any open Pull Request for `fix/issue-1`.
3. Deletes the remote git branch `fix/issue-1`.
