FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

FROM base AS deps
WORKDIR /repo
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/fhir-client/package.json ./packages/fhir-client/
COPY packages/cds-hooks/package.json ./packages/cds-hooks/
COPY packages/cql-engine/package.json ./packages/cql-engine/
COPY packages/smart-auth/package.json ./packages/smart-auth/
COPY packages/ui/package.json ./packages/ui/
COPY apps/pas-service/package.json ./apps/pas-service/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN pnpm --filter @ogca/pas-service build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4004
COPY --from=builder /repo/apps/pas-service/.next/standalone ./
COPY --from=builder /repo/apps/pas-service/.next/static ./apps/pas-service/.next/static
COPY --from=builder /repo/apps/pas-service/public ./apps/pas-service/public 2>/dev/null || true

EXPOSE 4004
CMD ["node", "apps/pas-service/server.js"]
