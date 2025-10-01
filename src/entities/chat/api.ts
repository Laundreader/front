import { httpPublic } from "@/shared/api";

import type { HttpResponseSuccess } from "@/shared/api";

export async function createChatSessionId() {
	const response = await httpPublic
		.post<HttpResponseSuccess<{ sessionId: string }>>("chat/stream")
		.json();

	return response.data.sessionId;
}

export async function sendMessage(sessionId: string, message: string) {
	await httpPublic.post(`chat/${sessionId}`, {
		json: { message },
	});
}

export async function endChatSession(sessionId: string) {
	await httpPublic.delete(`chat/${sessionId}`);
}
