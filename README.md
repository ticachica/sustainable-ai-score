# SustainableAI Score

**See how your AI stack really stacks up.**

A 6-dimension framework rating AI providers and tools on environmental and societal sustainability. Interactive web app to explore scores, filter by tier, compare dimension profiles, and read full evaluation reports with sources.

**Live site:** https://sustainable-ai-score.jarguello.workers.dev

---

## How it works

The site is data driven. Provider evaluations live in a single JSON dataset that the page fetches at runtime, so scores and source citations can be updated without touching the front end.

```
sustainable-ai-score/
├── index.html                    # the app: layout, styling, rendering
├── data/
│   └── providers.json            # single source of truth for all evaluations
├── src/
│   └── worker.js                 # serves GET /api/providers, falls through to assets
├── wrangler.jsonc                # Worker config: script entry point plus assets binding
├── .assetsignore                 # keeps internal files out of the public asset upload
├── LICENSE
└── README.md
```

Data flow:

```
data/providers.json
        │
        ├──▶ src/worker.js  ──reads via ASSETS──▶  GET /api/providers   (preferred)
        │
        └──▶ served as a static asset          ──▶  GET /data/providers.json (fallback)
                        │
                        ▼
                  index.html fetches, then renders
```

`index.html` requests `/api/providers` first and falls back to `/data/providers.json` if the endpoint is unavailable, so the page still works when it is opened directly from disk or hosted somewhere without a Worker.

The deployment is a single Cloudflare Worker. Files in the repo are served as static assets through the `ASSETS` binding, and `src/worker.js` only runs for requests that do not match a file, which is how `/api/providers` is answered. The endpoint reads the dataset back through `ASSETS` rather than duplicating it, so `data/providers.json` remains the single source of truth. There is no database and no third party dependency: the Worker validates the JSON before serving it and returns CORS and cache headers.

---

## The framework

Every provider is scored across six dimensions, each rated 1 to 5.

| Dimension | What it measures |
|-----------|------------------|
| **Hardware & Manufacturing** | Supply chain ethics, conflict minerals, fab locations, forced labor risk, right to repair |
| **Data Center Operations** | Grid carbon intensity, renewable matching quality, water use, community impact |
| **Training Footprint** | Training compute and energy disclosed, dataset sourcing, labeling labor conditions |
| **Inference Efficiency** | Model size choices, quantization, sparse architectures, local inference support |
| **Company Governance** | Open versus closed weights, sustainability reporting, labor practices, litigation |
| **Tool/Agent Design** | Local-first capability, caching, model routing, per-call cost transparency |

**Total possible:** 6 to 30. Higher is better.

### Scoring tiers

| Score | Tier |
|-------|------|
| 26 to 30 | Excellent |
| 21 to 25 | Good |
| 16 to 20 | Mixed |
| 10 to 15 | Poor |
| 6 to 9 | Avoid |

### Personal modifiers

Provider scores describe the provider. Your own setup can score differently:

- **+1 Hardware** for reusing an existing device, which avoids new manufacturing impact
- **+1 Data Center** for local inference powered by solar or another site-generated renewable

The "Your setup" section of the site applies these modifiers and shows the resulting score alongside the unmodified base.

---

## Providers evaluated

Generated from `data/providers.json`.

| Provider | Score | Tier |
|----------|:-----:|------|
| Hermes CLI + Gemma 4 (local, solar) | 28/30 | Excellent |
| Mistral AI | 22/30 | Good |
| Meta (Llama) | 20/30 | Mixed |
| Google DeepMind (Gemini) | 19/30 | Mixed |
| DeepSeek V4 Flash | 18/30 | Mixed |
| Anthropic (Claude) | 16/30 | Mixed |
| Claude Desktop | 16/30 | Mixed |
| OpenAI Codex CLI | 15/30 | Poor |
| xAI / SpaceXAI (Grok) | 10/30 | Poor |

---

## Data model

Each provider in `data/providers.json` looks like this:

