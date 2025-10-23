# Stage 1: The 'base' stage for dependencies and building
FROM node:20-alpine AS base

# Install pnpm using corepack
RUN corepack enable pnpm

# Set the working directory
WORKDIR /app

# Stage 2: The 'development' stage
FROM base AS development

# Copy pnpm configuration files and install dependencies
#COPY pnpm-lock.yaml ./
#COPY package.json ./

# Use a volume for the pnpm store to enable caching across builds
# Use --frozen-lockfile to ensure lockfile consistency
#RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy the rest of the application code
#COPY . .

# Expose the port your NestJS app runs on (e.g., 3000)
EXPOSE 3000

# Command to run the application in development mode with hot-reloading
CMD ["pnpm", "run", "start:dev"]

# Stage 3: The 'production' stage (optional but recommended)
FROM base AS production

# Copy configuration files
COPY pnpm-lock.yaml ./
COPY package.json ./

# Install only production dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

# Copy built application code from the development stage
COPY --from=development /usr/src/app/dist ./dist

# Command to run the application in production mode
CMD ["node", "dist/main"]

