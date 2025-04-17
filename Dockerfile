# Build source environment
FROM node:22-alpine AS builder
WORKDIR /tmp
COPY . ./frontend/
WORKDIR /tmp/frontend
RUN npm install -g pnpm@latest-10
RUN pnpm install --prod --silent
RUN pnpm run build


# Production container creation
FROM node:22-alpine
RUN npm install -g serve
WORKDIR /usr/src/app
COPY --from=builder /tmp/frontend/build .
EXPOSE 3000
USER node
CMD ["serve", "-s",  "-p", "3000"]
