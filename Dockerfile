# Build React App ---
FROM node:18-alpine as builder

WORKDIR /app

# Copy package.json dulu biar caching layer docker optimal
COPY package.json package-lock.json ./ 
RUN npm install

# Copy semua codingan
COPY . .

# Terima variable saat build (penting buat API URL)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build jadi folder /dist
RUN npm run build

# --- Stage 2: Serve pake Nginx ---
FROM nginx:alpine

# Copy hasil build dari Stage 1 ke folder Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy config nginx kita tadi
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
