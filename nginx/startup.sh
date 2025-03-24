#!/bin/sh
# Replace environment variables in the Nginx configuration template
envsubst '$NGINX_HEADER_NAME $NGINX_SECURE_KEY $SERVER_PORT $CLIENT_PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start Nginx in foreground mode
nginx -g 'daemon off;'