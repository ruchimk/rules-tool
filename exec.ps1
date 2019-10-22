docker build -t rules-tool-with-login .
docker run --env-file .env -p 3000:3000 -it rules-tool-with-login
