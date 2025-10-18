# Step 1: Build stage
FROM node:18-alpine AS build-stage

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json, pnpm-lock.yaml, and tsconfig.json first to install dependencies
COPY package.json pnpm-lock.yaml tsconfig.json ./

# Copy package.json and pnpm-lock.yaml first to install dependencies
COPY package.json pnpm-lock.yaml ./

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile

# Install Prisma dependencies
RUN pnpm install @prisma/client

# Copy the Prisma schema
COPY prisma ./prisma

# Generate the Prisma client
RUN pnpx prisma generate

# Build the NestJS app
RUN pnpm run build


# Copy the rest of the application files
COPY . .

# Build the NestJS app
RUN pnpm run build

# Step 2: Production stage
FROM node:18-alpine AS production-stage

# Set the working directory
WORKDIR /app

# Install pnpm globally in the production container
RUN npm install -g pnpm

# Copy only the production files from the build stage
COPY --from=build-stage /app ./


# Install only production dependencies (excluding dev dependencies)
RUN pnpm install --prod

# Expose the port that the app will run on
EXPOSE 4000

# Command to run the application in production
CMD ["pnpm", "run", "start:prod"]
