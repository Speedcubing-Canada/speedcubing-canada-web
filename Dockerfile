FROM node:20.19.5-slim AS development
ENV NODE_ENV=development

WORKDIR /app

# Copy package.json first for better Docker layer caching
COPY app/package.json ./
RUN npm install

# Copy the rest of the app (node_modules excluded by .dockerignore)
COPY app/ .

EXPOSE 2003
CMD ["npm", "run", "dev", "--", "--host"]