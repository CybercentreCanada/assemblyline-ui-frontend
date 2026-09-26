# Build source environment
FROM dhi.io/node:22-alpine3.22-dev AS builder
RUN npm install -g serve
WORKDIR /tmp
COPY . ./frontend/
WORKDIR /tmp/frontend
RUN pnpm install --prod --silent
RUN pnpm run build


# Production container creation
FROM dhi.io/node:22-alpine3.22
WORKDIR /
COPY --from=builder /opt/nodejs/ /opt/nodejs/
WORKDIR /usr/src/app
COPY --from=builder /tmp/frontend/build .
EXPOSE 3000
USER node
CMD ["node", "/opt/nodejs/node-v22.21.1/lib/node_modules/serve/build/main.js", "-s",  "-p", "3000"]
