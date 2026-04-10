# Nagendra Commerce

Nagendra Commerce is a localhost-first fullstack e-commerce project that follows the requested backend and frontend structure and is ready for a later MongoDB integration.

## What is working now

- FastAPI backend with JWT login and registration
- Product listing with search and category filtering
- Protected dashboard
- Cart flow and local order placement
- Local demo data with admin and customer accounts

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

On Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Demo users

- Admin: `admin@nagendra.com` / `Admin@123`
- Customer: `customer@nagendra.com` / `Customer@123`

## Next phase

Replace the in-memory repositories with MongoDB-backed repositories under `backend/app/repositories` and wire the connection under `backend/app/db`.

## Deployment to AWS

### Prerequisites
- AWS CLI installed and configured
- Docker installed
- MongoDB Atlas account (for production database)

### Local Development with Docker
```bash
docker-compose up --build
```

### Deploy to AWS
1. Create ECR repositories for backend and frontend images.
2. Update `deploy.sh` with your ECR URIs.
3. Run `./deploy.sh` to build and push images.
4. Use the provided `cloudformation.yml` to deploy the stack via CloudFormation.
5. For production, use MongoDB Atlas and update the MONGO_URI environment variable.

### Environment Variables
- `MONGO_URI`: MongoDB connection string
- `SECRET_KEY`: JWT secret key
