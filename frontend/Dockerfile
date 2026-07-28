# Optional: containerized static hosting for the frontend, if you prefer
# Cloud Run over Firebase Hosting for both tiers.
FROM node:20-slim AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
