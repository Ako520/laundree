FROM laundree/laundree_base:latest
MAINTAINER Christian Budde Christensen <budde377@gmail.com>
ENV PORT 3000
ENV REDIS_HOST 'redis'
ENV REDIS_PORT 6379
ENV MONGO_URL 'mongo://mongo/laundree'
ENV FACEBOOK_APP_ID ''
ENV FACEBOOK_APP_SECRET ''
ENV FACEBOOK_CALLBACK_URL ''
ENV GOOGLE_CLIENT_ID ''
ENV GOOGLE_CLIENT_SECRET ''
ENV GOOGLE_CALLBACK_URL ''
ENV SESSION_SECRET ''
ENV CODECLIMATE_REPO_TOKEN ''
EXPOSE 3000
ADD package.json package.json
RUN npm install
ADD . .
RUN chown -R laundree:laundree .
USER laundree
RUN git remote set-url origin https://github.com/laundree/laundree && git lfs pull
CMD ["start"]
ENTRYPOINT ["npm"]
