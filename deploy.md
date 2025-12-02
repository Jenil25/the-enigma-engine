# Deployment Guide - The Enigma Engine

## Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local dev)
- Python 3.11+ (for local dev)

## Local Deployment (Docker)

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd the-enigma-engine
   ```

2. **Build and Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
   This will start:
   - Frontend on `http://localhost:3000`
   - Backend on `http://localhost:5000`
   - Database (if using a separate container, otherwise it's a file)

## Manual Local Deployment

### Backend
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run Flask app:
   ```bash
   flask run
   ```

### Frontend
1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```

## Production Deployment
1. Build Docker images for frontend and backend.
2. Push to a container registry (e.g., Docker Hub, AWS ECR).
3. Deploy to a container orchestration platform (e.g., AWS ECS, Kubernetes, or a simple VPS with Docker Compose).
4. Ensure environment variables (DB credentials, API keys) are set securely.
