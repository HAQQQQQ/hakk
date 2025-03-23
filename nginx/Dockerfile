# 🐳 Use the official NGINX base image
FROM nginx:latest

# =========================
# 🔹 CONFIGURATION FILES
# =========================
# Copy your custom NGINX config files into the container
COPY ./config/default.conf /etc/nginx/conf.d/default.conf

# =========================
# 🔹 PERMISSIONS (Best Practice)
# =========================
# Ensure NGINX has appropriate permissions for the copied files
RUN chmod 644 /etc/nginx/conf.d/*.conf

# =========================
# 🔹 PORT EXPOSURE
# =========================
# Expose port 8080 for NGINX to match your `docker-compose.yml`
EXPOSE 8080

# =========================
# 🔹 HEALTH CHECK (Optional but Recommended)
# =========================
# Ensures Docker knows when the container is healthy
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl --fail http://localhost:8080/health || exit 1
