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
COPY apps/crd-service/package.json ./apps/crd-service/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN pnpm --filter @ogca/crd-service build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4002
COPY --from=builder /repo/apps/crd-service/.next/standalone ./
COPY --from=builder /repo/apps/crd-service/.next/static ./apps/crd-service/.next/static
COPY --from=builder /repo/apps/crd-service/public ./apps/crd-service/public 2>/dev/null || true

EXPOSE 4002
CMD ["node", "apps/crd-service/server.js"]
