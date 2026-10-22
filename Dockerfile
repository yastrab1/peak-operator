FROM node:22-alpine
RUN apk add --no-cache openssh-client
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
# trust peak host key (best-effort at build time)
RUN mkdir -p /root/.ssh && ssh-keyscan -H peak >> /root/.ssh/known_hosts 2>/dev/null || true
EXPOSE 1111
CMD ["node", "server.js"]
