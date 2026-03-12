# ── Frontend Dockerfile ───────────────────────────────────────────────────────
# Uses Node 20 Alpine for a lightweight container
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json for dependency installation
COPY package.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose the Vite dev server port
EXPOSE 5173

# Default command — starts Vite dev server bound to all interfaces
CMD ["npm", "run", "dev", "--", "--host"]
