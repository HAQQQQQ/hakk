# Use Node.js as the base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your redis-service runs on
# EXPOSE 3002

# Use your package.json script to start the service
CMD ["npm", "run", "start"]


