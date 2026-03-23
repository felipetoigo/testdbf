# testdbf

Small Node.js utilities that use [Playwright](https://playwright.dev/) to work with Dotabuff pages (for example, scraping match lists from `src/listOfMatches.ts`).

## What you need on a new machine (Windows)

### 1. Node.js

Install the **current LTS** version of Node.js for Windows from [https://nodejs.org/](https://nodejs.org/).

After installation, confirm in **Command Prompt** or **PowerShell**:

```text
node -v
npm -v
```

### 2. Git (optional but recommended)

If you will clone the repo from GitHub, install [Git for Windows](https://git-scm.com/download/win). If you only copy the project folder as a ZIP, you can skip Git.

### 3. Get the project

Either clone:

```bash
git clone https://github.com/felipetoigo/testdbf.git
cd testdbf
```

Or extract a ZIP of the project and open a terminal in that folder.

### 4. Install JavaScript dependencies

In the project folder:

```bash
npm install
```

This project includes both `package-lock.json` and `yarn.lock`. Prefer **`npm install`** unless you already use Yarn and know you want it.

### 5. Install Playwright browsers (required)

Playwright downloads its own Chromium (and related files). Run this once per machine after `npm install`:

```bash
npx playwright install chromium
```

On Windows, if the browser fails to start, install the **Microsoft Visual C++ Redistributable** from Microsoft’s support site (Playwright’s troubleshooting docs link the current package when needed).

### 6. Run the TypeScript scripts

From the project folder (after `npm install`, which includes `tsx`):

```bash
npm run matches
```

or:

```bash
npm run strat
```

You can also run files directly:

```bash
npx tsx src/listOfMatches.ts
npx tsx src/dotabuffStrat.ts
```

**Headless mode (important on Windows without a normal desktop):** By default the scripts open a visible Chromium window. On some Windows setups (remote server, certain CI, or no GPU), that can fail or hang. Run headless instead:

**Command Prompt:**

```bat
set HEADLESS=1&& npm run matches
```

**PowerShell:**

```powershell
$env:HEADLESS = "1"; npm run matches
```

`CI=true` also forces headless (same as many CI systems).

### Other files

- `src/dotabuffStrat.js` — compiled-style JavaScript; you can run it with `node src/dotabuffStrat.js` if it matches how you use the project.
- `src/dotabuffStrat.ts` — TypeScript source; run with `npx tsx src/dotabuffStrat.ts` if you use the `.ts` file.

### Build with webpack (optional)

Install webpack first (it is not a default dependency), then from the project root:

```bash
npm install -D webpack webpack-cli
npx webpack
```

`webpack.config.js` points at `src/dotabuffStrat.js` using `path.join`, so it works the same on Windows and macOS regardless of path separators.

## Troubleshooting

| Issue | What to try |
|--------|--------------|
| `Executable doesn't exist` / missing browser | Run `npx playwright install chromium` again. |
| `Permission denied` when cloning/pushing | Use HTTPS and a GitHub **Personal Access Token**, or set up **SSH keys** on the new PC. |
| Script runs but hero data is empty or “unknown” | Dotabuff may have changed the page or blocked automation; selectors in the script may need updating. |
| Browser fails to open or crashes on Windows | Set `HEADLESS=1` (see above) or install the **Visual C++ Redistributable**; avoid running as Administrator unless needed. |

## License

Add a license here if you publish the repo publicly.
