# Syntheta

Syntheta is an AI-first developer tool for designing, orchestrating, and monitoring synthetic data generation pipelines using a visual DAG-based interface. It helps AI/ML teams generate high-quality, multi-modal synthetic data with built-in privacy, realism, and governance evaluation.

## Features

- 🎨 Visual DAG Builder UI for pipeline design
- 🔄 Workflow orchestration with Temporal
- 📊 Multi-modal data generation (tabular, image, time-series, text)
- 📈 Built-in evaluation metrics and visualization
- 🔒 Privacy and governance controls
- 👥 Multi-tenant workspace support

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: FastAPI, Redis, Temporal
- **Data/Infra**: Docker, PostgreSQL, MinIO
- **ML Toolkits**: SDV, CTGAN, Diffusion/GANs, albumentations, PyTorch
- **Auth**: Auth0/Clerk

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15.4
- Docker and Docker Compose
- Python 3.9+

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/syntheta.git
   cd syntheta
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp apps/frontend/.env.example apps/frontend/.env.local
   cp apps/backend/.env.example apps/backend/.env.local
   ```

4. Start the development environment:
   ```bash
   pnpm dev
   ```

## Project Structure

```
/syntheta
 ├── apps/
 │    ├── frontend/        # Next.js + DAG UI
 │    └── backend/         # FastAPI, DAG engine
 ├── libs/
 │    ├── dag-core/        # DAG JSON schema, runner logic
 │    └── generators/      # Tabular generator wrappers
 ├── infra/                # Docker, Terraform, DB schemas
 └── docs/                 # API & usage docs
```

## Deploying to Railway

### 1. Prepare Environment Variables
- Copy the example env files and set your secrets in Railway dashboard:
  - `apps/backend/.env.example` → `apps/backend/.env`
  - `apps/frontend/.env.example` → `apps/frontend/.env`
  - `apps/engine/.env.example` → `apps/engine/.env`
- Set all required variables in the Railway service settings for each service.

### 2. Dockerfile Setup
- Each service (`backend`, `frontend`, `engine`) now has a production-ready `Dockerfile` in its root.
- Railway will auto-detect and build each service if you use the monorepo feature.

### 3. Database Migrations
- Backend uses Alembic for migrations. You can add a Railway deploy hook to run migrations after deploy:
  ```sh
  alembic upgrade head
  ```
  Or run this manually from the Railway console.

### 4. Ports
- Backend: 8000
- Engine: 8001
- Frontend: 3000

### 5. Healthchecks
- Backend Dockerfile includes a healthcheck. Add similar checks to other services if needed.

### 6. Monorepo Setup
- When connecting your GitHub repo, add each service as a separate Railway service and point to its subdirectory.
- Set the build and start commands if not using Docker (see Dockerfiles for reference).

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.