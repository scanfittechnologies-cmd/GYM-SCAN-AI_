# Workspace Rules & Production Setup

## Official Production Endpoints
- **Primary Frontend (Vercel)**: https://gym-scan-ai.vercel.app
- **Primary Backend (Render)**: https://scanner-app-fydt.onrender.com

---

## Deployment & Development Rules

1. **Vercel Deployments**:
   - Always target the main project (`gym-scan-ai`) on branch `main` with scope `scab-fit-technologies-projects`.
   - Never create new temporary preview projects.

2. **Frontend API URL**:
   - `VITE_BACKEND_URL` must point strictly to `https://scanner-app-fydt.onrender.com`.
   - Preserved across `.env.production`, `vercel.json`, and fallback in `src/services/visionService.ts`.

3. **Client-Side Image Compression**:
   - Maintain and respect client-side compression (`compressImageIfNeeded` in `src/components/scanner/PhotoAIAnalyzer.tsx`) to keep image payloads minimal (<1200px / <1MB) before dispatching to the backend.
