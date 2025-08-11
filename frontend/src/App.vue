<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <NavBar />
    <main class="container-wide py-8"><!-- was container-narrow -->
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import NavBar from './components/navBar.vue';
</script>
