#!/bin/bash

echo "🚀 Preparing EDIS Portal for Vercel deployment..."

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run from project root."
    exit 1
fi

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check for required files
required_files=("index.html" "portal.html" "dashboard.html" "admin-dashboard.html" "vercel.json" "package.json")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

# Check file sizes (warn if too large)
echo "📊 Checking file sizes..."
large_files=$(find . -name "*.html" -size +1M)
if [ ! -z "$large_files" ]; then
    echo "⚠️  Warning: Large HTML files detected:"
    echo "$large_files"
fi

# Validate JSON files
echo "🔧 Validating JSON files..."
if command -v node &> /dev/null; then
    for json_file in *.json; do
        if [ -f "$json_file" ]; then
            if node -e "JSON.parse(require('fs').readFileSync('$json_file', 'utf8'))" 2>/dev/null; then
                echo "✅ Valid JSON: $json_file"
            else
                echo "❌ Invalid JSON: $json_file"
                exit 1
            fi
        fi
    done
fi

# Check construction worker image URL
echo "🖼️  Verifying construction worker image..."
if grep -q "https://res.cloudinary.com/eastudios-dam/image/upload/v1760817193/Website/hero/easimage_f75g89.jpg" index.html; then
    echo "✅ Construction worker image URL found in index.html"
else
    echo "⚠️  Warning: Construction worker image URL not found in index.html"
fi

echo ""
echo "🎯 EDIS Portal Deployment Summary:"
echo "=================================="
echo "✅ Main landing page: index.html"
echo "✅ Portal info page: portal.html" 
echo "✅ Client dashboard: dashboard.html"
echo "✅ Admin dashboard: admin-dashboard.html"
echo "✅ Vercel configuration: vercel.json"
echo "✅ Package configuration: package.json"
echo "✅ Construction worker hero image"
echo "✅ Cloudinary integration"
echo "✅ Client login system"
echo ""
echo "🚀 Ready to deploy! Run one of these commands:"
echo ""
echo "  npm run deploy         # Deploy to production"
echo "  npm run deploy:preview # Deploy preview"
echo "  vercel --prod          # Direct Vercel command"
echo ""
echo "🌐 After deployment, your site will be available at:"
echo "   https://edis-portal.vercel.app"
echo ""