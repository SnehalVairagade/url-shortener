# Dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# We use tsx to run the server directly from typescript for simplicity in this project,
# though in a huge production app we'd pre-compile to JS.
EXPOSE 3000
CMD [ "npm", "run", "dev" ]
