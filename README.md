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

The repo does not pin a single “run” script in `package.json`. The usual way is to execute TypeScript with **`tsx`** (no global install required):

```bash
npx tsx src/listOfMatches.ts
```

The first time, `npx` may download `tsx`; that is normal.

**Headless vs visible browser:** `listOfMatches.ts` launches Chromium with `headless: false` by default, so a browser window should open on Windows. If you run in an environment without a desktop (or you prefer no window), change `headless` to `true` in the script.

### Other files

- `src/dotabuffStrat.js` — compiled-style JavaScript; you can run it with `node src/dotabuffStrat.js` if it matches how you use the project.
- `src/dotabuffStrat.ts` — TypeScript source; run with `npx tsx src/dotabuffStrat.ts` if you use the `.ts` file.

### Build with webpack (optional)

If you use the Webpack setup:

```bash
npx webpack
```

Output is configured for `./dist` per `tsconfig.json` / `webpack.config.js` (adjust as your local webpack config expects).

## Troubleshooting

| Issue | What to try |
|--------|--------------|
| `Executable doesn't exist` / missing browser | Run `npx playwright install chromium` again. |
| `Permission denied` when cloning/pushing | Use HTTPS and a GitHub **Personal Access Token**, or set up **SSH keys** on the new PC. |
| Script runs but hero data is empty or “unknown” | Dotabuff may have changed the page or blocked automation; selectors in the script may need updating. |

## License

Add a license here if you publish the repo publicly.
