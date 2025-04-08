# backend/Dockerfile
# This Dockerfile configures the environment and builds a Docker image to run the backend application in a container.

FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN apt-get update && apt-get install -y sqlite3

RUN npm run build

CMD ["node", "dist/index.js"]
