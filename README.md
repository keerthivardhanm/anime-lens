<p align="center">
  <img src="https://skillicons.dev/icons?i=github,react,vercel,nodejs,html,css,js,ts,linux,git,vite" alt="tech" />
</p>

# <div align="center">**Anime Lens**</div>

<div align="center">**Ultimate Scene Scanner • AI-Powered Recommendations**</div>

---

## ✨ Overview

**Anime Lens** is a privacy-first, lightning-fast web app that identifies anime scenes from screenshots or image URLs and recommends similar shows using client-side embeddings. It's playful (XP + badges), practical (trace.moe integration), and private — your data stays in your browser unless *you* choose otherwise.

---

## 🚀 What makes Anime Lens unique

* **Privacy-first:** IndexedDB (localForage) stores scans & embeddings locally — no server required.
* **Fast, Local-first Recommendations:** Nearest-neighbour search over local embeddings for instant suggestions.
* **Beautiful UX:** Dark, immersive UI with clear cards, thumbnails, and a gamified XP system.
* **Extensible:** Swap local embeddings with OpenAI embeddings via an environment toggle.

---

## 🔍 Features (short & tasty)

* Local storage of scan history, thumbnails, and embeddings
* Client-side similarity search with session boosts
* XP / levels / badges to gamify scanning and sharing
* Export history, clear local data, optional server proxy for trace.moe

---


## 🧭 How it works — architecture (brief)

```
[User Browser] --(image upload)--> [trace.moe API] --> normalized result
     |                                          |
     |--(store)--> IndexedDB (scan + embedding) -|--> embeddings index (client-side)
     |                                          |
     '--(similarity search)--> Recommendation UI
```

* All heavy-lifting runs in the browser. Optional server proxy only for hiding API keys or caching.

---

## 🛠️ Quick Start (developer)

```bash
# Prereqs
Node >= 18, npm >= 9

# Install
npm install

# Create env
cp .env.example .env
# Edit .env with your TRACE_MOE key (and optional OpenAI key)

# Run locally
npm run dev
```

### Example .env

```
VITE_TRACEMOE_API_KEY=sk-...            # required for trace.moe
VITE_OPENAI_KEY=sk-...                  # optional - for remote embeddings
VITE_EMBEDDING_SOURCE=local|openai      # default: local
```

---

## 📦 Example snippets (copy-paste ready)


### 2) Save scan to IndexedDB via localForage

```js
import localforage from 'localforage';
const db = localforage.createInstance({ name: 'anime-lens' });

export async function saveScan(scan) {
  const id = scan.id || `scan_${Date.now()}`;
  await db.setItem(id, scan);
  return id;
}
```

### 3) Create a simple embedding (local fallback)

```js
// naive local embedding: downscale + color histogram -> small vector
export async function localEmbedding(imageBitmap) {
  // produce fixed-length numeric vector for similarity
  // In production swap with OpenAI embeddings for better accuracy
  const vector = new Float32Array(128);
  // ...compute histogram/resized pixel stats...
  return vector;
}
```

### 4) Nearest-neighbour search (brute force)

```js
function cosine(a, b){
  let dot = 0, na = 0, nb = 0;
  for(let i=0;i<a.length;i++){ dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return dot/Math.sqrt(na*nb);
}

function topK(query, items, k=5){
  return items
    .map(it => ({score: cosine(query, it.embedding), item: it}))
    .sort((x,y)=>y.score-x.score)
    .slice(0,k);
}
```

---

## 🔧 Configuration & tuning notes

* **Embedding source:** local embeddings are instant and private; OpenAI gives higher quality embeddings (requires key).
* **Index storage:** store Float32Array as base64 in IndexedDB to avoid serialization issues.
* **Retention policy:** default 90 days — configurable in `lib/storage.ts`
* **Rate limits:** implement exponential backoff when calling trace.moe

---

## ✅ Tests & CI

* Unit tests for hooks: `useScan`, `useEmbeddings`, `useXP`
* Add E2E tests (Playwright) for flows: upload → match → save → recommendations
* Example GitHub Actions snippet (runs on push):

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: 18}
      - run: npm ci
      - run: npm run test --if-present
```

---

## 🧾 Contribution

1. Fork this repository
2. Create a branch `feat/your-feature`
3. Implement & test
4. Open a PR with clear description and screenshots

Please respect code style and include tests for new logic.

---

## 🔐 Privacy & Security (important)

* **Keys:** Do not commit `.env` or secrets. Use provider environment variables for production.
* **Local data:** Provide `Clear Local Data` to purge IndexedDB.
* **Proxy:** If you host a proxy for trace.moe, only proxy the request and set a strict cache TTL; avoid storing user data on that server.

---

## 🧾 License

MIT © Anime Lens contributors

---

**Developer:** M KEERTHI VARDHAN
**GitHub:** [https://github.com/keerthivardhanm](https://github.com/keerthivardhanm)

**Portfolio:** [https://keerthivardhanmportfolio.vercel.app](https://keerthivardhanmportfolio.vercel.app)

