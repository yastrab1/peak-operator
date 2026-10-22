FROM node:22-alpine
RUN apk add --no-cache openssh-client
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 1111
CMD ["node", "server.js"]
