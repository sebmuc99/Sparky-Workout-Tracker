import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const URL_KEY = 'wt_sparky_url'
const KEY_KEY = 'wt_api_key'

export const useAuthStore = defineStore('auth', () => {
  const serverUrl = ref<string>(
    localStorage.getItem(URL_KEY) ??
    window.__env__?.VITE_SPARKY_URL ??
    import.meta.env.VITE_SPARKY_URL ??
    ''
  )
  const apiKey = ref<string | null>(localStorage.getItem(KEY_KEY))

  const isAuthenticated = computed(() => !!apiKey.value)

  function save(url: string, key: string): void {
    serverUrl.value = url.replace(/\/$/, '') // strip trailing slash
    apiKey.value = key
    localStorage.setItem(URL_KEY, serverUrl.value)
    localStorage.setItem(KEY_KEY, key)
  }

  function clearSession(): void {
    apiKey.value = null
    localStorage.removeItem(KEY_KEY)
  }

  return { serverUrl, apiKey, isAuthenticated, save, clearSession }
})
