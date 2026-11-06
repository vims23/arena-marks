FROM node:22-slim
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN corepack prepare pnpm@10.17.1 --activate && pnpm install --frozen-lockfile
COPY . .
RUN chown -R node:node /app
USER node
ENV NEXT_TELEMETRY_DISABLED=1
ENV ARENA_API_URL=http://api:8000
RUN ./node_modules/.bin/next build
CMD ["node", "node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0", "--port", "3100"]
