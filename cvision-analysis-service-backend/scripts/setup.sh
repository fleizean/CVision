# ================================
# scripts/setup.sh
# ================================
#!/bin/bash

# Setup script for development environment

echo "Setting up CV Analysis Service development environment..."

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
echo "Installing Python packages..."
pip install -r requirements.txt

# Download spaCy model
echo "Downloading spaCy model..."
python -m spacy download en_core_web_sm

# Download NLTK data
echo "Downloading NLTK data..."
python -c "
import nltk
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
print('NLTK data downloaded successfully')
"

# Create directories
mkdir -p logs
mkdir -p uploads

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Database Configuration
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=cvisionDb
DB_USER=sa
DB_PASSWORD=reallyStrongPassword1!
DB_DRIVER=ODBC Driver 17 for SQL Server

# Application Configuration
DEBUG=True
HOST=127.0.0.1
PORT=8000

# File Processing
MAX_FILE_SIZE=10485760
UPLOAD_FOLDER=uploads

# Analysis Configuration
BATCH_SIZE=5
PROCESSING_INTERVAL=30
MAX_RETRIES=3

# Logging
LOG_LEVEL=INFO

# External APIs
DOTNET_API_URL=http://localhost:5117/api
REDIS_URL=redis://localhost:6379/0
EOF
fi

echo "Setup completed! Run 'source venv/bin/activate' then 'python main.py' to start the server."
