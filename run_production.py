#!/usr/bin/env python3
"""
Production server configuration for better concurrency handling
"""

import uvicorn
import os
from main import app

def run_production_server():
    """Run the server with production-optimized settings for concurrency"""
    
    # Get configuration from environment variables
    host = os.getenv("SERVER_HOST", "0.0.0.0")
    port = int(os.getenv("SERVER_PORT", "5021"))
    workers = int(os.getenv("WORKERS", "4"))  # Number of worker processes
    
    print(f"Starting production server with {workers} workers...")
    print(f"Server will be available at http://{host}:{port}")
    print("Press Ctrl+C to stop the server")
    
    # Production configuration for high concurrency
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        workers=workers,  # Multiple worker processes for true parallelism
        loop="asyncio",   # Use asyncio loop for better async performance
        access_log=True,
        log_level="info",
        reload=False,     # Disable reload in production
        # Additional production settings
        backlog=2048,     # Increase backlog for handling more connections
        limit_concurrency=1000,  # Limit concurrent connections per worker
        limit_max_requests=10000,  # Restart workers after processing this many requests
        timeout_keep_alive=5,     # Keep-alive timeout
    )

if __name__ == "__main__":
    run_production_server()
