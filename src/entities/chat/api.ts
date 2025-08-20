import { http, type HttpResponseSuccess } from "@/shared/api";

export async function createChatSessionId() {
	const response = await http
		.post<HttpResponseSuccess<{ sessionId: string }>>("chat/stream")
		.json();

	return response.data.sessionId;
}

export async function sendMessage(sessionId: string, message: string) {
	await http.post(`chat/${sessionId}`, {
		json: { message },
	});
}

export async function endChatSession(sessionId: string) {
	await http.delete(`chat/${sessionId}`);
}
