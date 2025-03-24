# 🐳 Use the official NGINX base image
FROM nginx:latest

# =========================
# 🔹 CONFIGURATION FILES
# =========================
# Copy template configuration file instead of the final config
COPY ./config/default.conf.template /etc/nginx/conf.d/default.conf.template

# Copy the startup script for environment variable substitution
COPY ./startup.sh /startup.sh

# =========================
# 🔹 PERMISSIONS (Best Practice)
# =========================
# Ensure NGINX has appropriate permissions for the copied files
RUN chmod 644 /etc/nginx/conf.d/*.template && \
    chmod +x /startup.sh

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

# =========================
# 🔹 STARTUP COMMAND
# =========================
# Use the startup script instead of the default command
CMD ["/startup.sh"]