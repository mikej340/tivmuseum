# Apps Script deployment

The `Deploy Apps Script` GitHub Actions workflow (`.github/workflows/deploy-appscript.yml`)
pushes `appscript.js` to the Apps Script project and redeploys the existing
web app deployment whenever `appscript.js` changes on `main`. Because it
redeploys the *same* deployment, the URL hardcoded in `index.html` does not
change.

## One-time setup

You'll need three GitHub Actions secrets and one committed file
(`appsscript.json`). Do these once.

### 1. Install clasp locally

```bash
npm install -g @google/clasp@2.4.2
```

### 2. Pull your existing manifest

clasp won't push without an `appsscript.json` manifest. Pull yours so that the
existing project settings (timezone, web app access, OAuth scopes) are not
overwritten:

```bash
cd /path/to/tivmuseum
clasp login           # opens a browser
clasp clone <SCRIPT_ID> --rootDir .   # fetches appsscript.json (and writes a local .clasp.json — gitignored)
git add appsscript.json
git commit -m "Add Apps Script manifest"
```

If `clasp clone` complains that the directory isn't empty, run
`clasp pull` instead after writing a temporary `.clasp.json` by hand.

### 3. Find the three IDs

| Where | What |
| --- | --- |
| Apps Script editor → **Project Settings** (gear icon) → **IDs** → *Script ID* | `SCRIPT_ID` |
| Apps Script editor → **Deploy** → **Manage deployments** → click the existing web app deployment → *Deployment ID* | `DEPLOYMENT_ID` |
| `~/.clasprc.json` on your machine, after `clasp login` | `CLASPRC_JSON` (the entire file contents) |

The `~/.clasprc.json` file holds an OAuth refresh token. Treat it like a
password — it grants write access to your Apps Script projects.

### 4. Add the secrets to GitHub

GitHub repo → **Settings** → **Secrets and variables** → **Actions** →
**New repository secret**. Add:

- `SCRIPT_ID`
- `DEPLOYMENT_ID`
- `CLASPRC_JSON` (paste the full JSON contents of `~/.clasprc.json`)

### 5. Trigger a deploy

Either push a change to `appscript.js` on `main`, or run the workflow
manually from the **Actions** tab → *Deploy Apps Script* → *Run workflow*.

## How redeploy keeps the URL stable

`clasp deploy --deploymentId <id>` updates the existing deployment in place
with a new version. The web app URL is tied to the deployment, not the
version, so it remains `https://script.google.com/macros/s/<deployment_id>/exec`
across deploys — which is what `index.html` references.

If you ever need a fresh URL (e.g. after rotating `authToken`), create a new
deployment manually in the Apps Script editor, update both `index.html` and
the `DEPLOYMENT_ID` secret, then push.

## Troubleshooting

- **`User has not enabled the Apps Script API`** — visit
  https://script.google.com/home/usersettings and turn it on for the Google
  account you logged in as.
- **`Invalid credentials`** — your `CLASPRC_JSON` secret has expired. Run
  `clasp login` again locally and re-paste the new contents.
- **Workflow says `appsscript.json is missing`** — see step 2 above.
