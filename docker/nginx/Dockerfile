# docker/nginx/Dockerfile
#
# This Dockerfile creates a Docker image for Nginx using the lightweight Alpine version.
# - Copies the custom Nginx configuration file.
# - Copies SSL (Secure Sockets Layer) certificates for HTTPS.
# - Exposes HTTP (80) and HTTPS (443) ports.
# - Starts the Nginx server in the foreground using "daemon off" to keep the container running.


FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY cert/cert.pem /etc/nginx/ssl/nginx.crt
COPY cert/key.pem /etc/nginx/ssl/nginx.key

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
