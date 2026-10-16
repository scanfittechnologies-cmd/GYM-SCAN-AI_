# Production Environment & Deployment Guidelines

## Official Production Endpoints
- **Primary Frontend (Vercel)**: `https://gym-scan-ai.vercel.app`
- **Primary Backend (Render)**: `https://scanner-app-fydt.onrender.com`

---

## Strict Requirements

### 1. Vercel Deployments
- Always target the main production project (`gym-scan-ai`) under the scope `scab-fit-technologies-projects` on branch `main`.
- Do not create new temporary preview projects or deploy to alternate project targets.
- Ensure `vercel.json` maintains the project name `"name": "gym-scan-ai"` and the production environment mapping.

### 2. Frontend API Configuration
- The frontend API endpoint (`VITE_BACKEND_URL` / `REACT_APP_BACKEND_URL`) must **strictly** point to:
  `https://scanner-app-fydt.onrender.com`
- Keep this synchronized across:
  - [.env.production](file:///c:/chappter%204/.env.production)
  - [vercel.json](file:///c:/chappter%204/vercel.json)
  - Default fallback in [visionService.ts](file:///c:/chappter%204/src/services/visionService.ts)

### 3. Client-Side Image Compression
- Retain and respect the client-side image compression logic (e.g., `compressImageIfNeeded` in [PhotoAIAnalyzer.tsx](file:///c:/chappter%204/src/components/scanner/PhotoAIAnalyzer.tsx)).
- Always downscale and compress camera and file upload payloads to under ~1200px / ~1MB before sending requests to the backend scanner API to ensure fast, responsive scan operations.
