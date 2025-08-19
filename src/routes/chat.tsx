import { useEffect, useMemo, useRef, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { createFileRoute, Link } from "@tanstack/react-router";
import { API_URL } from "@/shared/api";
import { createChatSessionId } from "@/entities/chat/api";
import { useQuery } from "@tanstack/react-query";
import ArrowUpIcon from "@/assets/icons/arrow-up.svg?react";
import { cn } from "@/lib/utils";
import PlusIcon from "@/assets/icons/plus.svg?react";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";
import ChatBgImg from "@/assets/images/chat-bg.png";
import BubblyImg from "@/assets/images/bubbly.png";
import Markdown from "markdown-to-jsx";
import { overlay } from "overlay-kit";
import { LaundryListModal } from "@/components/laundry-list-modal";
import type { Laundry } from "@/entities/laundry/model";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

type AssistantAnswerEvent = {
	message: string;
};

type AssistantSuggestionsEvent = {
	message: string;
	suggestions: Array<string>;
};

type MessageType = "answer" | "suggestions";
type Message =
	| {
			role: "assistant";
			id: string;
			type: MessageType;
			content: string;
	  }
	| {
			role: "user";
			id: string;
			content: string;
	  };

export const Route = createFileRoute("/chat")({
	component: RouteComponent,
});

function RouteComponent() {
	const [messages, setMessages] = useState<Array<Message>>([
		{
			role: "assistant",
			id: crypto.randomUUID(),
			type: "answer",
			content: "반가워요! 저는 런드리더의 세탁도우미 버블리예요.",
		},
		{
			role: "assistant",
			id: crypto.randomUUID(),
			type: "answer",
			content: "세탁에 관해서 궁금한 게 있다면 무엇이든지 물어봐주세요!",
		},
	]);
	const [suggestions, setSuggestions] = useState<Array<string>>([]);
	const [inputValue, setInputValue] = useState("");
	const [isSending, setIsSending] = useState(false);
	const abortControllerRef = useRef<AbortController | null>(null);
	const scrollableRef = useRef<HTMLDivElement>(null);
	const [_selectedLaundry, setSelectedLaundry] = useState<Laundry | null>(null);
	const sessionIdQuery = useQuery({
		queryKey: [],
		queryFn: createChatSessionId,
	});

	const sessionId = sessionIdQuery.data;

	const streamUrl = useMemo(() => {
		return sessionId ? `${API_URL}/chat/stream/${sessionId}` : null;
	}, [sessionId]);

	function sendMessage(message: string) {
		if (sessionId === undefined || streamUrl === null) {
			return;
		}

		fetchEventSource(streamUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message }),
			signal: abortControllerRef.current?.signal,

			onmessage(ev) {
				if (ev.event === "assistant-answers") {
					const data = JSON.parse(ev.data) as AssistantAnswerEvent;
					console.log("answers", data.message);
					setMessages((prev) => [
						...prev,
						{
							role: "assistant",
							id: crypto.randomUUID(),
							type: "answer",
							content: data.message,
						},
					]);

					return;
				}

				if (ev.event === "assistant-suggestions") {
					const data = JSON.parse(ev.data) as AssistantSuggestionsEvent;
					console.log("suggestions", data.message);
					setMessages((prev) => [
						...prev,
						{
							role: "assistant",
							id: crypto.randomUUID(),
							type: "suggestions",
							content: data.message,
						},
					]);
					setSuggestions(data.suggestions ?? []);

					return;
				}
			},

			onerror(err) {
				console.error("SSE error:", err);
				if (abortControllerRef.current) {
					abortControllerRef.current.abort();
					abortControllerRef.current = null;
				}
			},
		});
	}

	console.log(messages);

	function triggerSendMessage(messageRaw?: string) {
		setIsSending(true);
		setMessages((prev) => [
			...prev,
			{
				role: "user",
				id: crypto.randomUUID(),
				content: messageRaw ?? inputValue,
			},
		]);
		setInputValue("");

		const msg = (messageRaw ?? inputValue).trim();
		console.log({ msg });
		if (streamUrl === null || msg === "") {
			return;
		}

		try {
			sendMessage(msg);
			if (messageRaw === undefined) {
				setInputValue("");
			}
		} finally {
			setIsSending(false);
		}
	}

	function handleClickOptionButton() {
		overlay.open(({ isOpen, close }) => {
			return (
				<LaundryListModal
					isOpen={isOpen}
					close={close}
					setSelectedLaundry={setSelectedLaundry}
				/>
			);
		});
	}

	const canInputMessage = sessionId && isSending === false;
	const canSendMessage = sessionId && inputValue !== "" && isSending === false;

	useEffect(() => {
		console.log("scrolling to last message");
		scrollableRef.current?.scrollTo({
			top: scrollableRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, [messages]);

	return (
		<div
			style={{ backgroundImage: `url(${ChatBgImg})` }}
			className="relative h-dvh overflow-y-hidden bg-center bg-no-repeat"
		>
			<header className="absolute top-0 grid w-full grid-cols-[1fr_auto_1fr] items-center bg-white/70 px-4 py-3 backdrop-blur-md">
				<Link to=".." className="w-fit">
					<ChevronLeftIcon />
				</Link>
				<h1 className="text-body-1 font-medium text-dark-gray-1">
					AI 세탁 도우미 버블리
				</h1>
			</header>

			<main
				ref={scrollableRef}
				className="scrollbar-hidden max-h-dvh overflow-y-auto px-4 pt-15 pb-22"
			>
				{sessionId === undefined ? (
					<p>
						{sessionIdQuery.isLoading && "연결 중…"}
						{sessionIdQuery.isError && "연결에 실패했어요. 새로고침 해주세요."}
					</p>
				) : (
					<>
						<p className="mx-auto w-fit rounded-full bg-white/50 px-3 py-2 text-body-2 font-medium text-gray-1">
							{new Intl.DateTimeFormat("ko", { dateStyle: "full" }).format(
								new Date(),
							)}
						</p>
						<div className="my-2.5 flex items-center gap-3">
							<div className="size-14 rounded-full bg-[#c2dcf9] p-2.5">
								<img src={BubblyImg} role="presentation" alt="" />
							</div>
							<span className="text-body-1 font-medium text-deep-blue">
								버블리
							</span>
						</div>

						<ul className="flex flex-col gap-3">
							{messages.map((message) => (
								<li key={message.id}>
									<p
										className={cn(
											"w-fit rounded-xl px-4 py-3 text-body-1",
											message.role === "user"
												? "justify-self-end rounded-tr-none bg-main-blue-1 text-bg"
												: "justify-self-start rounded-tl-none bg-white text-dark-gray-1",
										)}
									>
										<Markdown>{message.content}</Markdown>
									</p>
								</li>
							))}
						</ul>

						{isSending && (
							<div className="w-fit justify-self-start rounded-xl rounded-tl-none bg-white px-4 py-3 text-body-1 text-dark-gray-1">
								<div className="size-2 bg-gray-1"></div>
								<div className="size-2 bg-gray-2"></div>
								<div className="size-2 bg-gray-2"></div>
							</div>
						)}
					</>
				)}

				{suggestions.length > 0 && (
					<ul className="mt-3 scrollbar-hidden flex gap-2 overflow-x-auto">
						{suggestions.map((suggestion, i) => (
							<li key={`${suggestion}-${i}`} className="shrink-0">
								<div className="w-fit rounded-full bg-linear-160 from-[#5697FF] to-[#B780FF] p-[1px]">
									<button
										onClick={() => triggerSendMessage(suggestion)}
										className="rounded-full bg-white px-3 py-2 text-purple"
									>
										{suggestion}
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</main>

			<footer className="absolute bottom-0 w-full bg-white/70 p-4">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						triggerSendMessage();
					}}
					className="flex items-center gap-[8px]"
				>
					<Dialog>
						<DialogTrigger
							type="button"
							aria-label="옵션"
							onClick={handleClickOptionButton}
							className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-deep-blue text-white"
						>
							<PlusIcon className="text-white" />
						</DialogTrigger>
					</Dialog>

					<div className="flex h-[44px] grow items-center rounded-[12px] border border-gray-bluegray-2 bg-white p-[8px]">
						<input
							type="text"
							placeholder={
								sessionIdQuery.isLoading ? "연결 중…" : "무엇이든 물어보세요"
							}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							disabled={canInputMessage === false}
							className="flex-1 pr-2.5 pl-0.5 text-body-1 font-medium text-black outline-none placeholder:text-gray-1"
						/>

						<button
							type="submit"
							aria-label="전송"
							className="flex size-[28px] items-center justify-center rounded-full bg-gray-1 disabled:cursor-not-allowed"
							disabled={canSendMessage === false}
						>
							<ArrowUpIcon className="h-6 w-6 text-white" />
						</button>
					</div>
				</form>
			</footer>
		</div>
	);
}
