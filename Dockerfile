# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.9.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="NodeJS"
WORKDIR /app
ENV NODE_ENV=production

FROM base AS build
# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y  build-essential openssl curl


RUN curl -fsSL "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" -o /bin/pnpm; chmod +x /bin/pnpm;

# Install node modules
COPY --link package.json .
RUN pnpm install --production=false

# Copy application code
COPY --link . .

RUN pnpm run build

# Final stage for app image
FROM base AS production

RUN apt-get update -y && apt-get install -y openssl
COPY --from=build /app/dist /app
COPY --from=build /app/docker-entrypoint /app/docker-entrypoint
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json

# Entrypoint prepares the database.
ENTRYPOINT ["/app/docker-entrypoint"]

# Start the server by default, this can be overwritten at runtime
CMD [ "node", "/app/index.js" ]
