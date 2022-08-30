FROM node:18-alpine as base
#FROM --platform=linux/amd64 node:16-alpine as base
#FROM --platform=linux/arm64 node:16-alpine as base
WORKDIR /app

FROM base as build
COPY ["./package.json", "package-lock.json", "./"]
RUN npm ci
COPY . .
RUN npm run build

FROM base as dependencies-prod
COPY ["./package.json", "package-lock.json", "./"]
RUN npm ci

FROM base as final
ENV NODE_ENV=production

COPY --from=dependencies-prod /app/node_modules ./node_modules
COPY --from=build /app/dist ./

CMD ["node", "index.js"]
