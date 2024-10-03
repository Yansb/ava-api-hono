# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.9.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS/Prisma"

# NodeJS/Prisma app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential openssl

# Install node modules
COPY --link package.json .
RUN npm install --production=false

# Copie o diretório prisma explicitamente
COPY --link prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY --link . .

RUN npm run build

# Final stage for app image
FROM base AS production

RUN apt-get update -y && apt-get install -y openssl
COPY --from=build /app/dist /app
COPY --from=build /app/docker-entrypoint /app/docker-entrypoint
COPY --from=build /app/prisma /app/prisma
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json

# Entrypoint prepares the database.
ENTRYPOINT ["/app/docker-entrypoint"]

# Start the server by default, this can be overwritten at runtime
CMD [ "node", "/app/src/index.js" ]
