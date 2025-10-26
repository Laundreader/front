import { useEffect, useState } from "react";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import {
	Navigate,
	Link,
	createFileRoute,
	useNavigate,
} from "@tanstack/react-router";
import { overlay } from "overlay-kit";
import CloseIcon from "@/assets/icons/close.svg?react";
import BubbleBgImg from "@/assets/images/bubble-bg.avif";
import ChatBotLinkButtonImg from "@/assets/images/chat-bot-link-button.avif";
import { AiBadge } from "@/components/ai-badge";
import { Chip } from "@/components/chip";
import { Popup } from "@/components/popup";
import { createLaundrySolution } from "@/entities/laundry/api";
import { laundryStore } from "@/entities/laundry/store/persist";
import { useTempLaundry } from "@/entities/laundry/store/temp";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import BlueTShirtImg from "@/assets/images/blue-t-shirt.avif";

import type { ComponentProps } from "react";
import type { Laundry } from "@/entities/laundry/model";

export const Route = createFileRoute("/laundry-solution")({
	component: RouteComponent,
});

const CATEGORIES = ["wash", "dry", "etc"] as const;
const CATEGORY_CONTENT = {
	wash: { title: "🧺 세탁", subtitle: "주요 세탁 방법" },
	dry: { title: "💨 탈수/건조", subtitle: "주요 탈수/건조 방법" },
	etc: { title: "🫧 그외", subtitle: "주의사항" },
} as const;

