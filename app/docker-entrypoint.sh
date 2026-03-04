#!/bin/sh
# Inject runtime environment variables into the static PWA.
# This file is generated fresh on every container start, so `docker-compose`
# environment variables (VITE_SPARKY_URL) take effect without rebuilding the image.
cat > /usr/share/nginx/html/env-config.js << EOF
window.__env__ = {
  VITE_SPARKY_URL: "${VITE_SPARKY_URL:-}"
};
EOF

exec nginx -g 'daemon off;'
