import { Link, createFileRoute } from "@tanstack/react-router";
import CloudImg from "@/assets/images/cloud.png";
import MascortFrontImg from "@/assets/images/mascort-front.png";

export const Route = createFileRoute("/_with-nav-layout/label-analysis")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<div className="relative flex h-full flex-col items-center bg-linear-to-b from-[#D1EFFF] from-65% to-[#FDFFF5]">
				<img src={CloudImg} />
				<img src={MascortFrontImg} />
			</div>
			<div className="absolute inset-0 flex h-full flex-col items-center justify-between px-[16px] pt-[100px] pb-[106px]">
				<div>
					<h1 className="sr-only">라벨분석 페이지</h1>
					<h2 className="mb-[24px] text-title-1 font-semibold text-black-2">
						어떻게 세탁할지 모른다면, <br />딱 맞는 방법을 알려드려요
					</h2>
					<p className="text-center text-body-1 text-dark-gray-1">
						세탁할 의류와 케어라벨 사진만 찍으면 <br />
						런드리더가 빠르게 분석해 세탁 방법을 알려줘요
					</p>
				</div>

				<Link
					to="/label-anaysis/image"
					className="flex w-full items-center justify-center rounded-[10px] bg-main-blue-1 py-[18px] text-subhead font-medium text-white"
				>
					분석 시작하기
				</Link>
			</div>
		</>
	);
}
