# Startup Predictor Deployment Guide

This guide outlines the key components and requirements for deploying the Startup Predictor application. Use this to get step-by-step deployment instructions from another AI (e.g., for Vercel, Railway, Render, AWS, etc.).

## Project Overview
- **Frontend & Backend**: Next.js 15+ (App Router) with TypeScript
  - API routes: `/api/analyze`, `/api/predict`, `/api/pitches`, `/api/entrepreneurs`, `/api/investors`, `/api/network/matches`, etc.
  - Database: MongoDB (see `lib/mongodb.ts`)
  - UI: shadcn/ui, Tailwind CSS, Recharts
- **ML Service**: Separate Python FastAPI service (`ml-service/`)
  - `ml-service/main.py`, `ml-service/server.py`, `ml-service/train_model.py`
  - Dependencies: `ml-service/requirements.txt`
  - Dataset: `ml-service/startup_dataset.csv`
  - Models trained via `train_model.py`, served via `main.py` or `server.py`
- **Dependencies**:
  ```
  npm/pnpm: Next.js, React, MongoDB driver, etc. (see package.json)
  Python: scikit-learn, pandas, fastapi, uvicorn, etc. (see requirements.txt)
  ```
- **Environment Variables** (likely needed):
  - `MONGODB_URI`
  - `NEXTAUTH_SECRET` (if auth used)
  - `ML_SERVICE_URL` (for Next.js to call Python service)
  - OpenAI/ML API keys (if used in prediction)

## Deployment Requirements
1. **Database**: MongoDB instance (Atlas recommended)
2. **Next.js Hosting**: Supports serverless (Vercel), container (Docker), or VM
3. **ML Service Hosting**: Python service (Railway, Render, Heroku, or same host)
4. **Communication**: Next.js API routes call ML service endpoints
5. **Build Steps**:
   - Frontend: `pnpm build` / `npm run build`
   - ML: `pip install -r requirements.txt`, run `train_model.py`, serve with `uvicorn`
6. **Domain/SSL**: Custom domain setup

## Potential Deployment Options
- **Monolith (Recommended for simplicity)**: Dockerize entire app + ML service
- **Split**:
  - Next.js: Vercel/Netlify
  - ML: Railway/Render
  - DB: MongoDB Atlas
- **Advanced**: Kubernetes, AWS ECS, Railway

## Pre-Deployment Checklist
- [ ] Set up MongoDB and update connection string
- [ ] Train ML model: `cd ml-service && python train_model.py`
- [ ] Test locally: `pnpm dev` (frontend), `cd ml-service && python main.py` (backend)
- [ ] Environment variables configured
- [ ] Git repo clean, no secrets committed

## Docker Support
- No Dockerfile present – may need to create one for full-stack deployment

**Prompt for another AI**: "Here is a Next.js + Python ML service project structure: [paste file tree]. Provide detailed step-by-step instructions to deploy to [platform, e.g., Vercel + Railway], including Docker if needed, env vars, and connecting the services."

