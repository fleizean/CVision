# ================================
# scripts/start.sh
# ================================
#!/bin/bash

# Start script for CV Analysis Service

echo "Starting CV Analysis Service..."

# Check if required environment variables are set
if [ -z "$DB_SERVER" ]; then
    echo "Warning: DB_SERVER not set, using default localhost"
    export DB_SERVER="localhost"
fi

if [ -z "$DB_NAME" ]; then
    echo "Warning: DB_NAME not set, using default cvisionDb"
    export DB_NAME="cvisionDb"
fi

# Create necessary directories
mkdir -p logs
mkdir -p uploads

# Download spaCy model if not exists
python -c "import spacy; spacy.load('en_core_web_sm')" 2>/dev/null || python -m spacy download en_core_web_sm

# Run database connection test
echo "Testing database connection..."
python -c "
from app.database import engine
try:
    with engine.connect() as conn:
        print('Database connection successful!')
except Exception as e:
    print(f'Database connection failed: {e}')
    exit(1)
"

# Start the application
echo "Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload