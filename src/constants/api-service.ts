/**
 * API Service Configuration
 *
 * Default export untuk development
 * Ganti import sesuai environment:
 * - Dev Local: ./api-service-dev-local
 * - Dev: ./api-service-dev
 * - UAT: ./api-service-uat
 * - Prod: ./api-service-prod
 */
// endpoint portnya diganti ke 3000 nanti dioper ke 8001 pake nginx, inii biar bisa redirect ke port 3000 buat auth

export * from "./api-service-dev";
