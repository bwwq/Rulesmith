# Stage 1: Build the frontend application using Vite
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json ./
# Intentionally NOT copying package-lock.json here.
# Tailwind CSS v4 uses platform-specific native bindings (@tailwindcss/oxide).
# A lock file generated on Windows/Mac will pull wrong binaries for Alpine Linux.
# A fresh `npm install` ensures correct native bindings for this container's platform.
RUN npm install

# Copy all source files and build
COPY frontend/ ./
# Remove any accidentally copied lock/node_modules from host to avoid conflicts
RUN rm -rf node_modules/package-lock.json 2>/dev/null; npm install && npm run build

# Stage 2: Setup the backend Node service and serve frontend
FROM node:18-alpine

WORKDIR /app/backend

COPY backend/package.json ./
COPY backend/package-lock.json* ./
RUN npm install --production

# Copy backend source files
COPY backend/ ./

# Copy built frontend static files to the backend's "public" directory
# This allows Express to serve the built index.html and assets directly
COPY --from=frontend-build /app/frontend/dist ./public

# Setup ENV variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "start"]
