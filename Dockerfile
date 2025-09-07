ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} node:22-alpine AS full
RUN apk add --no-cache git bash sed

WORKDIR /work
COPY . .

# The Server
RUN --mount=type=cache,target=/root/.npm \
    npm ci && \
    npm run test

FROM --platform=${BUILDPLATFORM} node:22-alpine AS exe
WORKDIR /work
COPY --from=full /work /work
ENV PKG_CACHE_PATH=/root/.npm/.pkg-cache
RUN --mount=type=cache,target=/root/.npm \
    npm run build:exe

FROM node:22-alpine AS arch
WORKDIR /work
COPY --from=exe /work/dist/* /work/
RUN ARCH=$(node -e "console.log(process.arch)") && \
    cp procfiled-${ARCH} procfiled && \
    chmod +x procfiled && \
    ./procfiled --version

FROM scratch
COPY --from=arch /work/procfiled /usr/local/bin/procfiled
ENTRYPOINT [ "procfiled" ]
