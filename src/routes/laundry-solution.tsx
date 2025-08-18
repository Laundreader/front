import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createLaundrySolution } from "@/entities/laundry/api";
import { AiBadge } from "@/components/ai-badge";
import { Chip } from "@/components/chip";
import CloseIcon from "@/assets/icons/close.svg?react";
import { overlay } from "overlay-kit";
import LaundryBasketConfettiImg from "@/assets/images/laundry-basket-confetti.png";
import BubbleBgImg from "@/assets/images/bubble-bg.png";
import { Toast } from "@/components/toast";
import LaundryBasketErrorImg from "@/assets/images/laundry-basket-error.png";
import { useTempLaundry } from "@/entities/laundry/store/temp";
import { laundryStore } from "@/entities/laundry/store/persist";
import { cn } from "@/lib/utils";

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
	const tempLaundry = useTempLaundry();
	const laundry = tempLaundry.state;

	if (laundry === null) {
		return <Navigate to="/label-analysis" replace />;
	}

	const [isSaved, setIsSaved] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<
		(typeof CATEGORIES)[number]
	>(CATEGORIES[0]);

	const queryClient = useQueryClient();
	const { data: solutions } = useSuspenseQuery({
		queryKey: ["laundry-solution"],
		queryFn: async () => createLaundrySolution({ laundry }),
	});
	const addLaundryMutation = useMutation({
		mutationFn: async () => {
			const id = await laundryStore.add({
				...laundry,
				solutions,
			});

			return id;
		},
		onMutate: () => {
			overlay.open(
				({ isOpen, close }) => (
					<Toast
						img={LaundryBasketConfettiImg}
						title="빨래바구니에 담는 중..."
						body="잠시만 기다려주세요"
						close={close}
						isOpen={isOpen}
					/>
				),
				{ overlayId: "add-to-basket-toast" },
			);
		},
		onSuccess: async () => {
			queryClient.invalidateQueries({ queryKey: ["laundryBasket"] });
			overlay.unmount("add-to-basket-toast");
			overlay.open(({ isOpen, close }) => (
				<Toast
					img={LaundryBasketConfettiImg}
					title="빨랫감이 잘 담겼어요!"
					body="한 번에 세탁할 때 해결책을 알려줄게요"
					close={close}
					isOpen={isOpen}
					timeout={1500}
				/>
			));

			setIsSaved(true);
		},
		onError: () => {
			overlay.unmount("add-to-basket-toast");
			overlay.open(({ isOpen, close }) => (
				<Toast
					img={LaundryBasketErrorImg}
					title="빨래바구니에 담지 못했어요"
					body="잠시 문제가 생겼어요. 다시 넣어주세요!"
					close={close}
					isOpen={isOpen}
					timeout={1500}
				/>
			));
		},
	});

	const currentSolution = solutions.find(
		(solution) => solution.name === selectedCategory,
	);

	useEffect(() => {
		return () => {
			tempLaundry.clear();
			queryClient.removeQueries({
				queryKey: ["laundry-solution"],
				exact: true,
			});
		};
	}, []);

	return (
		<div
			style={{ backgroundImage: `url(${BubbleBgImg})` }}
			className="flex min-h-dvh flex-col bg-light-gray-1 bg-cover bg-no-repeat pt-[24px]"
		>
			<header className="flex px-[16px]">
				<Link to="/" className="ml-auto">
					<CloseIcon />
				</Link>
			</header>

			<h1 className="mb-[32px] px-[16px] text-title-2 font-semibold text-black">
				<p>띵동!</p>
				<p>딱 맞는 세~탁 해결책이 도착했어요</p>
			</h1>

			<div className="grow rounded-t-[48px] bg-white/50 px-[16px] pt-[24px] pb-[36px]">
				<div className="mx-auto w-full max-w-[393px] grow">
					<h2 className="mb-[24px] ml-[8px] flex items-center gap-[10px] text-subhead font-medium text-black-2">
						세탁 메뉴얼
						<AiBadge />
					</h2>

					<div className="mb-[12px] flex flex-col gap-[18px]">
						<section className="rounded-[12px] bg-white p-[24px]">
							<div className="mb-[12px] flex justify-center gap-[12px]">
								{laundry.image?.label?.data && (
									<img
										src={laundry.image.label.data}
										className="size-[72px] rounded-[12px] object-cover"
									/>
								)}
								{laundry.image?.clothes?.data && (
									<img
										src={laundry.image.clothes.data}
										className="size-[72px] rounded-[12px] object-cover"
									/>
								)}
							</div>
							<p className="mb-[12px] text-center">
								이 세탁물의 소재는 {(laundry.materials ?? []).join(", ")}
								이에요
							</p>
							<div className="flex items-center justify-center gap-[8px]">
								{laundry.color && (
									<span className="rounded-[4px] bg-label-yellow p-[4px] text-caption font-medium text-[#e9af32]">
										{laundry.color}
									</span>
								)}
								{laundry.hasPrintOrTrims && (
									<span className="rounded-[4px] bg-label-green p-[4px] text-caption font-medium text-[#76c76f]">
										프린트나 장식이 있어요
									</span>
								)}
							</div>
						</section>

						<section className="rounded-[12px] bg-white p-[24px]">
							<ul className="mb-[24px] scrollbar-hidden flex items-center justify-between gap-2 overflow-x-auto">
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
							<h2 className="mb-[18px] text-subhead font-semibold text-dark-gray-1">
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

				<div className="mx-auto mt-[88px] w-full max-w-[393px]">
					{isSaved ? (
						<Link
							to="/laundry-basket"
							className="flex h-[56px] w-full items-center justify-center rounded-[10px] bg-main-blue-1 text-subhead font-medium text-white"
						>
							빨래바구니로 가기
						</Link>
					) : (
						<div className="relative">
							<div className="absolute bottom-full left-1/2 w-full -translate-x-1/2">
								<p
									className={cn(
										"relative mx-auto mb-[8px] w-fit rounded-[8px] bg-deep-blue px-[12px] py-[8px] text-caption font-medium text-white",
										"after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:translate-y-full after:border-[4px] after:border-transparent after:border-t-deep-blue",
									)}
								>
									함께 세탁해도 되는지 확인해보세요
								</p>
							</div>

							<button
								onClick={() => addLaundryMutation.mutate()}
								disabled={addLaundryMutation.isPending}
								className="h-[56px] w-full rounded-[10px] bg-main-blue-1 text-subhead font-medium text-white disabled:opacity-60"
							>
								빨래바구니에 담을래요
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
