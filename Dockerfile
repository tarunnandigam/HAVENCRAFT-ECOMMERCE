# Use a lightweight Nginx image
FROM nginx:alpine

# Copy all website files into Nginx web root
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

