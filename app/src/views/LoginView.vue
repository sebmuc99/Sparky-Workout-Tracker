<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">💪</div>
        <h1 class="text-2xl font-bold text-white">Workout Tracker</h1>
        <p class="text-slate-400 mt-1 text-sm">
          Connect to your SparkyFitness server
        </p>
      </div>

      <form @submit.prevent="handleConnect" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1"
            >Server URL</label
          >
          <input
            v-model="serverUrl"
            type="url"
            required
            placeholder="https://fit.example.com"
            class="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1"
            >API Key</label
          >
          <input
            v-model="apiKey"
            type="password"
            required
            placeholder="Paste your API key…"
            class="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div
          v-if="errorMsg"
          class="text-red-400 text-sm text-center bg-red-900/30 rounded-xl px-4 py-3"
        >
          {{ errorMsg }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Connecting…</span>
          <span v-else>Connect</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

const router = useRouter();
const auth = useAuthStore();

const serverUrl = ref(auth.serverUrl);
const apiKey = ref("");
const loading = ref(false);
const errorMsg = ref("");

async function handleConnect(): Promise<void> {
  loading.value = true;
  errorMsg.value = "";
  try {
    const url = serverUrl.value.replace(/\/$/, "");
    // Verify the key works by fetching the user's exercises
    await axios.get(`${url}/api/exercises`, {
      headers: { Authorization: `Bearer ${apiKey.value}` },
      params: { itemsPerPage: 1 },
    });
    auth.save(url, apiKey.value);
    await router.push("/");
  } catch {
    errorMsg.value = "Could not connect — check the URL and API key";
  } finally {
    loading.value = false;
  }
}
</script>
