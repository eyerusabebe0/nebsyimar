import toast from 'react-hot-toast'

export const handleApiError = (error: any, defaultMessage: string = 'An error occurred') => {
  console.error('API Error:', error)

  const status = error?.response?.status ?? error?.status
  const message =
    error?.response?.data?.message ||
    error?.message ||
    defaultMessage

  if (status === 401) {
    toast.error('Unauthorized access. Please log in again.')
    if (typeof window !== 'undefined') {
      window.location.href = '/signin'
    }
    return
  }

  if (status === 403) {
    toast.error('Access denied. You do not have permission to perform this action.')
    return
  }

  if (error?.response?.data?.errors) {
    try {
      const rawErrors = error.response.data.errors
      const validationErrors = Array.isArray(rawErrors)
        ? rawErrors
          .map((err: any) => {
            if (typeof err === 'object' && err.field && err.message) {
              return `${err.field}: ${err.message}`
            }
            return err.message || String(err)
          })
          .join(', ')
        : String(rawErrors)
      toast.error(validationErrors)
      return
    } catch {
      // fall through to generic message
    }
  }

  toast.error(message)
}
