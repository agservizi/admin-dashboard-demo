# Admin Dashboard Demo (Bun · Hono · PostgreSQL · React · shadcn/ui)

Monorepo di esempio: API REST in **Bun** o **Node (tsx)** + **Hono**, database **PostgreSQL** con **Prisma**, frontend **React + TypeScript + Vite** con **shadcn/ui** (Tailwind, CSS variables, dark mode `class`).

## Requisiti

- **Node.js** 20+ e `npm` (script di default alla root) **oppure** [Bun](https://bun.sh) per `apps/api` con `bun run dev:bun` / immagine Docker
- PostgreSQL 14+ — in locale puoi usare **`docker compose up -d`** (servizio `postgres` su porta `5432`)
- Copia `.env.example` in **`apps/api/.env`** (già fornito come modello nella root: vedi variabili sotto)

## Struttura

| Percorso | Contenuto |
|----------|-----------|
| ` apps/api` | Hono, Prisma, `GET /api/health`, `/api/stats`, `/api/resources` |
| ` apps/web` | Vite + React, shadcn in `src/components/ui`, alias `@/` |

Il frontend chiama l’API con `fetch` verso `VITE_API_URL` (default sviluppo: `http://localhost:3001`). L’API abilita **CORS** per `WEB_ORIGIN` (default `http://localhost:5173`).

## Installazione

```bash
npm install
# oppure: bun install
```

### PostgreSQL di sviluppo (Docker)

```bash
docker compose up -d
```

Usa la stessa `DATABASE_URL` del file `.env.example` (utente `postgres`, password `postgres`, DB `admin_demo`).

## Database

Imposta `DATABASE_URL` (vedi `.env.example`), poi da root:

```bash
npm run db:generate
npm run db:deploy   # applica migrazioni (adatto a CI / DB già creato)
npm run seed
```

Per creare nuove migrazioni in sviluppo interattivo: `npm run db:migrate` (equivale a `prisma migrate dev`).

Con **Bun** (dopo `bun install`): `bun run db:generate`, ecc.

Equivalente nel pacchetto API:

```bash
cd apps/api
npx prisma migrate deploy
npm run seed
```

## Sviluppo

Due processi (API + Vite):

```bash
npm run dev
```

L’API parte con **Node + tsx** (`tsx watch src/server-node.ts`). Con Bun installato, nella cartella API: `bun run dev:bun`.

- API: `http://localhost:3001` — prova `GET http://localhost:3001/api/health`
- Web: `http://localhost:5173`

**Login demo:** dalla pagina di login, invio del form con email valida e password non vuota apre la sessione (solo `sessionStorage`).

## Build

```bash
npm run build
```

Per il frontend in produzione imposta `VITE_API_URL` **al momento della build** (URL pubblico dell’API visto dal browser). In Docker vedi `ARG VITE_API_URL` nel `Dockerfile`.

## Variabili d’ambiente (riferimento)

| Variabile | Dove | Descrizione |
|-----------|------|-------------|
| `DATABASE_URL` | API | Connection string PostgreSQL per Prisma |
| `PORT` | API | Porta HTTP (default `3001`) |
| `WEB_ORIGIN` | API | Origine CORS del frontend |
| `VITE_API_URL` | **Build** frontend | Base URL dell’API usata in `fetch` |

## Docker (opzionale)

Build immagine (sostituisci l’URL API pubblico per il bundle Vite):

```bash
docker build --build-arg VITE_API_URL=https://api.tuodominio.it -t admin-demo .
docker run -e DATABASE_URL=postgresql://... -p 3001:3001 admin-demo
```

All’avvio viene eseguito `prisma migrate deploy` poi il server Hono.

---

## Deploy via CoreHost MCP

Questa sezione descrive come pubblicare end-to-end il monorepo usando il **server MCP CoreHost** collegato al pannello (es. Cursor).

### 0. Collegamento MCP in Cursor (obbligatorio per il deploy via tool)

L’assistente nell’IDE può chiamare i tool di deploy **solo se** il server MCP CoreHost risulta **aggiunto e attivo** (indicatore verde in **Settings → Tools & MCP**).

1. Apri la configurazione MCP di Cursor e aggiungi il server. Modello pronto (senza segreti): **`.cursor/mcp.corehost.example.json`** — copia il blocco `mcpServers.corehost` nel tuo `mcp.json` utente o di progetto e sostituisci `COREHOST_API_URL` / `COREHOST_TOKEN` con i valori del tuo pannello (o usa l’URL MCP nativo del fornitore, se la tua installazione espone `…/api/v1/mcp?source=Cursor` come da documentazione del panel).
2. Completa l’eventuale **login / autorizzazione** richiesta dall’MCP (OAuth o token).
3. Abilita la rule di progetto **`.cursor/rules/corehost-mcp.mdc`** (o impostala su *always apply* quando lavori al deploy) così l’AI userà i tool MCP invece di limitarsi a istruzioni manuali.

**Nota:** in ambienti dove CoreHost non è configurato, i tool (`deploy_app`, ecc.) **non compaiono** e il deploy va eseguito dal pannello o dalla CLI dopo aver collegato il server.

### 1. Prerequisiti MCP (variabili)

Nel server MCP (package `@corehost/mcp` o equivalente) sono in genere richieste:

| Variabile | Significato |
|-----------|-------------|
| `COREHOST_API_URL` | Base URL delle API del pannello, es. `https://panel.coresuite.it/api/v1` |
| `COREHOST_TOKEN` | Personal Access Token `chk_...` (profilo pannello o `corehost login` CLI) |

### 2. Flusso operativo consigliato (`@corehost/mcp`)

Esegui nell’ordine che segue, usando i tool esposti dal server MCP (nomi indicativi; adatta alla versione effettiva del server):

1. **Connettività** — se disponibile, un tool tipo **`panel_status`**; in alternativa verifica manualmente che API e token rispondano.
2. **Registrazione app** — **`create_app`** con nome coerente con il repo (es. `admin-dashboard-demo`), runtime **Node/Bun** come richiesto dal pannello, repository/branch se necessari.
3. **Database Postgres gestito** — se il pannello lo offre, **`provisionDatabase`** (es. tipo `POSTGRESQL`). Se il database è separato dall’app: **`create_database`** poi **`link_database_to_app`** (o flusso equivalente che inietta `DATABASE_URL` e variabili correlate).
4. **Variabili d’ambiente** — **`add_env_var`** per le chiavi necessarie (vedi tabella sotto).
5. **Deploy** — **`deploy_app`** sull’app creata, dopo aver collegato il repository o caricato l’artefatto richiesto dal pannello. Dopo ogni merge su branch di release puoi rilanciare **`deploy_app`**.
6. **OSS / debug** — **`list_apps`** per lo stato; in caso di errori di build o avvio, **`get_app_logs`** per gli ultimi log.

#### Tabella ENV suggerita per CoreHost

| Chiave | Note |
|--------|------|
| `DATABASE_URL` | Iniettata dal link DB se supportato; altrimenti impostala manualmente |
| `WEB_ORIGIN` | Origine del frontend in produzione (URL pubblico SPA) |
| `PORT` | Se il pannello non la fissa già (es. `3001` o quella attesa) |
| `NODE_ENV` | `production` |
| `VITE_API_URL` | **Da usare come build-arg Docker** o step di build del frontend, non solo runtime |

### 3. Cosa deve esserci nel repo

- **`Dockerfile`** (o script di build allineati a quanto il pannello si aspetta) — vedi file in root.
- **README** (questa sezione) con prompt operativo per l’AI dell’IDE.
- Opzionale — prompt tipo: *«Pubblica questo monorepo su CoreHost: crea l’app `admin-dashboard-demo`, Postgres se serve, imposta ENV da `.env.example`, avvia deploy, mostra log.»*

Ordine sintetico da chiedere in chat: **`create_app` → env (`add_env_var` / link DB) → `deploy_app` → `get_app_logs` se serve.**

---

## Licenza

Demo di esempio — uso interno / didattico.
