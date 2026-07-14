<!--
  Dedicated admin sign-in page. See composables/useAdminAuth.ts for the shared-secret
  auth model — this is a TODO-flagged placeholder until real per-user auth exists.
-->
<template>
  <div class="mx-auto max-w-md px-4 py-24">
    <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-card">
      <h1 class="font-display text-lg font-bold text-gray-900">Admin Sign In</h1>
      <p class="mt-1 text-sm text-gray-500">Enter the admin token to manage products.</p>
      <form class="mt-4 space-y-3" @submit.prevent="handleLogin">
        <input
          v-model="tokenInput"
          type="password"
          placeholder="Admin token"
          autofocus
          class="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <button
          type="submit"
          :disabled="submitting"
          class="w-full rounded-full bg-rose-gradient py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {{ submitting ? 'Signing In…' : 'Sign In' }}
        </button>
        <p v-if="loginError" class="text-sm text-red-600">{{ loginError }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { isAuthenticated, login } = useAdminAuth()

// Already signed in? Skip straight to the dashboard.
onMounted(() => {
  if (isAuthenticated.value) navigateTo('/admin')
})

const tokenInput = ref('')
const loginError = ref('')
const submitting = ref(false)

async function handleLogin() {
  loginError.value = ''
  submitting.value = true
  try {
    // Validate against the raw input first — only persist via login() on success,
    // so a wrong token never flips isAuthenticated to true.
    await $fetch('/api/admin/products', { headers: { 'X-Admin-Token': tokenInput.value } })
  } catch {
    loginError.value = 'Invalid token.'
    submitting.value = false
    return
  }
  login(tokenInput.value)
  await navigateTo('/admin')
}
</script>
