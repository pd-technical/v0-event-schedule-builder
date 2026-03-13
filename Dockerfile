FROM node:24-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1
ENV TZ=America/Los_Angeles


FROM base AS build
RUN npm ci

COPY . .
RUN npm run build


FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Run Next.js app as a separate user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# See Next.js docs for how this works: https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