```json
{
  "id": "example-provider",
  "name": "Example Provider",
  "kind": "provider",
  "scores": { "hw": 2, "dc": 2, "train": 1, "infer": 4, "gov": 2, "tool": 4 },
  "verdict": "Poor",
  "summary": "One or two sentence characterisation.",
  "tradeoffs": "What you gain weighed against what you give up.",
  "gaps": ["Key open question one", "Key open question two"],
  "sources": [
    { "label": "Human readable source title", "url": "https://example.com" }
  ],
  "lastReviewed": "2026-10-03",
  "changeNotes": "What changed since the previous review."
}
```

Notes on the format:

- Dimension keys are fixed and ordered: `hw`, `dc`, `train`, `infer`, `gov`, `tool`. The totals and tiers are computed at render time from `scores`, so they cannot drift out of sync with the dimension values.
- Sources use `{label, url}` objects rather than bare URL strings, so citations render as readable links. A source with no public URL simply omits the `url` key and renders as plain text.
- `lastReviewed` and `changeNotes` record when a provider was last re-checked and what moved.

---

## Tech stack

- **Vanilla HTML, CSS, and JavaScript.** No build step, no framework, no bundler.
- **Chart.js** (CDN) for the bar chart and radar chart.
- **Tailwind CSS** (CDN) for styling, with a small custom layer for cards, tiers, and charts.
- **Cloudflare Workers** for hosting, with one small Worker script serving the API endpoint.

---

## Local development

Any static file server works. The page falls back to the static JSON when no API route exists.

```bash
git clone https://github.com/ticachica/sustainable-ai-score.git
cd sustainable-ai-score
python3 -m http.server 8000
# open http://localhost:8000
```

To exercise the Worker and the `/api/providers` endpoint locally, run it through the Cloudflare tooling instead:

```bash
npx wrangler dev
```

---

## Updating the data

1. Edit `data/providers.json`. Keep dimension values as integers from 1 to 5.
2. Set `lastReviewed` on each provider you touched and describe the change in `changeNotes`.
3. Update `meta.lastUpdated`.
4. Validate the dataset before committing. Check that every dimension is an integer from 1 to 5, that the summed total falls in the right tier, and that the declared `verdict` matches that tier:

```bash
node -e "
const d = JSON.parse(require('fs').readFileSync('data/providers.json','utf8'));
const keys = d.dimensions.map(x => x.key);
let bad = 0;
for (const p of d.providers) {
  const total = keys.reduce((s,k) => s + p.scores[k], 0);
  const tier = d.tiers.find(t => total >= t.min && total <= t.max);
  if (!tier || tier.name !== p.verdict) { console.log('MISMATCH', p.id, total, p.verdict); bad++; }
}
console.log(bad ? bad + ' problem(s)' : 'dataset OK: ' + d.providers.length + ' providers');
"
```

5. Commit and push to `main`. Cloudflare rebuilds and redeploys the Worker automatically in about 30 to 60 seconds.

The dataset is the only file that changes during a routine refresh. The front end reads the dimension list, tier ladder, insights, and personal setup from the same file, so adding a provider or renaming a tier does not require code changes.

---

## Phase 2 (planned)

Free-form input where a user types any provider and gets an AI-generated evaluation on demand. The intended backend is an LLM call with web search, returning the same JSON shape the front end already renders. No API keys are used in the current build.

See `1. Projects/Sustainable AI Evaluation/Interactive Webpage Plan.md` in the Obsidian vault for the full plan.

---

## Data sources

Evaluations draw on publicly available information:

- Provider sustainability and environmental reports
- Academic papers (Luccioni et al., Patterson et al.)
- News reporting and investigative journalism
- Public legal records such as lawsuits and regulatory filings

Every provider entry carries its own source list, visible in the report panel on the site.

---

## License

MIT. See [LICENSE](LICENSE).

---

## About

Built by **Jennifer Arguello** using the Sustainable AI Evaluation Framework.

The framework exists to make informed choices about which AI tools align with your values, because sustainability is not only about the technology. It is about the systems, people, and planet behind it.
