# Use a Node.js 18 base image
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend application code
COPY . .

# Copy the Docker environment file
COPY .env.docker .env

# Expose port 3000
EXPOSE 3000

# Command to run the application in development mode
CMD ["npm", "start"]