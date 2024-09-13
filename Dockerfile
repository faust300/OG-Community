FROM node:18
RUN mkdir -p /var/www/api
WORKDIR /var/www/api
COPY . .
RUN yarn global add pm2
RUN yarn
RUN yarn build
EXPOSE 3000
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]

# docker buildx build --platform linux/amd64 -t og-community-api:1.0 .
# docker tag og-community-api:1.0 474944200741.dkr.ecr.ap-southeast-1.amazonaws.com/og-community-api:1.0
# docker push 474944200741.dkr.ecr.ap-southeast-1.amazonaws.com/og-community-api:1.0