function RouteComponent() {
	const navigate = useNavigate();

	const tempLaundry = useTempLaundry();
	if (tempLaundry.state === null) {
		return <Navigate to="/label-analysis" replace />;
	}

	const laundry = tempLaundry.state;
	const { image, ...laundryWithoutImage } = laundry;
	const { didConfirmAnalysis, ...laundryToAdd } = laundry;

	const [savedId, setSavedId] = useState<Laundry["id"] | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<
		(typeof CATEGORIES)[number]
	>(CATEGORIES[0]);

	const queryClient = useQueryClient();
	const { data: solutions } = useSuspenseQuery({
		queryKey: ["laundry-solution"],
		queryFn: () => createLaundrySolution({ laundry: laundryWithoutImage }),
	});
	const addLaundryMutation = useMutation({
		mutationFn: async () => {
			const id = await laundryStore.add({
				...laundryToAdd,
				solutions,
			});

			return id;
		},
		onMutate: () => {
			overlay.open(
				({ isOpen, close }) => (
					<Popup variant="pending" close={close} isOpen={isOpen} />
				),
				{ overlayId: "add-to-basket-popup" },
			);
		},
		onSuccess: async (laundryId) => {
			queryClient.invalidateQueries({ queryKey: ["laundryBasket"] });
			overlay.unmount("add-to-basket-popup");
			overlay.open(({ isOpen, close }) => (
				<Popup close={close} isOpen={isOpen} variant="success" timeout={1500} />
			));

			setSavedId(laundryId);
		},
		onError: () => {
			overlay.unmount("add-to-basket-popup");
			overlay.open(({ isOpen, close }) => (
				<Popup variant="fail" close={close} isOpen={isOpen} timeout={1500} />
			));
		},
	});

	const currentSolution = solutions.find(
		(solution) => solution.name === selectedCategory,
	);

	async function handleClickChatBot() {
		let laundryId: number;
		if (savedId) {
			laundryId = savedId;
		} else {
			laundryId = await addLaundryMutation.mutateAsync();
			setSavedId(laundryId);
		}
		overlay.unmountAll();
		navigate({ to: "/chat", search: { laundryId } });
	}

	useEffect(() => {
		return () => {
			if (savedId) {
				tempLaundry.clear();
				queryClient.removeQueries({
					queryKey: ["laundry-solution"],
					exact: true,
				});
			}
		};
	}, [savedId]);

	return (
		<div
			style={{ backgroundImage: `url(${BubbleBgImg})` }}
			className="flex min-h-dvh flex-col bg-cover bg-no-repeat p-4"
		>
			<header className="flex justify-end">
				<Link to="/">
					<CloseIcon />
				</Link>
			</header>

			<h1 className="mb-8 text-title-2 font-semibold break-keep text-black">
				<p>띵동!</p>
				<p>딱 맞는 세~탁 해결책이 도착했어요</p>
			</h1>

			<div className="-m-4 mt-0 flex grow flex-col rounded-t-[3rem] bg-white/50 p-4 pt-6">
				<div className="mx-auto w-full max-w-[393px] grow">
					<h2 className="mb-6 ml-2 flex items-center gap-[10px] text-subhead font-medium text-black-2">
						세탁 메뉴얼
						<AiBadge />
					</h2>

					<div className="mb-3 flex flex-col gap-4">
						<section className="rounded-xl bg-white p-6">
							<div className="mb-3 flex justify-center gap-3">
								<img
									src={laundry.image.label?.data ?? BlueTShirtImg}
									className="size-18 rounded-xl object-cover"
								/>
								{laundry.image?.clothes?.data && (
									<img
										src={laundry.image?.clothes?.data ?? BlueTShirtImg}
										className="size-18 rounded-xl object-cover"
									/>
								)}
							</div>
							<p className="mb-3 text-center break-keep">
								이 {laundry.type || "세탁물"}의 소재는
								<br />
								{laundry.materials.length === 0
									? "인식하지 못했어요."
									: laundry.materials.join(", ") + "이에요."}
							</p>
							<div className="flex items-center justify-center gap-2">
								{laundry.color && (
									<span className="rounded-sm bg-label-yellow px-1 py-0.5 text-caption font-medium text-[#f2b83b]">
										{laundry.color}
									</span>
								)}
								{laundry.hasPrintOrTrims && (
									<span className="rounded-sm bg-label-green px-1 py-0.5 text-caption font-medium text-[#76c76f]">
										프린트나 장식이 있어요
									</span>
								)}
							</div>
						</section>

						<section className="rounded-xl bg-white p-6">
							<ul className="mb-6 scrollbar-hidden flex items-center justify-between gap-2 overflow-x-auto">
								{CATEGORIES.map((category) => (
									<li key={category} className="shrink-0">
										<Chip
											isActive={category === selectedCategory}
											onClick={() => setSelectedCategory(category)}
										>
											{CATEGORY_CONTENT[category].title}
										</Chip>
									</li>
								))}
							</ul>
							<h2 className="mb-4 text-subhead font-semibold text-dark-gray-1">
								{CATEGORY_CONTENT[selectedCategory].subtitle}
							</h2>
							<p className="text-body-1 font-medium whitespace-pre-line text-dark-gray-1">
								{currentSolution?.contents}
							</p>
						</section>
					</div>

					<Link
						to="/label-analysis"
						className="mx-auto block w-fit text-body-2 font-medium text-gray-1 underline underline-offset-4"
					>
						다른 빨랫감 세탁법도 궁금하다면?
					</Link>
				</div>

				{/* 
					MARK: 빨래바구니에 담기 / 챗봇에게 물어보기
				*/}
				<div className="relative justify-end">
					<ChatBotLinkButton
						onClick={handleClickChatBot}
						className="absolute right-0 bottom-24"
					/>

					<div className="mx-auto mt-22 w-full max-w-[393px]">
						{savedId ? (
							<Link
								to="/laundry-basket"
								className="flex h-14 w-full items-center justify-center rounded-[10px] bg-main-blue-1 text-subhead font-medium text-white"
							>
								빨래바구니로 가기
							</Link>
						) : (
							<Tooltip>
								<TooltipTrigger>
									<button
										onClick={() => addLaundryMutation.mutate()}
										disabled={addLaundryMutation.isPending}
										className="h-14 w-full rounded-[10px] bg-main-blue-1 text-subhead font-medium text-white disabled:opacity-60"
									>
										빨래바구니에 담을래요
									</button>
								</TooltipTrigger>
								<TooltipContent className="rounded-lg bg-deep-blue fill-deep-blue px-3 py-2">
									<p className="text-caption font-medium text-white">
										함께 세탁해도 되는지 확인해보세요
									</p>
								</TooltipContent>
							</Tooltip>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

const ChatBotLinkButton = ({
	className,
	onClick,
}: ComponentProps<"button">) => {
	return (
		<Tooltip>
			<TooltipTrigger>
				<button
					onClick={onClick}
					className={cn(
						"flex size-16 items-center justify-center rounded-full",
						className,
					)}
				>
					<img src={ChatBotLinkButtonImg} alt="" role="presentation" />
					<span className="sr-only">챗봇에게 물어보기</span>
				</button>
			</TooltipTrigger>
			<TooltipContent
				align="end"
				className="rounded-md bg-purple fill-purple px-2 py-1"
			>
				<p className="text-caption font-semibold text-white">
					더 궁금한 게 있나요?
				</p>
			</TooltipContent>
		</Tooltip>
	);
};
