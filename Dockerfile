FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

# ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm install
# --omit=dev

COPY --from=builder /app/dist ./dist

ENV PORT=4200
EXPOSE 4200

CMD ["node", "dist/angular-frontend/server/server.mjs"]
