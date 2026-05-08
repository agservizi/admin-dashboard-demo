# Immagine di esempio per deployment container (API Bun + asset frontend opzionale).
# Il pannello CoreHost può richiedere tweak al CMD o variabili — adatta secondo la documentazione del tuo progetto.

FROM oven/bun:1.2 AS deps
WORKDIR /app

ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

RUN bun install

COPY . .

RUN cd apps/api && bunx prisma generate
RUN cd apps/web && bun run build

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Migrazioni: eseguire in fase di release/start (DATABASE_URL richiesto)
CMD ["sh", "-c", "cd apps/api && bunx prisma migrate deploy && exec bun src/index.ts"]
