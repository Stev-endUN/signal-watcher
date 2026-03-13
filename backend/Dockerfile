FROM node:20-slim
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci --incluide=dev
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3001
ENV NODE_ENV=production
RUN ls -la dist/
CMD ["node", "dist/index.js"]