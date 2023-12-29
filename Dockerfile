FROM node:16-alpine AS development
ENV NODE_ENV development

WORKDIR /
COPY app/package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .
WORKDIR /app

CMD ["npm", "start"]