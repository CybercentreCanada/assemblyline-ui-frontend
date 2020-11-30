FROM node:12

# Set app directory
WORKDIR /usr/src/app

# Install dependencies
RUN npm install -g serve

RUN mkdir build
COPY build ./next/
COPY build/index.html .

EXPOSE 4000

CMD ["serve", "-s",  "-l", "4000"]

