FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate

ARG SUPABASE_URL="https://example.supabase.co"
ARG SUPABASE_STORAGE_KEY="placeholder-key"
ARG NEXT_PUBLIC_SUPABASE_STORAGE="https://example.supabase.co/storage/v1/object/public/"

ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_STORAGE_KEY=$SUPABASE_STORAGE_KEY
ENV NEXT_PUBLIC_SUPABASE_STORAGE=$NEXT_PUBLIC_SUPABASE_STORAGE

RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "start"]