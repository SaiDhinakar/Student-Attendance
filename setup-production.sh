#!/bin/bash

echo "Setting up Student Attendance System for production..."

# Create Python virtual environment
echo "Creating Python virtual environment..."
python -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt
pip install python-jose[cryptography] bcrypt

# Deactivate virtual environment
deactivate

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install
npm install dotenv

# Build the frontend
echo "Building the frontend..."
npm run build

# Create logs directory for PM2
mkdir -p logs

echo "Setup complete! Use the following commands to start the application:"
echo "To start: pm2 start ecosystem.config.cjs"
echo "To stop: pm2 stop ecosystem.config.cjs"
echo "To monitor: pm2 monit"
echo "To view logs: pm2 logs"