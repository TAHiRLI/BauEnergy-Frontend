# Stage 1: Build the React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Pass environment variables during build
ARG REACT_APP_API_URL
ARG REACT_APP_DOCUMENT_URL

ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_DOCUMENT_URL=${REACT_APP_DOCUMENT_URL}

# Build the React project
RUN npm run build

# Debug: Verify the build directory
RUN ls -la /app
RUN ls -la /app/build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine AS production

# Copy the built project files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 90

CMD ["nginx", "-g", "daemon off;"]