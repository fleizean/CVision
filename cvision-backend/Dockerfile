# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY CVisionBackend.sln .

# Copy project files
COPY Core/CVisionBackend.Application/CVisionBackend.Application.csproj Core/CVisionBackend.Application/
COPY Core/CVisionBackend.Domain/CVisionBackend.Domain.csproj Core/CVisionBackend.Domain/
COPY Infrastructure/CVisionBackend.Infrastructure/CVisionBackend.Infrastructure.csproj Infrastructure/CVisionBackend.Infrastructure/
COPY Infrastructure/CVisionBackend.Persistence/CVisionBackend.Persistence.csproj Infrastructure/CVisionBackend.Persistence/
COPY Presentation/CVisionBackend.API/CVisionBackend.API.csproj Presentation/CVisionBackend.API/

# Restore dependencies
RUN dotnet restore

# Copy all source code
COPY . .

# Build the application
WORKDIR /src/Presentation/CVisionBackend.API
RUN dotnet build -c Release --no-restore

# Publish the application
RUN dotnet publish -c Release --no-build -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install system dependencies for file processing
RUN apt-get update && apt-get install -y \
    libgdiplus \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r cvision && useradd -r -g cvision cvision

# Create directories and set permissions
RUN mkdir -p /app/uploads/cvfiles && \
    mkdir -p /app/logs && \
    chown -R cvision:cvision /app

# Copy published application
COPY --from=build /app/publish .

# Switch to non-root user
USER cvision

# Environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Start the application
ENTRYPOINT ["dotnet", "CVisionBackend.API.dll"]