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
COPY apps/dtr-client/package.json ./apps/dtr-client/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN pnpm --filter @ogca/dtr-client build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4003
COPY --from=builder /repo/apps/dtr-client/.next/standalone ./
COPY --from=builder /repo/apps/dtr-client/.next/static ./apps/dtr-client/.next/static
COPY --from=builder /repo/apps/dtr-client/public ./apps/dtr-client/public 2>/dev/null || true

EXPOSE 4003
CMD ["node", "apps/dtr-client/server.js"]
