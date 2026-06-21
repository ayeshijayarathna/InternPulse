FROM node:20-alpine

# Working directory
WORKDIR /app

# Dependencies install 
COPY package*.json ./
RUN npm install --production

# Source code copy
COPY . .

# uploads folders create (local disk storage)
RUN mkdir -p uploads/attachments uploads/cvs

# Port expose
EXPOSE 5000

# Start command
CMD ["node", "src/server.js"]