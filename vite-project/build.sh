#!/bin/bash

echo "🚀 Building TimeFlowVault for Vercel deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful! Check the 'dist' folder."
    echo "📁 Build output:"
    ls -la dist/
    echo ""
    echo "🚀 Ready for Vercel deployment!"
    echo "📋 Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Connect repository to Vercel"
    echo "3. Add environment variables"
    echo "4. Deploy!"
else
    echo "❌ Build failed! Check the error messages above."
    exit 1
fi
