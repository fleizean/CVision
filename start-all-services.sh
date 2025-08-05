#!/bin/bash

# Start All CVision Services
# Bu script tüm servisleri başlatır (Docker olmadan)

echo "🚀 CVision Servislerini Başlatıyor..."

# Terminal renkleri
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Hata kontrolü fonksiyonu
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 bulundu"
        return 0
    else
        echo -e "${RED}✗${NC} $1 bulunamadı. Lütfen yükleyin."
        return 1
    fi
}

# Gerekli komutları kontrol et
echo -e "${BLUE}Gereksinimler kontrol ediliyor...${NC}"
check_command "node" || exit 1
check_command "npm" || exit 1
check_command "dotnet" || exit 1
check_command "python3" || exit 1

echo ""

# Port kontrolü
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $1 kullanımda${NC}"
        return 1
    else
        echo -e "${GREEN}✓${NC} Port $1 uygun"
        return 0
    fi
}

echo -e "${BLUE}Portlar kontrol ediliyor...${NC}"
check_port 3000 # Frontend
check_port 5117 # Backend API
check_port 8000 # Python Analysis Service

echo ""

# Frontend başlat
start_frontend() {
    echo -e "${BLUE}Frontend başlatılıyor (Port 3000)...${NC}"
    cd cvision-frontend
    
    # Dependencies kontrol et
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Node modules yükleniyor...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}Next.js development server başlatılıyor...${NC}"
    npm run dev &
    FRONTEND_PID=$!
    cd ..
}

# Backend başlat
start_backend() {
    echo -e "${BLUE}Backend başlatılıyor (Port 5117)...${NC}"
    cd cvision-backend/Presentation/CVisionBackend.API
    
    echo -e "${GREEN}.NET API server başlatılıyor...${NC}"
    dotnet run &
    BACKEND_PID=$!
    cd ../../..
}

# Analysis Service başlat
start_analysis_service() {
    echo -e "${BLUE}Analysis Service başlatılıyor (Port 8000)...${NC}"
    cd cvision-analysis-service-backend
    
    # Virtual environment kontrol et
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Python virtual environment oluşturuluyor...${NC}"
        python3 -m venv venv
    fi
    
    # Virtual environment aktif et
    source venv/bin/activate
    
    # Dependencies kontrol et
    echo -e "${YELLOW}Python dependencies kontrol ediliyor...${NC}"
    pip install -r requirements.txt
    
    echo -e "${GREEN}FastAPI server başlatılıyor...${NC}"
    python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    ANALYSIS_PID=$!
    cd ..
}

# Cleanup fonksiyonu
cleanup() {
    echo -e "\n${YELLOW}Servisler durduruluyor...${NC}"
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}Frontend durduruldu${NC}"
    fi
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}Backend durduruldu${NC}"
    fi
    
    if [ ! -z "$ANALYSIS_PID" ]; then
        kill $ANALYSIS_PID 2>/dev/null
        echo -e "${GREEN}Analysis Service durduruldu${NC}"
    fi
    
    # Port'larda kalan processleri temizle
    pkill -f "next dev" 2>/dev/null
    pkill -f "dotnet run" 2>/dev/null
    pkill -f "uvicorn main:app" 2>/dev/null
    
    echo -e "${GREEN}Tüm servisler durduruldu!${NC}"
    exit 0
}

# SIGINT ve SIGTERM sinyallerini yakala
trap cleanup SIGINT SIGTERM

# Servisleri başlat
echo -e "${GREEN}🚀 Tüm servisler başlatılıyor...${NC}"
echo ""

start_frontend
sleep 2

start_backend
sleep 2

start_analysis_service
sleep 3

echo ""
echo -e "${GREEN}✅ Tüm servisler başlatıldı!${NC}"
echo ""
echo -e "${BLUE}📋 Servis URL'leri:${NC}"
echo -e "   • Frontend:        ${GREEN}http://localhost:3000${NC}"
echo -e "   • Backend API:     ${GREEN}http://localhost:5117/swagger${NC}"
echo -e "   • Analysis Service: ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}⚠️  Servisleri durdurmak için CTRL+C tuşlayın${NC}"
echo ""

# Servislerin çalışıp çalışmadığını kontrol et
sleep 5
echo -e "${BLUE}Servis durumları kontrol ediliyor...${NC}"

if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Frontend çalışıyor${NC}"
else
    echo -e "${RED}✗ Frontend çalışmıyor${NC}"
fi

if curl -s http://localhost:5117/swagger > /dev/null; then
    echo -e "${GREEN}✓ Backend çalışıyor${NC}"
else
    echo -e "${RED}✗ Backend çalışmıyor${NC}"
fi

if curl -s http://localhost:8000/docs > /dev/null; then
    echo -e "${GREEN}✓ Analysis Service çalışıyor${NC}"
else
    echo -e "${RED}✗ Analysis Service çalışmıyor${NC}"
fi

# Sonsuz döngüde bekle
while true; do
    sleep 1
done