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

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 