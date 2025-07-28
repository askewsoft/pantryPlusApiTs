# Build, tag, login, and push in sequence
docker build --platform linux/amd64 -t pantryplus-api . && \
docker tag pantryplus-api:latest 947184124725.dkr.ecr.us-east-1.amazonaws.com/askewsoft/pantryplus-api:latest && \
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 947184124725.dkr.ecr.us-east-1.amazonaws.com && \
docker push 947184124725.dkr.ecr.us-east-1.amazonaws.com/askewsoft/pantryplus-api:latest