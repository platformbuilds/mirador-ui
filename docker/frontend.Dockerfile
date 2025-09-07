# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app
COPY packages/frontend/package.json packages/frontend/tsconfig.json packages/frontend/vite.config.ts packages/frontend/index.html ./packages/frontend/
COPY package.json tsconfig.json .eslintrc.cjs .prettierrc ./
RUN npm install --workspace @mirador/frontend --no-audit --no-fund
COPY packages/frontend/src ./packages/frontend/src
RUN npm run -w @mirador/frontend build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
