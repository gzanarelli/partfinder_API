 
FROM node:12

RUN echo Europe/Paris > /etc/timezone && dpkg-reconfigure -f noninteractive tzdata

RUN apt-get update && \
    apt-get install -y build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app

WORKDIR /app

COPY . /app

RUN chmod +x /app/start.sh

RUN yarn

CMD npm run dev