# Stage 1 : Build Angular
FROM node:24 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2 : Serve avec Nginx
FROM nginx:latest
# Copie la configuration Nginx
COPY nginx.conf /etc/nginx/nginx.conf
# Copie les fichiers built
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
