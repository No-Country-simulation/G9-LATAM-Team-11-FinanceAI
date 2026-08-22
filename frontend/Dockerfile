# Etapa 1: Compilación de los estáticos (Node.js)
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# En producción, apuntamos al proxy inverso de Nginx configurado localmente
ENV VITE_BACKEND_URL=/api
RUN npm run build

# Etapa 2: Servidor Web Ligero (Nginx)
FROM nginx:alpine
# Remover configuración por defecto
RUN rm -rf /usr/share/nginx/html/*
# Copiar estáticos generados por Vue
COPY --from=builder /app/dist /usr/share/nginx/html
# Configuración del proxy inverso
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80 (el único abierto al exterior)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
