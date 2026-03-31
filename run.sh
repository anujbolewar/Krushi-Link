#!/bin/bash
# Script to run the AgroVault project

# Activate the virtual environment
source .venv/bin/activate

# Move to the backend folder
cd backend

# Run the FastAPI application using uvicorn
echo "Starting the FastAPI server..."
uvicorn app.main:app --reload
