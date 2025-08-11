import { defineStore } from 'pinia';
import { todosApi } from '../utils/api';

export type Todo = { taskId: string; content: string; createdAt?: string; updatedAt?: string };

export const useTodosStore = defineStore('todos', {
  state: () => ({ items: [] as Todo[], loading: false, error: '' }),
  actions: {
    async fetch() {
      this.loading = true; this.error = '';
      try {
        const data = await todosApi.get<{ tasks: Todo[]; length: number }>('/todos');
        this.items = data.tasks;
      } catch (e: any) {
        this.error = e.message || 'Failed to load todos';
      } finally { this.loading = false; }
    },
    async add(content: string) {
      const t = await todosApi.post<Todo>('/todos', { content });
      this.items.push(t);
      return t; // so the component can init its draft
    },
    async update(taskId: string, patch: Partial<Todo>) {
      const t = await todosApi.put<Todo>(`/todos/${taskId}`, patch);
      const i = this.items.findIndex(x => x.taskId === taskId);
      if (i !== -1) this.items[i] = t;
      return t; // so the component can sync draft
    },
    async remove(taskId: string) {
      await todosApi.delete(`/todos/${taskId}`); // 204 expected
      this.items = this.items.filter(t => t.taskId !== taskId);
    }
  }
});
