# AgroVault Web MVP

## Overview
AgroVault is an AI-powered export intelligence platform designed for India's small Farmer Producer Organizations (FPOs). This MVP includes modules for produce listing, price forecasting, export readiness checking, traceability, cold chain tracking, and document generation.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/agrovault.git
   ```

2. Navigate to the project directory:
   ```bash
   cd agrovault
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```bash
   alembic upgrade head
   ```

5. Seed the database:
   ```bash
   python -m app.core.seed_data
   ```

6. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Endpoints

- **Lot Management**:
  - `POST /api/v1/lots` - Create a new lot.
  - `GET /api/v1/lots` - List all lots.

- **Price Forecasting**:
  - `GET /api/v1/forecast/{crop_type}` - Get price forecast.

- **Export Readiness**:
  - `POST /api/v1/export-check` - Check export readiness.

## Environment Variables

- `POSTGRES_URL`: PostgreSQL connection string.
- `SECRET_KEY`: Secret key for JWT authentication.
- `SMTP_SERVER`: SMTP server for email notifications.

## Demo Credentials

- **Admin**:
  - Email: `admin@example.com`
  - Password: `admin123`

- **FPO Manager**:
  - Email: `manager@example.com`
  - Password: `manager123`
