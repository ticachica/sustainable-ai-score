# SustainableAI Score

**See how your AI stack really stacks up.**

A 6-dimension framework rating AI providers and tools on environmental and societal sustainability. Interactive web app — explore scores, filter by category, compare radar charts, and view full evaluation reports.

**Live site:** https://sustainable-ai-score.jarguello.workers.dev

---

## The Framework

Every provider is scored across six dimensions, each rated 1–5:

| Dimension | What It Measures |
|-----------|-----------------|
| **Hardware & Manufacturing** | Supply chain ethics, conflict minerals, manufacturing practices |
| **Data Center Operations** | Energy sources, water usage, grid carbon intensity, community impact |
| **Training Footprint** | Training compute disclosed, dataset ethics, labeling labor conditions |
| **Inference Efficiency** | Model size choices, quantization, local inference support |
| **Company Governance** | Transparency, open-source philosophy, labor practices |
| **Tool/Agent Design** | Local-first capability, caching, model routing, efficiency features |

**Total possible:** 6–30 | **Higher is better**

### Scoring Tiers

| Score | Verdict |
|-------|---------|
| 26–30 | Excellent |
| 21–25 | Good |
| 16–20 | Mixed |
| 10–15 | Poor |
| 6–9 | Avoid |

### Personal Modifiers

Your actual sustainability score depends on your setup:
- **+1 Hardware** if using existing device (avoiding manufacturing)
- **+1 Data Center** if running local inference on solar/renewable power

---

## Providers Evaluated

| Provider | Score | Verdict |
|----------|:-----:|---------|
| Hermes CLI + Gemma 4 (local, solar) | 28/30 | Excellent |
| Meta (Llama) | 20/30 | Mixed |
| Google DeepMind (Gemini) | 17/30 | Mixed |
| Anthropic (Claude) | 16/30 | Mixed |
| DeepSeek V4 Flash | 15/30 | Poor |
| Mistral AI | 15/30 | Poor |
| Claude Desktop | 15/30 | Poor |
| OpenAI Codex CLI | 13/30 | Poor |
| xAI (Grok) | 8/30 | Avoid |

---

## Tech Stack

- **Vanilla HTML + CSS + JS** — zero build step, single file
- **Chart.js** — radar and bar charts
- **Tailwind CSS** (CDN) — styling
- **Cloudflare Pages** — hosting (static deployment)

---

## Development

```bash
git clone https://github.com/ticachica/sustainable-ai-score.git
cd sustainable-ai-score
open index.html    # works directly in browser
```

No build step, no package.json, no npm install. Just a single `index.html` loaded with CDN scripts.

---

## Phase 2 (Future)

Adding free-form provider input where users can submit a new AI provider/tool and get an AI-generated evaluation report on demand.

Proposed backend: Vercel Serverless Function + OpenRouter API (LLM with web search capability). See the full plan at `1. Projects/Sustainable AI Evaluation/Interactive Webpage Plan.md` in the Obsidian vault.

---

## Data Sources

All evaluations are based on publicly available information as of May 2026:
- Provider sustainability reports and environmental disclosures
- Academic papers (Luccioni et al., Patterson et al.)
- News reporting and investigative journalism
- Public legal records (lawsuits, regulatory filings)

Full source citations are included in each provider's evaluation report.

---

## About

Built by **Jennifer Arguello** using the Sustainable AI Evaluation Framework.

The framework was developed to make informed choices about which AI tools align with your values — because sustainability isn't just about the technology, it's about the systems, people, and planet behind it.

---

*Last updated: May 26, 2026 · 9 providers evaluated · All data publicly sourced*
