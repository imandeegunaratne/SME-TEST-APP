# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine
# 1. First, remove the default Nginx config to avoid conflicts
RUN rm /etc/nginx/conf.d/default.conf

# 2. UNCOMMENT THIS LINE - This is your "Bridge"
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. Copy your React build files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]