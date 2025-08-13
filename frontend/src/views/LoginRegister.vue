<template>
  <section class="container-narrow">
    <div class="card">
      <h2 class="h2 mb-6">{{ mode==='login' ? 'Login' : 'Register' }}</h2>

      <form class="grid gap-3" @submit.prevent="submit">
        <input v-model.trim="email" type="email" placeholder="Email" class="input" autocomplete="username" />
        <input v-model.trim="password" type="password" placeholder="Password" class="input"
               :autocomplete="mode==='login' ? 'current-password' : 'new-password'" />

        <button class="btn mt-2" type="submit" :disabled="pending">
          {{ pending ? 'Please wait…' : (mode==='login' ? 'Login' : 'Create account') }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>

        <p class="text-center mt-2 muted">
          <a href="#" class="link" @click.prevent="toggle">
            {{ mode==='login' ? 'Need an account? Register' : 'Have an account? Login' }}
          </a>
        </p>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute(); const router = useRouter(); const auth = useAuthStore();

const mode = ref<'login'|'register'>('login');
const email = ref(''); const password = ref(''); const pending = ref(false); const error = ref('');

onMounted(() => {
  requestAnimationFrame(() => (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus());
});

async function submit() {
  error.value=''; pending.value=true;
  try{
    if(mode.value==='login'){
      await auth.login(email.value, password.value);
      router.push((route.query.redirect as string) || '/todos');
    } else {
      await auth.register(email.value, password.value);
      mode.value = 'login';
      (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
    }
  } catch(e:any){ error.value = e?.message || 'Failed'; }
  finally{ pending.value=false; }
}

function toggle(){ mode.value = mode.value==='login' ? 'register' : 'login'; }
</script>
