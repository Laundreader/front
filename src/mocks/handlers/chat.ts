import { http, HttpResponse } from "msw";
import { API_URL_PUBLIC } from "@/shared/api";
import { mockData } from "../mock-data";

const encoder = new TextEncoder();

export const chatHandlers = [
	// MARK: sessionId 생성
	http.post(API_URL_PUBLIC + "/chat", () => {
		return HttpResponse.json({ sessionId: mockData.string.ulid() });
	}),

	// MARK: 채팅 연결
	http.get(API_URL_PUBLIC + "/chat/stream/:sessionId", () => {
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(
					encoder.encode(
						`event:assistant-answers\ndata:{"message": "안녕하세요! 저는 버블리입니다."}\n\n`,
					),
				);
				// controller.close();
			},
		});

		return new HttpResponse(stream, {
			headers: {
				"content-type": "text/event-stream",
				"cache-control": "no-cache",
				connection: "keep-alive",
			},
		});
	}),

	// MARK: 채팅 메시지 응답
	http.post<{ sessionId: string }, { message: string }>(
		API_URL_PUBLIC + "/chat/stream/:sessionId",
		async ({ request }) => {
			const body = await request.json();
			body.message;
			return HttpResponse.json({
				message: "메시지를 받았어요!",
			});

			//     const stream = new ReadableStream({
			// 			start(controller) {
			// 				controller.enqueue(
			// 					encoder.encode(
			// 						`event:assistant-answers\ndata:{"message": "안녕하세요! 저는 버블리입니다."}\n\n`,
			// 					),
			// 				);
			// 				// controller.close();
			// 			},
			// 		});

			// 		return new HttpResponse(stream, {
			// 			headers: {
			// 				"content-type": "text/event-stream",
			// 				"cache-control": "no-cache",
			// 				connection: "keep-alive",
			// 			},
			// 		});
		},
	),
];
