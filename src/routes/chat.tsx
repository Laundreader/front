import { useEffect, useMemo, useRef, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	stripSearchParams,
	useBlocker,
	useNavigate,
} from "@tanstack/react-router";
import Markdown from "markdown-to-jsx";
import { overlay } from "overlay-kit";
import ArrowUpIcon from "@/assets/icons/arrow-up.svg?react";
import ChevronDownIcon from "@/assets/icons/chevron-down.svg?react";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";
import ChevronUpIcon from "@/assets/icons/chevron-up.svg?react";
import CloseIcon from "@/assets/icons/close.svg?react";
import PlusIcon from "@/assets/icons/plus.svg?react";
import BubblyImg from "@/assets/images/bubbly.avif";
import ChatBgImg from "@/assets/images/chat-bg.avif";
import LaundreaderCharactreSweatImg from "@/assets/images/laundreader-character-sweat.avif";
import { LaundryListModal } from "@/components/laundry-list-modal";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { createChatSessionId } from "@/entities/chat/api";
import { cn } from "@/lib/utils";
import { API_URL } from "@/shared/api";

import type { ComponentProps, ReactNode } from "react";
import type { Laundry } from "@/entities/laundry/model";
import { laundryIdSearchSchema } from "./-schema";
import { laundryQueryOptions } from "@/features/laundry/api";

type AssistantAnswer = {
	message: string;
};

type AssistantSuggestions = {
	message: string;
	suggestions: Array<string>;
};

type Message =
	| {
			role: "assistant";
			type: "answer" | "suggestions";
			content: string;
	  }
	| {
			role: "user";
			type: "text" | "image";
			content: string;
	  };

