# Stage 1: Build the frontend application using Vite
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Because your frontend folder might not have a package.json strictly generated yet 
# (if our init script hangs), we will just copy whatever we have and rebuild.
# But for standard operation, we install deps first:
COPY frontend/package.json ./
# Don't fail if package-lock is missing
COPY frontend/package-lock.json* ./
RUN npm install

# Copy all source files and build
COPY frontend/ ./
RUN npm run build

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
