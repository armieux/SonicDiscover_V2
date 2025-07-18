# Dockerfile pour l'application Next.js SonicDiscover - Production (avec NPM)
FROM node:18-alpine AS base

# Installation des dépendances système nécessaires
RUN apk add --no-cache libc6-compat curl

# Configuration du répertoire de travail
WORKDIR /app

# Étape de préparation des dépendances
FROM base AS deps
# Copie des fichiers de dépendances
COPY package.json ./
COPY prisma ./prisma/

# Installation des dépendances de production seulement
RUN npm install --only=production && \
    npm cache clean --force

# Génération du client Prisma
RUN npx prisma generate

# Étape de build avec toutes les dépendances
FROM base AS builder
WORKDIR /app

# Installation de toutes les dépendances (dev + prod) pour le build
COPY package.json ./
RUN npm install

# Copie du code source
COPY . .
COPY --from=deps /app/prisma ./prisma

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
# Add a placeholder DATABASE_URL for build time (will be overridden at runtime)
ENV DATABASE_URL=postgresql://user:password@db:5432/sonicdiscover

# Génération du client Prisma pour le build
RUN npx prisma generate

# Build de l'application Next.js (with build-time env vars)
RUN npm run build

# Copy les fichiers nécessaires pour le script d'importation de musiques
COPY scripts/music-importer-v2.js ./scripts/music-importer-v2.js

# Importation des musiques via commande node scripts/music-importer-v2.js --download
RUN chmod +x ./scripts/music-importer-v2.js

# Exécution du script d'importation des musiques (optionnel, à commenter si non nécessaire)
RUN npm run import:music

# Étape de production finale
FROM base AS runner
WORKDIR /app

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Configuration des variables d'environnement de production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Copie du dossier .next avec les bonnes permissions
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copie des node_modules de production
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copie des scripts depuis le builder
COPY --from=builder /app/scripts ./scripts

# Changement vers l'utilisateur non-root
USER nextjs

# Exposition du port
EXPOSE 3000

# Variables d'environnement pour le runtime
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Commande de démarrage avec db push (pour base existante)
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node server.js"]
