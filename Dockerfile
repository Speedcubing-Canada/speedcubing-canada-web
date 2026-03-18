FROM node:24-slim AS development
ENV NODE_ENV=development

WORKDIR /app

# Copy package.json first for better Docker layer caching
COPY front/package.json ./
RUN npm install

# Copy the rest of the app (node_modules excluded by .dockerignore)
COPY front/ .

EXPOSE 2003

ENTRYPOINT [ "npm" ]
CMD ["run", "dev", "--", "--host"]