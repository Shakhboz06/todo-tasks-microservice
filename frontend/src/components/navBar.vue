<template>
  <header class="bg-white/90 border-b border-gray-200 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/80">
    <nav class="container-wide h-14 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <RouterLink to="/todos" class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,.6)]"></span>
          <span class="font-semibold text-gray-900">Todo App</span>
        </RouterLink>
        <RouterLink to="/todos" class="text-gray-500 hover:text-gray-900">Todos</RouterLink>
      </div>

      <div class="flex items-center gap-3">
        <span v-if="auth.isAuthenticated" class="hidden sm:block text-sm text-gray-600">
          {{ auth.user?.email }}
        </span>
        <RouterLink v-if="!auth.isAuthenticated" to="/auth" class="btn">Login</RouterLink>
        <button v-else class="btn" @click="logout">Logout</button>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
const auth = useAuthStore();
const router = useRouter();
function logout(){ auth.logout(); router.push({ name:'auth' }); }
</script>
