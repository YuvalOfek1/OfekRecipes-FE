# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies required for node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install ALL dependencies
RUN npm install

# Copy source
COPY . .

# Build using npm scripts
RUN npm run build

# --- runtime stage ---
FROM nginx:1.25-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Remove default static assets
RUN rm -rf ./*

# Copy build output
COPY --from=build /app/dist .

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
