import { QueryClient } from '@tanstack/react-query'

let queryClient: QueryClient | null = null

const getQueryClient = () => {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          refetchOnMount: true,
          refetchOnReconnect: true,
          retry: 1,
          staleTime: 1 * 60 * 1000, // 1 minute
          gcTime: 5 * 60 * 1000, // 5 minutes
        },
        mutations: {
          retry: 0,
        },
      },
    })
  }
  return queryClient
}

export default getQueryClient
