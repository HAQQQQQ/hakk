# Use Node.js as the base image
FROM node:22.14.0-slim

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies including development dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port your server runs on
# EXPOSE 3001

# Start the server in development mode
CMD ["npm", "run", "start"]
