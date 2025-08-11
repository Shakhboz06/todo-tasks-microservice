// src/stores/auth.ts
import { defineStore } from "pinia";
import { authApi } from "../utils/api";

type User = { email: string } | null;

function decodeJwt<T = any>(token: string): T | null {
	try {
		const payload = token.split(".")[1];
		const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
		return JSON.parse(json);
	} catch {
		return null;
	}
}
function isExpired(token: string): boolean {
	const p = decodeJwt<{ exp?: number }>(token);
	if (!p || typeof p.exp !== "number") return true;
	return Math.floor(Date.now() / 1000) >= p.exp;
}

export const useAuthStore = defineStore("auth", {
	state: () => ({
		token: localStorage.getItem("token") || "",
		user: null as User,
	}),
	getters: {
		isAuthenticated: (s) => !!s.token && !isExpired(s.token),
	},
	actions: {
		async register(email: string, password: string) {
			// User registers; DO NOT auto-login (per your requirement)
			await authApi.post("/auth/register", { email, password });
			// user will manually log in next
		},
		async login(email: string, password: string) {
			const { access_token } = await authApi.post<{ access_token: string }>(
				"/auth/login",
				{ email, password },
			);
			this.token = access_token;
			localStorage.setItem("token", access_token);
			this.user = { email };
		},
		logout() {
			this.token = "";
			this.user = null;
			localStorage.removeItem("token");
		},
		async ensure() {
			// called on app/router load
			if (!this.token) {
				this.logout();
				return false;
			}
			if (isExpired(this.token)) {
				this.logout();
				return false;
			}

			return true;
		},
	},
});
