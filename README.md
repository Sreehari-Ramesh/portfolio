# Sreehari Ramesh, portfolio

Personal site built with React, TypeScript and Vite.

```bash
npm install
npm run dev      # local dev server on http://localhost:5173
npm run build    # production build into dist/
```

All content (projects, experience, stack, contact) lives in `src/data.ts`.
The hero network animation is `src/components/NeuralNet.tsx`.

## Deploying

Every push to `main` builds the site and publishes it to GitHub Pages through
`.github/workflows/deploy.yml`. In the repository settings, set
**Pages → Build and deployment → Source** to **GitHub Actions** once.
