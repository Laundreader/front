import {
	Link,
	Navigate,
	createFileRoute,
	useNavigate,
} from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { laundryIdSearchSchema } from "./-schema";
import type { Laundry } from "@/entities/laundry/model";
import {
	laundryBasketQueryOptions,
	laundryQueryOptions,
	laundrySolutionQueryOptions,
} from "@/features/laundry/api";
import { AiBadge } from "@/components/ai-badge";
import { Chip } from "@/components/chip";
import CloseIcon from "@/assets/icons/close.svg?react";
import { laundryStore } from "@/idb";

export const Route = createFileRoute("/laundry-solution")({
	validateSearch: laundryIdSearchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const { laundryId } = Route.useSearch();

	const categoryContent = {
		wash: { title: "🧺 세탁", subtitle: "주요 세탁 방법" },
		dry: { title: "💨 탈수/건조", subtitle: "주요 탈수/건조 방법" },
		etc: { title: "🫧 그외", subtitle: "주의사항" },
	} as const;
	const categories = ["wash", "dry", "etc"] as const;

	const [selectedCategory, setSelectedCategory] = useState<
		(typeof categories)[number]
	>(categories[0]);
	const [saving, setSaving] = useState(false);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const {
		data: detail,
		isLoading: isDetailLoading,
		isError: isDetailError,
	} = useQuery(laundryQueryOptions(laundryId));

	// 솔루션
	const {
		data: solution,
		isLoading: isSolutionLoading,
		isError: isSolutionError,
	} = useQuery(laundrySolutionQueryOptions(laundryId));

	if (isDetailError || isSolutionError)
		return (
			<Navigate
				to="/analysis-failed"
				search={{ laundryIds: [laundryId] }}
				replace
			/>
		);

	if (isDetailLoading || isSolutionLoading)
		return <div className="p-[16px]">솔루션을 불러오는 중…</div>;

	const current = solution!.solutions.find((s) => s.name === selectedCategory);

	async function handleSaveToBasket() {
		try {
			setSaving(true);
			const combined: Laundry = {
				id: detail!.id,
				materials: detail!.materials,
				color: detail!.color,
				type: detail!.type,
				hasPrintOrTrims: detail!.hasPrintOrTrims,
				laundrySymbols: detail!.laundrySymbols,
				additionalInfo: solution!.additionalInfo,
				solutions: solution!.solutions,
				images: detail!.images,
			};

			await laundryStore.set({ id: detail!.id, value: combined });

			await queryClient.invalidateQueries({
				queryKey: laundryBasketQueryOptions.queryKey,
			});
			navigate({ to: "/laundry-basket" });
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="flex min-h-dvh flex-col bg-light-gray-1 px-[16px] pt-[24px] pb-[36px]">
			<header className="flex">
				<Link to="/" className="ml-auto">
					<CloseIcon />
				</Link>
			</header>

			<h1 className="text-title-2 font-semibold text-black">
				<p>띵동!</p>
				<p>딱 맞는 세~탁 해결책이 도착했어요</p>
			</h1>

			<div className="mx-auto w-full max-w-[393px] grow">
				<h2 className="mb-[24px] flex items-center gap-[10px] text-subhead font-medium text-black-2">
					세탁 메뉴얼
					<AiBadge />
				</h2>

				<div className="flex flex-col gap-[18px]">
					<section className="rounded-[12px] bg-white p-[24px]">
						<div className="mb-[12px] flex justify-center gap-[12px]">
							<img
								src={detail!.images.label.data}
								className="size-[72px] rounded-[12px] object-cover"
							/>
							{detail!.images.real?.data && (
								<img
									src={detail!.images.real.data}
									className="size-[72px] rounded-[12px] object-cover"
								/>
							)}
						</div>
						<p className="mb-[12px] text-center">
							이 세탁물의 소재는 {detail!.materials.join(", ")}이에요
						</p>
						<div className="flex items-center justify-center gap-[8px]">
							{detail!.color && (
								<span className="rounded-[4px] bg-label-yellow p-[4px] text-caption font-medium text-[#e9af32]">
									{detail!.color}
								</span>
							)}
							{detail!.hasPrintOrTrims && (
								<span className="rounded-[4px] bg-label-green p-[4px] text-caption font-medium text-[#76c76f]">
									프린트나 장식이 있어요
								</span>
							)}
						</div>
					</section>

					<section className="rounded-[12px] bg-white p-[24px]">
						<div className="mb-[24px] flex items-center justify-between">
							{categories.map((category) => (
								<Chip
									key={category}
									isActive={category === selectedCategory}
									onClick={() => setSelectedCategory(category)}
								>
									{categoryContent[category].title}
								</Chip>
							))}
						</div>
						<h2 className="mb-[18px] text-subhead font-semibold text-dark-gray-1">
							{categoryContent[selectedCategory].subtitle}
						</h2>
						<p className="text-body-1 font-medium whitespace-pre-line text-dark-gray-1">
							{current?.contents}
						</p>
					</section>
				</div>
			</div>
			<div className="mx-auto w-full max-w-[393px]">
				<button
					onClick={handleSaveToBasket}
					disabled={saving}
					className="mt-[16px] h-[56px] w-full rounded-[10px] bg-black-2 text-subhead font-medium text-white disabled:opacity-60"
				>
					빨래바구니에 담을래요
				</button>
			</div>
		</div>
	);
}
