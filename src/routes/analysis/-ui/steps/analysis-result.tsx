import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { useLaundryDraft } from "@/entities/laundry/store/draft";
import { symbolUrl } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import CloseIcon from "@/assets/icons/close.svg?react";
import BlueTShirtImg from "@/assets/images/blue-t-shirt.avif";
import { Stepper } from "../stepper";

type ImageStatus = {
	label: { image: string | null; isValid: boolean; didManual: boolean };
	clothes: { image: string | null; isValid: boolean };
};

export const AnalysisResult = ({
	imageStatus,
	onEdit,
}: {
	onEdit: () => void;
	imageStatus: ImageStatus;
}) => {
	const laundryDraft = useLaundryDraft();
	const laundry = laundryDraft.state;

	const [basicInfo, setBasicInfo] = useState(() => ({
		materials: laundry?.materials.join(",") ?? "",
		color: laundry?.color ?? "",
		type: laundry?.type ?? "",
		hasPrintOrTrims: laundry?.hasPrintOrTrims ?? false,
	}));

	const isValid = {
		materials:
			basicInfo.materials
				.trim()
				.split(",")
				.map((v) => v.trim())
				.filter(Boolean).length > 0,
		color: basicInfo.color !== "",
		type: basicInfo.type !== "",
	};

	const isBasicInfoValid = isValid.materials && isValid.color && isValid.type;

	function handleBasicInfo(
		field: "materials" | "color" | "type" | "hasPrintOrTrims",
		value: string | boolean,
	) {
		setBasicInfo((prev) => ({
			...prev,
			[field]: value,
		}));
	}

	function handleConfirmAnalysis() {
		if (isBasicInfoValid === false) {
			return;
		}

		laundryDraft.set({
			materials: basicInfo.materials
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
			color: String(basicInfo.color).trim(),
			type: String(basicInfo.type).trim(),
			hasPrintOrTrims: Boolean(basicInfo.hasPrintOrTrims),
			didConfirmAnalysis: true,
		});
	}

	const images = [];
	if (imageStatus.label.image) {
		images.push(imageStatus.label.image);
	}
	if (imageStatus.clothes.image) {
		images.push(imageStatus.clothes.image);
	}
	if (images.length === 0) {
		images.push(BlueTShirtImg);
	}

	return (
		<div className="grid h-dvh grid-rows-[auto_1fr] bg-gray-3 p-4">
			<header className="grid grid-cols-[1fr_auto_1fr] p-4">
				<Stepper
					total={3}
					current={3}
					className="col-start-2 justify-self-center"
				/>
				<Link to="/" className="ml-auto">
					<CloseIcon />
				</Link>
			</header>

			<section className="grid min-h-0 grid-rows-[1fr_2fr_1fr]">
				<div className="flex flex-col items-center gap-4">
					<h2 className="text-center text-title-2 font-semibold text-black-2">
						잠깐! 이 정보가 맞나요?
					</h2>
					<p className="text-center text-body-1 text-dark-gray-1">
						런드리더의 분석이 사실과 다르다면
						<br />
						직접 수정할 수 있어요.
					</p>
				</div>

				<div className="flex flex-col items-center justify-evenly rounded-3xl bg-white p-4">
					<div className="flex justify-center gap-4">
						{images.map((src, idx) => (
							<img
								key={idx}
								src={src}
								alt=""
								className="relative aspect-square size-30 rounded-2xl border border-gray-bluegray-2 bg-gray-3 object-cover"
							/>
						))}
					</div>

					{/* 분석 정보 */}
					<div className="flex flex-col items-center">
						<div className="mb-3">
							<p className="text-center text-subhead font-semibold break-keep text-black-2">
								이 {laundry?.type || "세탁물"}의 소재는
							</p>
							<p className="text-center text-subhead font-semibold break-keep text-black-2">
								{laundry?.materials.length === 0
									? "인식하지 못했어요."
									: laundry?.materials.join(", ") + "이에요."}
							</p>
						</div>

						<div className="mb-[24px] flex items-center justify-center gap-[8px]">
							{laundry?.color && (
								<span className="rounded-[4px] bg-label-yellow p-[4px] text-caption font-medium text-[#e9af32]">
									{laundry?.color}
								</span>
							)}
							{laundry?.hasPrintOrTrims && (
								<span className="rounded-[4px] bg-label-green p-[4px] text-caption font-medium text-[#76c76f]">
									프린트나 장식이 있어요
								</span>
							)}
						</div>

						<ul className="flex justify-center gap-1">
							{laundry?.laundrySymbols?.map((symbol) => (
								<li
									key={symbol.code}
									className="flex aspect-square items-center justify-center rounded-[10px] border border-gray-bluegray-2 bg-white text-body-1 font-medium text-dark-gray-1"
								>
									<img src={symbolUrl(symbol.code)} className="size-3/4" />
								</li>
							))}
						</ul>
					</div>
				</div>

				<footer className="flex justify-between gap-4 self-end">
					<Tooltip defaultOpen={false} open={laundry?.didConfirmAnalysis}>
						<TooltipTrigger>
							<button
								onClick={onEdit}
								className="flex grow items-center justify-center rounded-[12px] bg-gray-bluegray-2 py-[18px] text-body-1 font-semibold text-dark-gray-2"
							>
								수정할게요
							</button>
						</TooltipTrigger>
						<TooltipContent className="rounded-lg bg-deep-blue fill-deep-blue px-3 py-2">
							<p className="text-caption font-medium text-white">
								분석이 사실과 다른가요?
							</p>
						</TooltipContent>
					</Tooltip>
					<Link
						to="/analysing"
						className="flex grow items-center justify-center rounded-[12px] bg-main-blue-1 py-[18px] text-body-1 font-semibold text-white"
					>
						바로 세탁 방법 볼래요
					</Link>
				</footer>
			</section>

			{/* 
				MARK: 분석 정보 확인
			*/}
			{imageStatus.label.didManual === false &&
				laundry?.didConfirmAnalysis === false && (
					<section className="absolute inset-0 bg-black/40">
						<div className="absolute right-0 bottom-0 left-0 flex flex-col gap-6 rounded-t-4xl bg-white px-4 pt-8 pb-4">
							<div className="space-y-2">
								<h3 className="text-title-2 font-semibold text-black-2">
									분석 정보 확인
								</h3>
								<p className="text-body-1 font-medium text-dark-gray-2">
									런드리더의 분석이 사실과 다를 수 있으니,
									<br />
									확인해보시고 직접 입력하거나 수정해주세요.
								</p>
							</div>

							<div className="group flex flex-col gap-2">
								<label
									htmlFor="material"
									className="relative w-fit text-subhead font-semibold text-dark-gray-1"
								>
									소재
									<div className="absolute top-1 left-full block size-1 translate-x-0.5 rounded-full bg-red"></div>
								</label>
								<input
									type="text"
									id="material"
									value={basicInfo.materials}
									placeholder="'면' 또는 '면 60%, 폴리 40%'"
									aria-invalid={isValid.materials === false}
									onChange={(e) => handleBasicInfo("materials", e.target.value)}
									className="peer rounded-sm border border-gray-2 px-4 py-3 text-body-1 font-medium text-dark-gray-1 placeholder:text-gray-1 focus:outline-main-blue-1 aria-invalid:border-red focus:aria-invalid:outline-red"
								/>
								<p className="text-body-2 text-gray-1 peer-aria-invalid:text-red">
									여러 소재가 섞여 있다면 모두 알려주세요.
								</p>
							</div>

							<div className="flex flex-col gap-2">
								<label
									htmlFor="color"
									className="relative w-fit text-subhead font-semibold text-dark-gray-1"
								>
									색상
									<div className="absolute top-1 left-full block size-1 translate-x-0.5 rounded-full bg-red"></div>
								</label>
								<input
									type="text"
									id="color"
									value={basicInfo.color}
									placeholder="검정, 아이보리"
									aria-invalid={isValid.color === false}
									onChange={(e) => handleBasicInfo("color", e.target.value)}
									className="rounded-sm border border-gray-2 px-4 py-3 text-body-1 font-medium text-dark-gray-1 placeholder:text-gray-1 focus:outline-main-blue-1 aria-invalid:border-red focus:aria-invalid:outline-red"
								/>
							</div>

							<div className="flex flex-col gap-2">
								<label
									htmlFor="type"
									className="relative w-fit text-subhead font-semibold text-dark-gray-1"
								>
									옷 종류
									<div className="absolute top-1 left-full block size-1 translate-x-0.5 rounded-full bg-red"></div>
								</label>
								<input
									type="text"
									id="type"
									value={basicInfo.type}
									placeholder="셔츠, 바지, 코트"
									aria-invalid={isValid.type === false}
									onChange={(e) => {
										handleBasicInfo("type", e.target.value);
									}}
									className="rounded-sm border border-gray-2 px-4 py-3 text-body-1 font-medium text-dark-gray-1 placeholder:text-gray-1 focus:outline-main-blue-1 aria-invalid:border-red focus:aria-invalid:outline-red"
								/>
							</div>

							<div
								role="radiogroup"
								aria-labelledby="hasPrintOrTrims"
								className="flex flex-col gap-2"
							>
								<p
									id="hasPrintOrTrims"
									className="text-subhead font-semibold text-dark-gray-1"
								>
									프린트/장식 여부
								</p>
								<div className="space-x-4">
									<button
										role="radio"
										aria-checked={basicInfo.hasPrintOrTrims}
										onClick={() => handleBasicInfo("hasPrintOrTrims", true)}
										className="h-14 w-27 rounded-[10px] border border-gray-2 bg-white p-3 text-subhead aria-checked:border-2 aria-checked:border-main-blue-1"
									>
										있음
									</button>
									<button
										role="radio"
										aria-checked={!basicInfo.hasPrintOrTrims}
										onClick={() => handleBasicInfo("hasPrintOrTrims", false)}
										className="h-14 w-27 rounded-[10px] border border-gray-2 bg-white p-3 text-subhead aria-checked:border-2 aria-checked:border-main-blue-1"
									>
										없음
									</button>
								</div>
							</div>

							<button
								disabled={isBasicInfoValid === false}
								onClick={handleConfirmAnalysis}
								className="h-14 w-full rounded-[0.625rem] bg-main-blue-1 text-white disabled:bg-gray-bluegray-2 disabled:text-gray-1"
							>
								저장할게요
							</button>
						</div>
					</section>
				)}
		</div>
	);
};
