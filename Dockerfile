# Build source environment
FROM node:18-alpine AS builder
WORKDIR /tmp
COPY . ./frontend/
WORKDIR /tmp/frontend
RUN yarn install --prod --silent
RUN yarn run build


# Production container creation
FROM node:18-alpine
RUN yarn global add serve
WORKDIR /usr/src/app
COPY --from=builder /tmp/frontend/build .
EXPOSE 3000
CMD ["serve", "-s",  "-l", "3000"]
