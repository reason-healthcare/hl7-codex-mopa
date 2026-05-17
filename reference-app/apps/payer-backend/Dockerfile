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
COPY apps/payer-backend/package.json ./apps/payer-backend/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN pnpm --filter @ogca/payer-backend build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4005
COPY --from=builder /repo/apps/payer-backend/.next/standalone ./
COPY --from=builder /repo/apps/payer-backend/.next/static ./apps/payer-backend/.next/static
COPY --from=builder /repo/apps/payer-backend/public ./apps/payer-backend/public 2>/dev/null || true

EXPOSE 4005
CMD ["node", "apps/payer-backend/server.js"]
