# k8s YAML Trainer (Web)

Interactive web app for learning Kubernetes manifests — type YAML live with instant validation.

## Stack

- **Next.js** (App Router)
- **CodeMirror** — live YAML editor
- **yaml** — manifest parsing
- **localStorage** — progress tracking (no database)

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- Live YAML editor with syntax highlighting
- Real-time validation (debounced ~350ms)
- Scaffold templates per resource kind
- Best-practice checks (probes, resources, image tags)
- Progress tracking in browser localStorage

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/train` | Training workspace |
| `/debug` | Fix broken manifests |
| `/progress` | Score history & streaks |

## Support links

Optional LinkedIn, website, and Buy Me a Coffee buttons (footer on every page, banner on the homepage). Buttons only show for URLs you configure in `.env.local`:

```bash
cp .env.example .env.local
# NEXT_PUBLIC_LINKEDIN_URL, NEXT_PUBLIC_WEBSITE_URL, NEXT_PUBLIC_BUYMEACOFFEE_URL
```
