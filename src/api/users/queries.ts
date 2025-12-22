import { useQuery, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import apiClient from '@/config/api-client'
import { Api } from '@/constants/api'
import { AxiosError } from 'axios'

/**
 * ====================================
 * Types & Interfaces
 * ====================================
 */

// User entity type
export interface User {
  id: number
  name: string
  email: string
  username: string
}

// Request params for GET /users
export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
}

// Payload for POST /users (Create)
export interface CreateUserPayload {
  name: string
  email: string
  username: string
}

// Payload for PUT /users/:id (Update)
export interface UpdateUserPayload {
  id: number
  name?: string
  email?: string
  username?: string
}

/**
 * ====================================
 * Queries (GET requests)
 * ====================================
 * Menggunakan useQuery untuk data fetching
 */

// Hook untuk fetch list users dengan optional filters
export const useGetUsers = (params?: GetUsersParams) => {
  return useQuery({
    queryKey: ['users', params], // Query key untuk cache management
    queryFn: () =>
      apiClient.get(Api.users, { params }).then((res) => res.data),
    staleTime: 5 * 60 * 1000, // Cache data selama 5 menit
  })
}

// Hook untuk fetch single user by ID
export const useGetUserById = (id: number) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () =>
      apiClient.get(Api.userById.replace(':id', String(id))).then((res) => res.data),
    enabled: !!id, // Hanya run query jika id ada
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * ====================================
 * Mutations (POST/PUT/DELETE requests)
 * ====================================
 * Menggunakan useMutation untuk operasi yang mengubah data
 */

// Hook untuk create user baru
export const useCreateUser = (
  options?: UseMutationOptions<User, AxiosError, CreateUserPayload>
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      apiClient.post(Api.users, payload).then((res) => res.data),
    onSuccess: (data) => {
      // Invalidate users list agar refetch data terbaru
      queryClient.invalidateQueries({ queryKey: ['users'] })
      // Set data user baru ke cache
      queryClient.setQueryData(['users', data.id], data)
    },
    ...options,
  })
}

// Hook untuk update user existing
export const useUpdateUser = (
  options?: UseMutationOptions<User, AxiosError, UpdateUserPayload>
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => {
      const { id, ...data } = payload
      return apiClient.put(Api.userUpdate.replace(':id', String(id)), data).then((res) => res.data)
    },
    onSuccess: (data) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ['users'] })
      // Update cache untuk user detail
      queryClient.setQueryData(['users', data.id], data)
    },
    ...options,
  })
}

// Hook untuk delete user
export const useDeleteUser = (
  options?: UseMutationOptions<void, AxiosError, number>
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(Api.userDelete.replace(':id', String(id))).then(() => undefined),
    onSuccess: (_, deletedId) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ['users'] })
      // Remove deleted user dari cache
      queryClient.removeQueries({ queryKey: ['users', deletedId] })
    },
    ...options,
  })
}
