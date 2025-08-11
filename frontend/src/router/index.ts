// src/router/index.ts
import {
	createRouter,
	createWebHistory,
	type RouteRecordRaw,
} from "vue-router";
import LoginRegister from "../views/LoginRegister.vue";
import Todos from "../views/Todos.vue";
import { useAuthStore } from "../stores/auth";

const routes: RouteRecordRaw[] = [
	{ path: "/", redirect: "/todos" },
	{
		path: "/auth",
		name: "auth",
		component: LoginRegister,
		meta: { public: true },
	},
	{ path: "/todos", name: "todos", component: Todos },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach(async (to) => {
	const auth = useAuthStore();
	// validate token on every nav
	const ok = await auth.ensure();

	if (!to.meta.public && !ok) {
		return { name: "auth", query: { redirect: to.fullPath } };
	}
	// If already authenticated and going to /auth, send them to /todos
	if (to.name === "auth" && ok) {
		return { name: "todos" };
	}
});

export default router;
