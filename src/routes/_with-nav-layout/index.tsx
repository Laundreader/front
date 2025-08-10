import { Suspense } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import ArrowIcon from "@/assets/icons/arrow.svg?react";
import ChevronRightIcon from "@/assets/icons/chevron-right.svg?react";
import BlueTShirtWithWindImg from "@/assets/images/blue-t-shirt-with-wind.png";
import CareSymbolImg from "@/assets/images/care-symbol.png";
import GreenTShirtImg from "@/assets/images/green-t-shirt.png";
import MainBgImg from "@/assets/images/main-bg.png";
import { laundryBasketQueryOptions } from "@/features/laundry/api";

export const Route = createFileRoute("/_with-nav-layout/")({
	component: App,
});

function App() {
	return (
		<div className="pb-[90px]">
			<header className="relative h-[337px]">
				<img src={MainBgImg} role="presentation" className="h-auto w-full" />
				<div className="absolute inset-0 flex flex-col items-center justify-between px-[16px] pt-[70px] pb-[18px]">
					<div className="justify-self-start text-title-2 font-semibold text-black-2">
						<p>세탁, 어떻게 할지 모른다면?</p>
						<p>안심하고 세탁할 수 있게 도와드려요</p>
					</div>

					<Link
						to="/label-analysis"
						className="flex h-[56px] w-[341px] items-center rounded-full bg-linear-to-r from-[#2EA4FF] to-[#A6E6FF] p-[2px]"
					>
						<div className="flex h-full w-full items-center justify-center gap-[4px] rounded-full bg-linear-to-r from-[#277CFF] to-[#58CAFF]">
							<span className="font-semibold text-white">
								지금 바로 정확한 세탁법 알아보러 Go
							</span>
							<ArrowIcon className="text-white" />
						</div>
					</Link>
				</div>
			</header>

			<section className="bg-white px-[16px] pt-[36px] pb-[36px]">
				<Link
					to="/wiki"
					className="mb-[24px] flex items-center justify-between"
				>
					<h2 className="text-subhead font-semibold text-black-2">세탁 백과</h2>
					<ChevronRightIcon className="text-black-2" />
				</Link>
				<div className="grid grid-cols-2 gap-[16px]">
					<Link
						to="/wiki"
						search={{ category: "careSymbols" }}
						className="min-h-[132px] rounded-[12px] border border-gray-bluegray-2 bg-white p-[16px]"
					>
						<p className="text-body-1 font-medium text-dark-gray-1">
							내 옷 라벨 속 기호들 <br /> 쉽게 알려드릴게요
						</p>
						<img src={CareSymbolImg} role="presentation" className="ml-auto" />
					</Link>
					<Link
						to="/wiki"
						search={{ category: "materials" }}
						className="min-h-[132px] rounded-[12px] border border-gray-bluegray-2 bg-white p-[16px]"
					>
						<p className="text-body-1 font-medium text-dark-gray-1">
							옷감 지키는 세탁법, <br /> 전혀 어렵지 않아요
						</p>
						<img src={GreenTShirtImg} role="presentation" className="ml-auto" />
					</Link>
				</div>
			</section>

			<section className="bg-gray-bluegray-1 px-[16px] pt-[24px] pb-[16px]">
				<Link
					to="/laundry-basket"
					className="mb-[24px] flex items-center justify-between"
				>
					<h2 className="text-subhead font-semibold text-black-2">
						한 번에 세탁하기 전에 문제 없나, Check!
					</h2>
					<ChevronRightIcon className="text-black-2" />
				</Link>

				<Suspense fallback={<LaundryBasketSkeleton />}>
					<LaundryBasketThumbnails />
				</Suspense>
			</section>
		</div>
	);
}

const LaundryBasketSkeleton = () => {
	return (
		<ul className="scrollbar-hidden flex max-w-max flex-nowrap gap-[12px] overflow-x-scroll">
			{Array.from({ length: 4 }).map((_, index) => (
				<li key={index} className="shrink-0">
					<div className="size-[92px] animate-pulse rounded-[12px] bg-gray-2" />
				</li>
			))}
		</ul>
	);
};

const LaundryBasketThumbnails = () => {
	const { data: laundryBasket } = useSuspenseQuery(laundryBasketQueryOptions);

	if (laundryBasket.length === 0) {
		return <EmptyLaundryBasket />;
	}

	return (
		<ul className="scrollbar-hidden flex max-w-max flex-nowrap gap-[12px] overflow-x-scroll">
			{laundryBasket.map((item) => (
				<li key={item.id} className="shrink-0">
					<img
						src={item.images.real?.data ?? item.images.label.data}
						className="size-[92px] rounded-[12px]"
					/>
				</li>
			))}
		</ul>
	);
};

const EmptyLaundryBasket = () => {
	return (
		<div className="flex flex-col items-center gap-[12px]">
			<img src={BlueTShirtWithWindImg} />
			<p className="text-body-1 text-gray-1">바구니에 빨랫감을 담아보세요!</p>
		</div>
	);
};
