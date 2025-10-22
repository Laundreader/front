import type { User } from "@/entities/user/model";

type AuthState =
	| {
			isAuthenticated: true;
			user: User;
	  }
	| {
			isAuthenticated: false;
			user: null;
	  };

type Listener = () => void;

class AuthStore {
	private state: AuthState = {
		isAuthenticated: false,
		user: null,
	};

	private listeners = new Set<Listener>();

	get = (): AuthState => {
		return this.state;
	};

	subscribe = (listener: Listener): (() => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};

	private notify = (): void => {
		for (const listener of this.listeners) {
			listener();
		}
	};

	set = (user: User | null): void => {
		if (user === null) {
			this.state = {
				user: null,
				isAuthenticated: false,
			};
		} else {
			this.state = {
				user,
				isAuthenticated: true,
			};
		}

		this.notify();
	};

	clear = (): void => {
		this.state = {
			user: null,
			isAuthenticated: false,
		};
		this.notify();
	};
}

export const authStore = new AuthStore();
