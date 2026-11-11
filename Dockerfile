
FROM python:3.12-slim

RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

WORKDIR /app 

COPY ml-model/requirements.txt ./ml-model/requirements.txt

RUN pip install --no-cache-dir -r ml-model/requirements.txt

COPY backend ./backend
COPY ml-model ./ml-model

WORKDIR /app/backend

RUN npm install --omit=dev

EXPOSE 5000

CMD ["node", "server.js"]
