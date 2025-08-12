import { useAuthStore } from "../stores/auth";

function makeClient(base: string) {
	const BASE = (base || "").replace(/\/+$/, "");

	async function handle<T>(res: Response): Promise<T> {
		if (res.status === 204) return undefined as unknown as T;
		let json: unknown = null;
		try {
			json = await res.json();
		} catch {}
		if (!res.ok) {
			const msg = (json as any)?.message ?? res.statusText ?? "Request failed";
			throw new Error(msg);
		}
		// unwrap { success, data, message }
		if (json && typeof json === "object" && "data" in (json as any)) {
			return (json as any).data as T;
		}
		return json as T;
	}

	// IMPORTANT: no `this` usage
	const fetchFn = <T>(path: string, init: RequestInit = {}) => {
		const auth = useAuthStore();
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
		};
		return fetch(`${BASE}${path}`, {
			...init,
			headers: { ...headers, ...(init.headers as any) },
		}).then(handle<T>);
	};

	return {
		fetch: fetchFn,
		get: <T>(p: string) => fetchFn<T>(p),
		post: <T>(p: string, body?: unknown) =>
			fetchFn<T>(p, { method: "POST", body: JSON.stringify(body) }),
		put: <T>(p: string, body?: unknown) =>
			fetchFn<T>(p, { method: "PUT", body: JSON.stringify(body) }),
		patch: <T>(p: string, body?: unknown) =>
			fetchFn<T>(p, { method: "PATCH", body: JSON.stringify(body) }),
		delete: <T>(p: string) => fetchFn<T>(p, { method: "DELETE" }),
	} as const;
}

// two clients: Auth (3001) and Todos (3002)
export const authApi = makeClient(import.meta.env.VITE_AUTH_BASE_URL ||  "https://mytodotasks.duckdns.org");
export const todosApi = makeClient(import.meta.env.VITE_TODOS_BASE_URL ||"https://mytodotasks.duckdns.org");
