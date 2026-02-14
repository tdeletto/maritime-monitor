#!/bin/bash

# Maritime Monitor - Interactive Environment Setup Script
# This script helps you configure API keys for maritime data sources
# Usage: bash scripts/setup-env.sh

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

read_secret() {
    local prompt="$1"
    local var
    read -sp "$prompt: " var
    echo
    echo "$var"
}

# Main script
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║   Maritime Monitor - Environment Setup      ║"
echo "║   Interactive Configuration Wizard           ║"
echo "║                                            ║"
echo "║   This script helps configure API keys      ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if .env.local already exists
if [ -f .env.local ]; then
    print_warning ".env.local already exists"
    read -p "Overwrite existing .env.local? (y/n): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        print_info "Setup cancelled. Existing .env.local preserved."
        exit 0
    fi
fi

# Copy example file
if [ ! -f .env.local.example ]; then
    print_error ".env.local.example not found"
    exit 1
fi

cp .env.local.example .env.local
print_success "Created .env.local from template"

# Start interactive configuration
print_header "AIS HUB API - Vessel Tracking"
echo "Purpose: Real-time vessel position tracking worldwide"
echo "Website: https://www.aishub.net/"
echo ""
echo "Steps to get API key:"
echo "  1. Visit https://www.aishub.net/"
echo "  2. Sign up for a free account"
echo "  3. Go to Dashboard > API"
echo "  4. Copy your API key"
echo ""

read -p "Do you have an AIS Hub API key? (y/n): " ais_ready

if [ "$ais_ready" = "y" ] || [ "$ais_ready" = "Y" ]; then
    ais_key=$(read_secret "Enter your AIS Hub API key")
    
    # Validate key format (should be alphanumeric, 20+ chars)
    if [ ${#ais_key} -gt 10 ]; then
        # Update .env.local using sed
        sed -i.bak "s|VITE_AIS_HUB_API_KEY=.*|VITE_AIS_HUB_API_KEY=$ais_key|" .env.local
        print_success "AIS Hub API key configured"
    else
        print_error "API key seems too short. Skipping."
    fi
else
    print_info "Skipping AIS Hub configuration. Update .env.local later."
fi

# OpenWeather API
print_header "OPENWEATHER API - Maritime Weather"
echo "Purpose: Ocean and marine weather forecasts"
echo "Website: https://openweathermap.org/api"
echo ""
echo "Steps to get API key:"
echo "  1. Visit https://openweathermap.org/"
echo "  2. Create a free account"
echo "  3. Go to Account > My API keys"
echo "  4. Copy the default API key"
echo ""

read -p "Do you have an OpenWeather API key? (y/n): " weather_ready

if [ "$weather_ready" = "y" ] || [ "$weather_ready" = "Y" ]; then
    weather_key=$(read_secret "Enter your OpenWeather API key")
    
    if [ ${#weather_key} -gt 10 ]; then
        sed -i.bak "s|VITE_OPENWEATHER_API_KEY=.*|VITE_OPENWEATHER_API_KEY=$weather_key|" .env.local
        print_success "OpenWeather API key configured"
    else
        print_error "API key seems too short. Skipping."
    fi
else
    print_info "Skipping OpenWeather configuration. Update .env.local later."
fi

# Maritime Awareness Service
print_header "MARITIME AWARENESS - Security Data"
echo "Purpose: Security incidents, piracy alerts, incident data"
echo ""
echo "Options for maritime security data:"
echo "  1. ReCAAP ISC (Southeast Asia, free RSS feed)"
echo "  2. IMO GISIS (Global, requires registration)"
echo "  3. Marine Traffic (Commercial API, paid)"
echo "  4. Custom/Other provider"
echo "  5. Skip for now"
echo ""

read -p "Choose an option (1-5): " maritime_option

case $maritime_option in
    1)
        print_info "Using ReCAAP ISC free RSS feed"
        maritime_key="recaap_rss_feed"
        sed -i.bak "s|VITE_MARITIME_AWARENESS_API_KEY=.*|VITE_MARITIME_AWARENESS_API_KEY=$maritime_key|" .env.local
        sed -i.bak "s|VITE_MARITIME_AWARENESS_API_URL=.*|VITE_MARITIME_AWARENESS_API_URL=https://www.recaap.org/rss|" .env.local
        print_success "Maritime Awareness configured for ReCAAP ISC"
        ;;
    2)
        print_warning "IMO GISIS requires institutional registration"
        read -p "Enter your IMO GISIS credentials or skip (leave blank): " gisis_key
        if [ -n "$gisis_key" ]; then
            sed -i.bak "s|VITE_MARITIME_AWARENESS_API_KEY=.*|VITE_MARITIME_AWARENESS_API_KEY=$gisis_key|" .env.local
            print_success "IMO GISIS credentials configured"
        fi
        ;;
    3)
        maritime_key=$(read_secret "Enter Marine Traffic API key")
        if [ ${#maritime_key} -gt 5 ]; then
            sed -i.bak "s|VITE_MARITIME_AWARENESS_API_KEY=.*|VITE_MARITIME_AWARENESS_API_KEY=$maritime_key|" .env.local
            print_success "Marine Traffic API key configured"
        fi
        ;;
    4)
        maritime_key=$(read_secret "Enter your custom provider API key")
        maritime_url=$(read -p "Enter API base URL: ")
        if [ -n "$maritime_key" ]; then
            sed -i.bak "s|VITE_MARITIME_AWARENESS_API_KEY=.*|VITE_MARITIME_AWARENESS_API_KEY=$maritime_key|" .env.local
        fi
        if [ -n "$maritime_url" ]; then
            sed -i.bak "s|VITE_MARITIME_AWARENESS_API_URL=.*|VITE_MARITIME_AWARENESS_API_URL=$maritime_url|" .env.local
        fi
        print_success "Custom maritime provider configured"
        ;;
    5)
        print_info "Skipping maritime security configuration"
        ;;
    *)
        print_error "Invalid option. Skipping maritime configuration."
        ;;
