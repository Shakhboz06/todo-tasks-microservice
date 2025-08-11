<template>
  <div class="card">
    <h2 class="h2 mb-6">Todos</h2>

    <!-- add bar -->
    <div class="flex gap-2 mb-6">
      <input v-model.trim="newContent" placeholder="Add a todo…" class="input flex-1" @keyup.enter="add" />
      <button class="btn" @click="add" :disabled="!newContent">Add</button>
    </div>

    <p v-if="todos.loading" class="muted">Loading…</p>
    <p v-if="todos.error" class="text-red-600 text-sm mb-4">{{ todos.error }}</p>

    <!-- responsive GRID -->
    <ul v-if="todos.items.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <li v-for="t in todos.items" :key="t.taskId"
          class="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs flex flex-col min-h-[140px]">
        <div class="text-gray-900 break-words">
          {{ t.content }}
        </div>

        <!-- actions anchored to bottom inside the card -->
        <div class="mt-auto pt-4 flex justify-end gap-2">
          <button class="btn" @click="openModal(t)">Update</button>
          <button class="btn" @click="remove(t.taskId)">Delete</button>
        </div>
      </li>
    </ul>

    <p v-else class="muted">No todos yet.</p>
  </div>

  <!-- EDIT MODAL -->
  <div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" @keydown.esc="closeModal">
    <div class="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Edit todo</h3>
        <button class="rounded-full p-2 hover:bg-gray-100" @click="closeModal" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 8.586 4.293 2.879 2.879 4.293 8.586 10l-5.707 5.707 1.414 1.414L10 11.414l5.707 5.707 1.414-1.414L11.414 10l5.707-5.707-1.414-1.414L10 8.586z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      <div class="p-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <input v-model.trim="draft" class="input" placeholder="Update your todo…" @keyup.enter="saveModal" autofocus />
      </div>
      <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-200">
        <button class="btn" :disabled="saving || !changed" @click="saveModal">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useTodosStore, type Todo } from '../stores/todos';

const todos = useTodosStore();

const newContent = ref('');
const editing = ref(false);
const current = ref<Todo | null>(null);
const draft = ref('');
const saving = ref(false);

onMounted(() => { todos.fetch(); });

async function add() {
  if (!newContent.value) return;
  await todos.add(newContent.value);
  newContent.value = '';
}

function openModal(t: Todo) {
  current.value = t;
  draft.value = t.content;
  editing.value = true;
  document.documentElement.style.overflow = 'hidden';
}
function closeModal() {
  editing.value = false;
  current.value = null;
  draft.value = '';
  document.documentElement.style.overflow = '';
}

const changed = computed(() => !!current.value && draft.value !== current.value.content);

async function saveModal() {
  if (!current.value || !changed.value) return;
  try {
    saving.value = true;
    await todos.update(current.value.taskId, { content: draft.value });
    closeModal();
  } finally { saving.value = false; }
}

async function remove(id: string) {
  await todos.remove(id);
  if (current.value?.taskId === id) closeModal();
}
</script>
