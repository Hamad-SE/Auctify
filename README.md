# Auctify Bid

**Auctify Bid** is a frontend web application for creating, listing, and participating in auctions. It is built with React + TypeScript, Vite, Tailwind CSS, and integrates with Supabase for authentication, database, and serverless functions.

---

## 🚀 Purpose

Auctify Bid is intended as a modern auction UI that demonstrates how to build bidding flows and auction product pages with a simple backend (Supabase). It’s a good starting point for prototyping real-time or near-real-time auction experiences.

---

## ⚙️ Key features

- User authentication (signup/login) via Supabase
- Auction listing, product pages, and bidding UI
- Reusable UI components (shadcn/Radix components + Tailwind)
- Integration-ready with Supabase functions and migrations
- Linting and TypeScript for developer productivity

---

## 🧭 Quick start

Prerequisites: Node.js 18+ and npm, pnpm, or bun

1. Install dependencies

```bash
npm install
# or pnpm install
# or bun install
```

2. Create a `.env` or `.env.local` and set Supabase variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
# (optional) VITE_SUPABASE_SERVICE_ROLE_KEY for server-side tasks
```

3. Start dev server

```bash
npm run dev
```

4. Build for production

```bash
npm run build
npm run preview
```

---

## 📜 Available scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run build:dev` — Build with `development` mode enabled
- `npm run preview` — Serve production build locally
- `npm run lint` — Run ESLint

---

## 🗂 Project structure (high level)

- `src/`
  - `components/` — UI components and shadcn primitives
  - `pages/` — Views and route pages (Home, Auction, AuctionProduct, Login, Signup, etc.)
  - `integrations/supabase/` — Supabase client and types
  - `hooks/` — Custom hooks
  - `lib/` — Utilities
- `supabase/` — Supabase config, functions, and migrations

---

## 🛠 Tech stack

React, TypeScript, Vite, Tailwind CSS, shadcn-ui (Radix), Supabase, React Router, React Query

---

## 📦 Deployment notes

- The app builds to static assets via `npm run build` and can be hosted on Vercel, Netlify, Cloudflare Pages, or similar.
- Make sure to provide Supabase environment variables in the deployment environment settings.

---

## ✅ Tips & next steps

- Add example seed data for auctions to ease demos.
- Consider adding tests for bidding workflows and potential real-time sync with Supabase Realtime.
- Add screenshots or a demo GIF for the README to make it more approachable.

---

## 🤝 Contributing

Contributions welcome — open an issue or submit a pull request. Please follow the existing code style and run `npm run lint` before submitting.

---

## 📄 License

MIT (or choose a license you prefer)

---

If you want, I can add screenshots, a Supabase setup guide, or CI/CD deployment instructions (Vercel/Netlify).