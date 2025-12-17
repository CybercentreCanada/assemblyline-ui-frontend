# Build source environment
FROM dhi.io/node:22-debian13-dev AS builder
WORKDIR /tmp
COPY . ./frontend/
WORKDIR /tmp/frontend
# RUN npm install -g pnpm@latest-10
RUN pnpm install --prod --silent
RUN pnpm run build


# Production container creation
FROM dhi.io/node:22-debian13-dev
RUN npm install -g serve
WORKDIR /usr/src/app
COPY --from=builder /tmp/frontend/build .
EXPOSE 3000
# USER node
CMD ["npx", "serve", "-s",  "-p", "3000"]
