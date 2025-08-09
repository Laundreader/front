import { useEffect, useRef, useState } from "react";
import { overlay } from "overlay-kit";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import type {
	LaundryAfterAnalysis,
	LaundryBeforeAnalysis,
} from "@/entities/laundry/model";
import CloseIcon from "@/assets/icons/close.svg?react";
import PlusCircleIcon from "@/assets/icons/plus-circle.svg?react";
import CaptureGuideImg from "@/assets/images/capture-guide.png";
import LabelCapture from "@/assets/images/label-capture.png";
import { AlertDialog } from "@/components/alert-dialog";
import LabelUploadArea from "@/components/label-upload-area";
import { getCareLabelAnalysis } from "@/entities/care-label/api";
import { laundryStore } from "@/idb";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/label-anaysis/image")({
	component: RouteComponent,
});

function RouteComponent() {
	const [laundry, setLaundry] = useState<LaundryAfterAnalysis | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [labelPreview, setLabelPreview] = useState<string | null>(null);
	const [realPreview, setRealPreview] = useState<string | null>(null);
	const [acceptedLabelHash, setAcceptedLabelHash] = useState<string | null>(
		null,
	);
	const [acceptedRealHash, setAcceptedRealHash] = useState<string | null>(null);
	const committedRef = useRef(false);
	const latestLaundryIdRef = useRef<number | null>(null);

	async function sha256HexFromBase64(base64: string): Promise<string> {
		const binary = atob(base64);
		const len = binary.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
		const hashArray = Array.from(new Uint8Array(hashBuffer));

		return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	}

	// 업로드 핸들러
	const handleLabelUploaded = async (
		base64: string,
		extension: string,
		dataURL: string,
	) => {
		// 이미 올린 의류 사진과 동일하면 차단
		const currentHash = await sha256HexFromBase64(base64);
		if (acceptedRealHash && currentHash === acceptedRealHash) {
			overlay.open(({ isOpen, close }) => (
				<AlertDialog
					img={CaptureGuideImg}
					title="이미 업로드한 이미지입니다"
					body="라벨과 의류에 동일한 이미지는 사용할 수 없어요."
					isOpen={isOpen}
					close={close}
				/>
			));
			return;
		}

		// 이미 올린 이미지랑 동일하면 분석 생략
		if (acceptedLabelHash && currentHash === acceptedLabelHash) {
			return;
		}

		setIsAnalyzing(true);

		try {
			const labelAnalysis = await getCareLabelAnalysis({
				imageData: dataURL,
				imageFormat: (extension === "jpg" ? "jpeg" : extension) as
					| "png"
					| "jpg"
					| "jpeg",
			});
			const laundrySymbols = Object.values(labelAnalysis.laundrySymbols).flat();
			const before: LaundryBeforeAnalysis = {
				...labelAnalysis,
				laundrySymbols,
				images: { label: { format: extension as any, data: dataURL } },
			};
			const laundryId = await laundryStore.set({ value: before });

			setLaundry({ ...before, id: laundryId });
			setLabelPreview(dataURL);
			setAcceptedLabelHash(currentHash);
		} catch (error) {
			overlay.open(({ isOpen, close }) => (
				<AlertDialog
					img={CaptureGuideImg}
					title="다시 촬영해주세요"
					body="가이드에 맞춰 올바르게 촬영해주세요"
					isOpen={isOpen}
					close={close}
				/>
			));
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleClotheUploaded = async (
		base64: string,
		extension: string,
		dataURL: string,
	) => {
		if (!laundry) {
			return;
		}

		// 이미 올린 라벨 이미지와 동일하면 차단
		const currentHash = await sha256HexFromBase64(base64);
		if (acceptedLabelHash && currentHash === acceptedLabelHash) {
			overlay.open(({ isOpen, close }) => (
				<AlertDialog
					img={CaptureGuideImg}
					title="이미 업로드한 이미지입니다"
					body="라벨과 의류에 동일한 이미지는 사용할 수 없어요."
					isOpen={isOpen}
					close={close}
				/>
			));
			return;
		}

		// UI 즉시 업데이트
		setRealPreview(dataURL);
		setAcceptedRealHash(currentHash);

		// Idb에 저장
		const prevLaundry = await laundryStore.get(laundry.id);
		prevLaundry.images["real"] = { format: extension as any, data: dataURL };
		await laundryStore.set({ id: laundry.id, value: prevLaundry });
		setLaundry(prevLaundry);
	};

	const navigate = useNavigate();

	// 제일 마지막 id 추적
	useEffect(() => {
		latestLaundryIdRef.current = laundry?.id ?? null;
	}, [laundry]);

	// 의류 미리보기랑 Idb랑 싱크 맞추기
	useEffect(() => {
		if (laundry?.images?.real?.data) {
			setRealPreview(laundry.images.real.data);
		}
	}, [laundry?.images?.real?.data]);

	// 사용자가 그냥 떠나면 분석 데이터 삭제
	useEffect(() => {
		return () => {
			if (!committedRef.current && latestLaundryIdRef.current != null) {
				void laundryStore.del(latestLaundryIdRef.current);
			}
		};
	}, []);

	return (
		<div className="h-full bg-gray-3 px-[16px] pt-[54px]">
			<header className="flex">
				<Link to="/" className="ml-auto">
					<CloseIcon />
				</Link>
			</header>

			<section className="h-[190px] pt-[22px] pb-[48px]">
				{laundry ? (
					<>
						<p className="mb-[18px] text-center text-title-2 font-semibold text-black-2">
							잠깐! 이 정보가 맞나요?
						</p>
						<p className="text-center text-body-1 text-dark-gray-1">
							런드리더가 분석한 정보가 다르거나,
							<br />
							더욱 자세한 세탁법을 알고 싶다면
							<br />
							의류사진을 올리거나 정보를 더 알려주세요.
						</p>
					</>
				) : (
					<>
						<h2 className="mb-[18px] text-center text-title-2 font-semibold text-black-2">
							케어라벨을 촬영해주세요
						</h2>
						<p className="text-center text-body-1 text-dark-gray-1">
							옷 안쪽에 세탁기호와 소재가 <br /> 적혀있는 라벨을 촬영해주세요
						</p>
					</>
				)}
			</section>

			<section className="mb-[88px] rounded-[24px] bg-white px-[16px] py-[48px] pb-[72px]">
				<img src={LabelCapture} role="presentation" className="" />
				<p className="text-subhead font-medium text-black">
					라벨이 화면 안에 들어오게 찍어주세요
				</p>
				<label
					htmlFor="label-upload"
					className="flex w-[130px] cursor-pointer items-center justify-center gap-[4px] rounded-[12px] bg-light-gray-1 py-[19px] text-caption font-medium text-main-blue-2"
				>
					<PlusCircleIcon />
					<span className="text-body-2 font-medium">케어라벨</span>
				</label>
				<input
					type="file"
					accept="image/*"
					id="label-upload"
					className="hidden"
				/>

				{/* 업로드 영역들 */}
				<div className="mb-[28px] flex justify-center gap-[16px]">
					{/* 첫 번째 업로드 영역 (항상 표시) */}
					<LabelUploadArea
						label="라벨"
						onUpload={handleLabelUploaded}
						deferPreview
						busy={isAnalyzing}
						image={labelPreview}
						maxSize={5 * 1024 * 1024} // 5MB
						disabled={isAnalyzing}
					/>

					{/* 두 번째 업로드 영역 (첫 번째 이미지가 유효할 때만 표시) */}
					{laundry && (
						<LabelUploadArea
							label="의류"
							onUpload={handleClotheUploaded}
							deferPreview
							image={realPreview}
							maxSize={5 * 1024 * 1024} // 5MB
							disabled={isAnalyzing}
						/>
					)}
				</div>

				{/* 분석 정보 */}
				{laundry && (
					<div className="flex flex-col items-center">
						<p className="mb-[12px] text-subhead font-semibold text-black-2">
							이 세탁물의 소재는 {laundry.materials.join(", ")}이에요
						</p>
						<div className="mb-[24px] flex items-center justify-center gap-[8px]">
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
						<ul className="grid w-full grid-cols-6 gap-[8px]">
							{laundry.laundrySymbols.map((symbol) => (
								<li
									key={symbol.code}
									className="flex aspect-square items-center justify-center rounded-[10px] border border-gray-bluegray-2 bg-white text-body-1 font-medium text-dark-gray-1"
								>
									<img className="" />
								</li>
							))}
							{Array.from({ length: 6 - laundry.laundrySymbols.length }).map(
								(_, index) => (
									<li
										key={index}
										className="flex aspect-square items-center justify-center rounded-[10px] border border-gray-bluegray-2 bg-white text-body-1 font-medium text-dark-gray-1"
									></li>
								),
							)}
						</ul>
					</div>
				)}
			</section>

			<div className="flex justify-between gap-[13px]">
				<button
					onClick={() => {
						if (!laundry) {
							return;
						}

						committedRef.current = true; // 편집으로 넘어가면 임시 데이터 유지

						navigate({
							to: "/laundry/$id/edit",
							params: { id: String(laundry.id) },
						});
					}}
					disabled={!laundry}
					className={cn(
						"grow rounded-[10px] bg-gray-bluegray-2 py-[18px] text-subhead font-medium text-dark-gray-2",
						"disabled:cursor-not-allowed disabled:border disabled:border-gray-2 disabled:bg-white disabled:text-gray-1",
					)}
				>
					수정할게요
				</button>
				<button
					onClick={() => {
						committedRef.current = true;
						navigate({
							to: "/analysing",
							search: { laundryIds: laundry ? [laundry.id] : [] },
						});
					}}
					disabled={!laundry}
					className={cn(
						"flex grow items-center justify-center rounded-[10px] bg-main-blue-1 py-[18px] text-white",
						"disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-1",
					)}
				>
					바로 세탁 방법 볼래요
				</button>
			</div>
		</div>
	);
}
