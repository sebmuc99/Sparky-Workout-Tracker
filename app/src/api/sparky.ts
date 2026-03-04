import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const sparky = axios.create()

// Inject base URL + Bearer API key on every request
sparky.interceptors.request.use((config) => {
  const auth = useAuthStore()
  config.baseURL = auth.serverUrl
  if (auth.apiKey) {
    config.headers.Authorization = `Bearer ${auth.apiKey}`
  }
  return config
})

// On 401 → clear session and redirect to login
sparky.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      auth.clearSession()
      await router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default sparky
