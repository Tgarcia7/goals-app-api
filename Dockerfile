FROM node:20

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY [".", "/usr/src/app/"]

WORKDIR /usr/src/app/

RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "dev" ]
