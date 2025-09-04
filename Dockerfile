FROM node:20.19.5-alpine AS development
ENV NODE_ENV=development

WORKDIR /
COPY app/package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .
WORKDIR /app

EXPOSE 3000
CMD ["npm", "start"]