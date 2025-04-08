# frontend/Dockerfile
#
# This Dockerfile sets up the frontend environment using Node.js.
# - Copies package files and installs dependencies.
# - Copies the application files to the container.
# - Exposes port 3000 for the frontend application.
# - Runs the application using the "npm start" command.


FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