export const Route = createFileRoute("/chat")({
	validateSearch: laundryIdSearchSchema,
	search: {
		middlewares: [stripSearchParams({ laundryId: 0 })],
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { laundryId } = Route.useSearch();
	const navigate = useNavigate();

	const [messages, setMessages] = useState<Array<Message>>([]);
	const [suggestions, setSuggestions] = useState<Array<string>>([]);
	const [inputValue, setInputValue] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [selectedLaundry, setSelectedLaundry] = useState<Laundry | null>(null);

	const abortControllerRef = useRef<AbortController | null>(null);
	const scrollableRef = useRef<HTMLDivElement>(null);
	const randomSessionIdQueryKeyRef = useRef(crypto.randomUUID());
	const randomSessionIdQueryKey = randomSessionIdQueryKeyRef.current;

	const laundryQuery = useQuery({
		...laundryQueryOptions(laundryId),
		enabled: !!laundryId,
	});

	if (laundryQuery.data) {
		navigate({ to: ".", search: {}, replace: true });
	}

	const sessionIdQuery = useQuery({
		queryKey: [randomSessionIdQueryKey],
		queryFn: createChatSessionId,
	});

	const sessionId = sessionIdQuery.data;
	const streamUrl = useMemo(() => {
		return sessionId ? `${API_URL}/chat/stream/${sessionId}` : null;
	}, [sessionId]);

	const canInputMessage = sessionId !== undefined && isSending === false;
	const canSendMessage =
		sessionId !== undefined && inputValue !== "" && isSending === false;

	const today = new Intl.DateTimeFormat("ko", { dateStyle: "full" }).format(
		new Date(),
	);

	useEffect(() => {
		if (
			laundryQuery.data &&
			(selectedLaundry === null || selectedLaundry.id !== laundryQuery.data.id)
		) {
			setSelectedLaundry(laundryQuery.data);
		}
	}, [laundryId, laundryQuery.isSuccess, laundryQuery.data, selectedLaundry]);

	async function sendMessage(message: string) {
		if (sessionId === undefined || streamUrl === null) {
			return;
		}

		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		abortControllerRef.current = new AbortController();

		await fetchEventSource(streamUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message }),
			signal: abortControllerRef.current.signal,

			onmessage(evtSrcMsg) {
				if (evtSrcMsg.event === "assistant-answers") {
					const { message } = JSON.parse(evtSrcMsg.data) as AssistantAnswer;

					const messages: Array<Message> = splitMessageByEmoji(message).map(
						(msg) => ({
							role: "assistant",
							type: "answer",
							content: msg,
						}),
					);

					setMessages((prev) => [...prev, ...messages]);

					return;
				}

				if (evtSrcMsg.event === "assistant-suggestions") {
					const { message, suggestions: newSuggestions } = JSON.parse(
						evtSrcMsg.data,
					) as AssistantSuggestions;

					setMessages((prev) => [
						...prev,
						{
							role: "assistant",
							type: "suggestions",
							content: message,
						},
					]);

					setSuggestions(newSuggestions);
					setIsSending(false);

					if (abortControllerRef.current) {
						abortControllerRef.current.abort();
						abortControllerRef.current = null;
					}

					return;
				}
			},

			onclose() {
				setIsSending(false);
				abortControllerRef.current = null;
			},

			onerror(err) {
				console.error("SSE error:", err);
				if (abortControllerRef.current) {
					abortControllerRef.current.abort();
					abortControllerRef.current = null;
				}
				setIsSending(false);
			},
		});
	}

	async function triggerSendMessage(messageRaw?: string) {
		if (streamUrl === null) {
			return;
		}

		setIsSending(true);

		const textMessage = (messageRaw ?? inputValue).trim();
		const updatedMessages = [...messages];
		let messageToSend: string;

		if (selectedLaundry) {
			// 사용자가 세탁물도 같이 보낼 때,
			// 클라에는 이미지 데이터&일반 텍스트 메시지 두 개
			// 서버로는 세탁물 데이터(이미지 제외)와 일반 텍스트를 합친 메시지 하나

			const { image, ...laundryData } = selectedLaundry;
			const imageData = image.clothes?.data ?? image.label.data;

			messageToSend =
				"```json" + JSON.stringify(laundryData) + "```\n\n" + textMessage;

			updatedMessages.push({
				role: "user",
				type: "image",
				content: imageData,
			});
			updatedMessages.push({
				role: "user",
				type: "text",
				content: textMessage,
			});
		} else {
			messageToSend = textMessage;
			updatedMessages.push({
				role: "user",
				type: "text",
				content: textMessage,
			});
		}

		setInputValue("");
		setSuggestions([]);
		setSelectedLaundry(null);

		setMessages(updatedMessages);
		await sendMessage(messageToSend);
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

	useEffect(() => {
		scrollableRef.current?.scrollTo({
			top: scrollableRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, [messages]);

	useBlocker({
		shouldBlockFn: async () => {
			if (messages.length === 0) {
				return false;
			}

			const shouldBlock = await overlay.openAsync<boolean>(
				({ isOpen, close }) => {
					return (
						<ConfirmDialog
							img={LaundreaderCharactreSweatImg}
							title="대화를 종료하시겠어요?"
							body="페이지를 떠나면, 채팅한 내용은 모두 사라져요."
							isOpen={isOpen}
							cancel={() => close(true)}
							confirm={() => close(false)}
						/>
					);
				},
			);

			return shouldBlock;
		},
	});

	const [isOpenQuestionPreset, setIsOpenQuestionPreset] = useState(false);
	const [questionCategory, setQuestionCategory] = useState<
		"urgent" | "laundry" | "drying" | "detergent" | "fabric" | "damage"
	>("urgent");
	const defaultQuestions = Object.entries(defaultQuestion);
	type DefaulQuestion = typeof defaultQuestion;

	function handleClickCategory(category: keyof DefaulQuestion) {
		setQuestionCategory(category);
		if (isOpenQuestionPreset === false) {
			setIsOpenQuestionPreset(true);
		}
	}

	function toggleQuestionPreset() {
		setIsOpenQuestionPreset((prev) => !prev);
	}

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
				{/*
					MARK: 오늘 날짜
				*/}
				<p className="mx-auto w-fit rounded-full bg-white/50 px-3 py-2 text-body-2 font-medium text-gray-1">
					{today}
				</p>

				{/* 
					MARK: 버블리 안내 메시지
				*/}
				<div className="my-2.5 flex items-center gap-3">
					<div className="size-14 rounded-full bg-[#c2dcf9] p-2.5">
						<img src={BubblyImg} role="presentation" alt="" />
					</div>
					<span className="text-body-1 font-medium text-deep-blue">버블리</span>
				</div>
				{sessionIdQuery.isLoading && (
					<MessageContainer role="assistant">
						<IncomingMessage />
					</MessageContainer>
				)}
				{sessionIdQuery.isError && (
					<MessageContainer role="assistant">
						<p>
							일시적인 오류로 챗봇 연결에 실패했어요. 잠시 후 다시 시도해주세요.
						</p>
					</MessageContainer>
				)}
				{sessionId && (
					<div className="space-y-3">
						<MessageContainer role="assistant">
							<p>반가워요! 저는 런드리더의 세탁도우미 버블리예요.</p>
						</MessageContainer>
						<MessageContainer role="assistant">
							<p>세탁에 관해서 궁금한 게 있다면 무엇이든지 물어봐주세요!</p>
						</MessageContainer>
					</div>
				)}

				{/*
					MARK: 채팅 내역
				*/}
				<ul className="flex flex-col gap-3 pt-3">
					{messages.map((message, i) => (
						<li key={i}>
							{message.role === "user" && message.type === "image" ? (
								<img
									src={message.content}
									alt="사용자 첨부 이미지"
									className="mt-2 h-auto w-1/2 min-w-32 justify-self-end rounded-xl object-cover"
								/>
							) : (
								<MessageContainer
									role={message.role}
									className={
										messages[i - 1]?.role !== message.role ? "mt-3" : ""
									}
								>
									<Markdown
										className="text-body-1"
										options={{
											forceWrapper: true,
											wrapper: "div",
											overrides: {
												pre: {
													component: "div",
													props: { className: "contents" },
												},
												code: {
													component: "div",
													props: { className: "contents" },
												},
											},
										}}
									>
										{message.content}
									</Markdown>
								</MessageContainer>
							)}
						</li>
					))}
				</ul>

				{/* 
					MARK: 제안 버튼 목록
				*/}
				{suggestions.length > 0 && (
					<ul className="mt-3 flex flex-wrap gap-x-1 gap-y-2">
						{suggestions
							.filter((suggestion) => suggestion.trim().length > 0)
							.map((suggestion, i) => (
								<li key={`${suggestion}-${i}`} className="shrink-0">
									<SuggestionButton
										onClick={() => {
											triggerSendMessage(suggestion);
										}}
									>
										{suggestion}
									</SuggestionButton>
								</li>
							))}
						<li>
							<SuggestionButton
								onClick={() => {
									navigate({ to: "/label-analysis" });
								}}
							>
								라벨 스캔으로 확인하기
							</SuggestionButton>
						</li>
					</ul>
				)}

				{isSending && (
					<MessageContainer role="assistant" className="mt-3">
						<IncomingMessage />
					</MessageContainer>
				)}
			</main>

			{/*
				MARK: 입력창
			*/}

			<footer className="absolute bottom-0 w-full bg-white/70 shadow-[0_0_20px_rgba(0,0,0,0.05)]">
				{messages.length === 0 && (
					<section
						className={cn(
							"absolute right-0 bottom-full flex flex-col gap-4 overflow-hidden rounded-t-3xl px-4 pt-6 transition-[max-height,background-color] duration-300",
							isOpenQuestionPreset
								? "max-h-screen bg-white/70"
								: "max-h-17 bg-transparent",
						)}
					>
						{/* 칩 버튼 */}
						<div className="flex gap-1">
							<ul className="flex flex-wrap gap-x-1 gap-y-2 text-main-blue-1">
								{defaultQuestions.map(([category, info]) => {
									return (
										<li key={category} className="contents">
											<button
												onClick={() =>
													handleClickCategory(category as keyof DefaulQuestion)
												}
												className={cn(
													"shrink-0 rounded-full px-2 py-1.5 text-body-2 font-medium transition-[color,background-color,border] duration-300",
													isOpenQuestionPreset === false ||
														questionCategory !== category
														? "border border-main-blue-3 bg-gray-bluegray-1 text-main-blue-1"
														: "border-none bg-main-blue-1 text-gray-bluegray-1",
												)}
											>
												{info.label}
											</button>
										</li>
									);
								})}
							</ul>
							<button
								onClick={toggleQuestionPreset}
								className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black-2"
							>
								{isOpenQuestionPreset ? <ChevronDownIcon /> : <ChevronUpIcon />}
							</button>
						</div>

						{/* 질문 목록 */}
						<ul className="scrollbar-hidden flex flex-col gap-3 overflow-y-auto">
							{defaultQuestion[questionCategory].questions.map(
								(question, i) => (
									<li key={`${question}-${i}`}>
										<button
											onClick={() => {
												triggerSendMessage(question);
												setIsOpenQuestionPreset(false);
											}}
											className="w-full rounded-xl bg-white p-3 text-left text-body-1 font-medium text-dark-gray-2"
										>
											{question}
										</button>
									</li>
								),
							)}
						</ul>
					</section>
				)}

				<form
					onSubmit={(e) => {
						e.preventDefault();
						triggerSendMessage();
					}}
					className="flex w-full items-center gap-2 p-4"
				>
					<Dialog>
						<DialogTrigger
							type="button"
							aria-label="옵션"
							disabled={canInputMessage === false}
							onClick={handleClickOptionButton}
							className="flex size-9 shrink-0 items-center justify-center rounded-full bg-deep-blue text-white"
						>
							<PlusIcon className="text-white" />
						</DialogTrigger>
					</Dialog>

					<div className="flex h-11 grow items-center rounded-xl border border-gray-bluegray-2 bg-white p-2">
						<input
							type="text"
							name="user-message"
							placeholder={
								sessionIdQuery.isLoading ? "연결 중…" : "무엇이든 물어보세요"
							}
							value={inputValue}
							disabled={canInputMessage === false}
							onChange={(e) => setInputValue(e.target.value)}
							className="w-0 grow pr-2.5 pl-0.5 text-[1rem] font-medium text-black outline-none placeholder:text-gray-1"
						/>

						<button
							type="submit"
							aria-label="전송"
							className="flex size-7 items-center justify-center rounded-full bg-gray-1"
							disabled={canSendMessage === false}
						>
							<ArrowUpIcon className="text-white" />
						</button>
					</div>
				</form>

				{/* 첨부한 세탁물 썸네일 */}
				{selectedLaundry && (
					<div className="absolute right-1 bottom-20 flex max-w-1/2 flex-col items-center justify-center gap-2">
						<img
							src={
								selectedLaundry?.image.clothes?.data ??
								selectedLaundry?.image.label.data
							}
							alt=""
							className="h-auto w-full rounded-xl"
						/>
						<button
							onClick={() => {
								setSelectedLaundry(null);
							}}
							className="absolute -top-2 -right-1 flex items-center justify-center rounded-full bg-white p-1"
						>
							<CloseIcon className="size-4 text-red" />
							<span className="sr-only">세탁물 첨부 취소</span>
						</button>
					</div>
				)}
			</footer>
		</div>
	);
}

const IncomingMessage = () => {
	return (
		<div
			className="flex w-fit items-center gap-2 py-2"
			role="status"
			aria-label="버블리가 입력 중"
		>
			<div
				className="size-2 animate-dot-pulse rounded-full bg-gray-2"
				style={{ animationDelay: "0ms" }}
			/>
			<div
				className="size-2 animate-dot-pulse rounded-full bg-gray-2"
				style={{ animationDelay: "200ms" }}
			/>
			<div
				className="size-2 animate-dot-pulse rounded-full bg-gray-2"
				style={{ animationDelay: "400ms" }}
			/>
		</div>
	);
};

type MessageContainerProps = {
	role: "user" | "assistant";
	children: ReactNode;
	className?: string;
};

const MessageContainer = ({
	role,
	children,
	className,
}: MessageContainerProps) => {
	const containerStyle = {
		user: "ml-auto pl-8",
		assistant: "mr-auto pr-8",
	};

	const contentStyle = {
		user: "justify-self-end rounded-tr-none bg-main-blue-1 text-bg ml-auto",
		assistant:
			"justify-self-start rounded-tl-none bg-white text-dark-gray-1 mr-auto",
	};

	return (
		<div className={cn(containerStyle[role], className)}>
			<div className={cn("w-fit rounded-xl px-4 py-3", contentStyle[role])}>
				{children}
			</div>
		</div>
	);
};

const SuggestionButton = ({ onClick, children }: ComponentProps<"button">) => {
	return (
		<div className="w-fit rounded-full bg-linear-160 from-[#5697FF] to-[#B780FF] p-px">
			<button
				onClick={onClick}
				className="rounded-full bg-white px-3 py-1.5 text-purple"
			>
				{children}
			</button>
		</div>
	);
};

function splitMessageByEmoji(message: string): Array<string> {
	// .?! + 공백 + 이모지를 경계로 분리
	const regex = /([.?!]\s\p{Extended_Pictographic}+)/u;

	return message.split(regex).reduce((acc, cur, i) => {
		if (i === 0) {
			acc.push(cur);
			return acc;
		}

		if (i % 2 === 1) {
			// 캡처된 경계 토큰을 직전 조각과 합치기
			acc[acc.length - 1] += cur;
		} else if (cur.length > 0) {
			acc.push(cur);
		}

		return acc;
	}, [] as Array<string>);
}

const defaultQuestion = {
	urgent: {
		label: "응급 상황 대처",
		questions: [
			"이염(물빠짐) 처리가 궁금해요.",
			"얼룩 제거(커피, 와인, 화장품 등) 방법이 궁금해요.",
			"옷 줄었을 때 복원 방법이 궁금해요.",
		],
	},
	laundry: {
		label: "세탁 방법 안내",
		questions: [
			"소재별 세탁법(울, 면, 실크, 합성섬유 등)이 궁금해요.",
			"표백제/세제 사용 가능 여부가 궁금해요.",
			"드라이클리닝 필요 여부가 궁금해요.",
		],
	},
	drying: {
		label: "건조 & 보관",
		questions: [
			"건조기 사용 가능 여부가 궁금해요.",
			"자연 건조 요령(그늘, 직사광선 주의 등)이 궁금해요.",
			"보관할 때 주의점(곰팡이, 옷걸이 등)이 궁금해요.",
		],
	},
	detergent: {
		label: "세제 & 관리 팁",
		questions: [
			"어떤 세제가 적합한지(중성세제, 산소계 표백제 등) 궁금해요.",
			"섬유유연제 사용 여부가 궁금해요.",
			"생활 꿀팁(냄새 제거, 색상 유지)이 궁금해요.",
		],
	},
	fabric: {
		label: "옷감별 문제 해결",
		questions: [
			"라벨이 없을 때 소재 구분하는 방법이 궁금해요.",
			"헷갈리는 소재(폴리/레이온, 울/아크릴) 구분 팁이 궁금해요.",
		],
	},
	damage: {
		label: "의류 손상 방지",
		questions: [
			"지퍼/단추 때문에 다른 옷이 손상되지 않게 하는 방법이 궁금해요.",
			"프린팅 옷 오래가게 세탁하는 팁이 궁금해요.",
			"니트 보풀 방지 팁이 궁금해요.",
		],
	},
} as const;
