#!/bin/bash

# Setup script for Express Bilingual Dictionary
echo "Setting up Express Bilingual Dictionary..."
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "PORT=3000" > .env
    echo ".env file created"
else
    echo ".env file already exists"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Setup complete!"
echo ""
echo "To start the server, run:"
echo "  npm start"
echo ""
echo "Or for development with auto-reload:"
echo "  npm run dev"
echo ""
echo "The API will be available at: http://localhost:3000"