esac

# Optional: Configure update intervals
print_header "Optional: Configure Update Intervals"
echo "These control how often data is fetched from APIs"
echo "Longer intervals save API calls but mean older data"
echo ""

read -p "Customize update intervals? (y/n): " customize_intervals

if [ "$customize_intervals" = "y" ] || [ "$customize_intervals" = "Y" ]; then
    read -p "AIS update interval in seconds (default 60): " ais_interval
    if [ -n "$ais_interval" ]; then
        ais_ms=$((ais_interval * 1000))
        sed -i.bak "s|VITE_AIS_UPDATE_INTERVAL=.*|VITE_AIS_UPDATE_INTERVAL=$ais_ms|" .env.local
    fi
    
    read -p "Weather update interval in seconds (default 600): " weather_interval
    if [ -n "$weather_interval" ]; then
        weather_ms=$((weather_interval * 1000))
        sed -i.bak "s|VITE_WEATHER_UPDATE_INTERVAL=.*|VITE_WEATHER_UPDATE_INTERVAL=$weather_ms|" .env.local
    fi
    
    read -p "Security update interval in seconds (default 300): " security_interval
    if [ -n "$security_interval" ]; then
        security_ms=$((security_interval * 1000))
        sed -i.bak "s|VITE_SECURITY_UPDATE_INTERVAL=.*|VITE_SECURITY_UPDATE_INTERVAL=$security_ms|" .env.local
    fi
fi

# Cleanup backup files
rm -f .env.local.bak

# Display summary
print_header "Configuration Complete!"

echo "Your .env.local file has been created with the following settings:"
echo ""
echo "AIS Hub Configuration:"
if grep -q "^VITE_AIS_HUB_API_KEY=your_" .env.local; then
    echo -e "  ${YELLOW}⚠ Not configured${NC}"
else
    echo -e "  ${GREEN}✓ Configured${NC}"
fi

echo "OpenWeather Configuration:"
if grep -q "^VITE_OPENWEATHER_API_KEY=your_" .env.local; then
    echo -e "  ${YELLOW}⚠ Not configured${NC}"
else
    echo -e "  ${GREEN}✓ Configured${NC}"
fi

echo "Maritime Awareness Configuration:"
if grep -q "^VITE_MARITIME_AWARENESS_API_KEY=your_" .env.local; then
    echo -e "  ${YELLOW}⚠ Not configured${NC}"
else
    echo -e "  ${GREEN}✓ Configured${NC}"
fi

echo ""
print_info "Next steps:"
echo "  1. Review .env.local and verify all settings"
echo "  2. If you skipped any API keys, edit .env.local manually"
echo "  3. Run: npm run dev"
echo "  4. Monitor the browser console for connection status"
echo ""

print_warning "Remember: Never commit .env.local to git!"
echo "The file is in .gitignore for your protection."

echo ""
print_success "Setup wizard completed successfully!"
echo ""
