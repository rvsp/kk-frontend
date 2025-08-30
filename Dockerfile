# --------- Step 1: Build Stage ---------
FROM node:18-alpine AS build
WORKDIR /app

# Install build tools for faster native deps compile (if needed)
RUN apk add --no-cache python3 make g++

# Copy only package files first (to leverage Docker cache)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy the rest of the code
COPY . .

# Optional: skip minify in dev/staging to speed up build
# ARG SKIP_MINIFY=false
# ENV VITE_SKIP_MINIFY=$SKIP_MINIFY

RUN npm run build

# --------- Step 2: Serve using Nginx ---------
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
