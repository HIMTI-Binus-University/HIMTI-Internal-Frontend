/**
 * API Endpoints Constants
 * Centralized API endpoint definitions
 */

import { ApiService } from './api-service'

export const Api = {
  // Auth endpoints
  login: `${ApiService.baseURL}/auth/login`,
  logout: `${ApiService.baseURL}/auth/logout`,
  refreshToken: `${ApiService.baseURL}/auth/refresh-token`,

  // User endpoints
  users: `${ApiService.baseURL}/users`,
  userById: `${ApiService.baseURL}/users/:id`,
  userCreate: `${ApiService.baseURL}/users`,
  userUpdate: `${ApiService.baseURL}/users/:id`,
  userDelete: `${ApiService.baseURL}/users/:id`,

  // Add more API endpoints here
  // Example:
  // articles: `${ApiService.baseURL}/articles`,
  // articleById: `${ApiService.baseURL}/articles/:id`,
  // articleCreate: `${ApiService.baseURL}/articles`,
  // articleUpdate: `${ApiService.baseURL}/articles/:id`,
  // articleDelete: `${ApiService.baseURL}/articles/:id`,
  // articleGetByTopicId: `${ApiService.baseURL}/articles/topic/:topicId`,
}
