# Stage 1: Build the React application
FROM node:22.18.0-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite app (outputs to /app/dist by default)
RUN npm run build

# Stage 2: Serve the application
FROM node:22.18.0-slim

WORKDIR /app

# Install 'serve' to run a lightweight static file server
RUN npm install -g serve

# Copy the built assets from the builder stage
COPY --from=builder /app/dist ./dist

# Cloud Run injects the PORT environment variable (default is 8080)
ENV PORT=8080
EXPOSE 8080

# Run 'serve' in single-page application mode (-s) so React Router handles routing.
# It binds to the PORT dynamically injected by Cloud Run.
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT}"]