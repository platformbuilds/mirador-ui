# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Only copy backend package to install deps efficiently
COPY packages/backend/package.json packages/backend/tsconfig.json ./packages/backend/
COPY package.json tsconfig.json .eslintrc.cjs .prettierrc ./

RUN npm --version && npm i -g npm@latest >/dev/null 2>&1 || true

FROM base AS deps
WORKDIR /app
RUN npm install --workspace @mirador/backend --no-audit --no-fund

FROM base AS build
WORKDIR /app
COPY packages/backend ./packages/backend
RUN npm run -w @mirador/backend build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/packages/backend/node_modules ./node_modules
COPY --from=build /app/packages/backend/dist ./dist
EXPOSE 8080
CMD ["node", "dist/index.js"]

