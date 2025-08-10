import { useEffect, useRef, useState } from "react";
import { overlay } from "overlay-kit";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import z from "zod";
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
import type { LabelUploadAreaRef } from "@/components/label-upload-area";
import { getCareLabelAnalysis } from "@/entities/care-label/api";
import { laundryStore } from "@/idb";
import { cn, sha256HexFromBase64, symbolUrl } from "@/lib/utils";
import RotateCcwIcon from "@/assets/icons/rotate-ccw.svg?react";

export const Route = createFileRoute("/label-anaysis/image")({
	validateSearch: z.object({
		laundryId: z.number().int().positive().optional(),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { laundryId } = Route.useSearch();
	const [laundry, setLaundry] = useState<LaundryAfterAnalysis | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [labelPreview, setLabelPreview] = useState<string | null>(null);
	const [realPreview, setRealPreview] = useState<string | null>(null);
	// 업로드 실패 시 Step B 표시 (성공 전까지 유지)
	const [uploadFailed, setUploadFailed] = useState(false);
	const [_lastLabelError, setLastLabelError] = useState<string | null>(null);
	const [isHydrating, setIsHydrating] = useState(false);
	const [acceptedLabelHash, setAcceptedLabelHash] = useState<string | null>(
		null,
	);
	const [acceptedRealHash, setAcceptedRealHash] = useState<string | null>(null);
	const committedRef = useRef(false);
	const latestLaundryIdRef = useRef<number | null>(null);
	// Step A/B에서 사용할 숨겨진 업로더 (LabelUploadArea의 검증/리사이즈/업로드 로직 재사용)
	const hiddenLabelUploaderRef = useRef<LabelUploadAreaRef | null>(null);

	// 만약 검색파라미터로 laundryId가 오면, 해당 데이터를 불러와서 화면에 표시
	useEffect(() => {
		let mounted = true;
		(async () => {
			if (!laundryId) return;
			setIsHydrating(true);
			try {
				const record = await laundryStore.get(laundryId);
				if (!mounted || !record) return;
				setLaundry({ ...(record as any), id: laundryId });
				setLabelPreview(record.images?.label?.data ?? null);
				setRealPreview(record.images?.real?.data ?? null);
				// 업로드 중복 체크를 위해 기존 이미지의 해시도 복구
				try {
					const labelDataUrl: string | undefined = record.images?.label?.data;
					if (labelDataUrl) {
						const base64 = labelDataUrl.split(",")[1] ?? "";
						const hash = await sha256HexFromBase64(base64);
						if (mounted) setAcceptedLabelHash(hash);
					}
					const realDataUrl: string | undefined = record.images?.real?.data;
					if (realDataUrl) {
						const base64 = realDataUrl.split(",")[1] ?? "";
						const hash = await sha256HexFromBase64(base64);
						if (mounted) setAcceptedRealHash(hash);
					}
				} catch {}
				setUploadFailed(false);
				setLastLabelError(null);
			} finally {
				if (mounted) setIsHydrating(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [laundryId]);

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
			setUploadFailed(false); // 성공하면 실패 상태 해제
			setLastLabelError(null);
		} catch (error) {
			// 모달 대신 Step B 표시
			setUploadFailed(true);
			setLastLabelError("분석에 실패했어요. 가이드에 맞춰 다시 촬영해주세요.");
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
		<div className="flex min-h-dvh flex-col justify-between bg-gray-3 px-[16px] pt-[54px] pb-[46px]">
			<div>
				<header className="flex">
					<Link to="/" className="ml-auto">
						<CloseIcon />
					</Link>
				</header>

				{/* 숨겨진 업로더: Step A/B에서 클릭으로 트리거 */}
				<LabelUploadArea
					ref={hiddenLabelUploaderRef}
					label="라벨"
					onUpload={handleLabelUploaded}
					onError={(message) => {
						// 검증 실패 등 클라이언트 에러도 Step B로 전환
						setUploadFailed(true);
						setLastLabelError(message || "이미지 업로드에 실패했습니다.");
					}}
					deferPreview
					busy={isAnalyzing}
					image={labelPreview}
					className="hidden"
					maxSize={5 * 1024 * 1024}
					disabled={isAnalyzing}
					accept="image/*"
				/>

				{/* step A. 초기 상태에서 표시. 성공 시 숨김, 실패 시 step B로 대체 */}
				{!isHydrating && !laundry && !uploadFailed && (
					<section>
						<div className="mb-[60px]">
							<h2 className="mb-[18px] text-center text-title-2 font-semibold text-black-2">
								케어라벨을 촬영해주세요
							</h2>
							<p className="text-center text-body-1 text-dark-gray-1">
								옷 안쪽에 세탁기호와 소재가 <br /> 적혀있는 라벨을 촬영해주세요
							</p>
						</div>

						<div className="flex flex-col items-center gap-[16px] rounded-[24px] bg-white p-[35px]">
							<div className="w-1/2">
								<img
									src={LabelCapture}
									role="presentation"
									className="size-full"
								/>
							</div>
							<p className="text-center text-subhead font-medium text-black">
								라벨이 화면 안에 들어오게 찍어주세요
							</p>
							<button
								onClick={() => hiddenLabelUploaderRef.current?.triggerUpload()}
								disabled={isAnalyzing}
								className="flex w-[130px] cursor-pointer items-center justify-center gap-[4px] rounded-[12px] bg-light-gray-1 py-[19px] text-body-2 text-caption font-medium text-main-blue-2 disabled:cursor-not-allowed disabled:opacity-60"
							>
								<PlusCircleIcon />
								케어라벨
							</button>
						</div>
					</section>
				)}

				{/* step B. 성공 이력이 없고 직전 업로드가 실패했을 때 표시 */}
				{!isHydrating && !laundry && uploadFailed && (
					<section className="h-[190px] pt-[22px] pb-[48px]">
						<div className="mb-[48px]">
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
						</div>

						<div className="flex flex-col items-center gap-[16px] rounded-[24px] bg-white p-[35px]">
							<img src={CaptureGuideImg} role="presentation" />
							<div className="text-center text-subhead font-medium text-black">
								<p>인식이 실패했어요!</p>
								<p>다시 한번 촬영해주세요</p>
							</div>
							{/* {lastLabelError && (
								<p className="mt-[8px] text-center text-body-2 text-red">
									{lastLabelError}
								</p>
							)} */}
							<button
								onClick={() => hiddenLabelUploaderRef.current?.triggerUpload()}
								disabled={isAnalyzing}
								className="flex w-[109px] items-center justify-center gap-[4px] rounded-[12px] bg-light-gray-1 py-[21px] text-body-2 font-medium text-gray-1"
							>
								<RotateCcwIcon />
								다시 촬영
							</button>
						</div>
					</section>
				)}

				{/* step C. 유효한 업로드를 한 번이라도 성공하면 표시 */}
				{laundry && (
					<section className="h-[190px] pt-[22px] pb-[48px]">
						<div className="mb-[48px]">
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
						</div>

						<div className="flex flex-col items-center gap-[16px] rounded-[24px] bg-white p-[35px]">
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
											<img
												src={symbolUrl(`${symbol.code}.png`)}
												className="size-3/4"
											/>
										</li>
									))}
									{Array.from({
										length: 6 - laundry.laundrySymbols.length,
									}).map((_, index) => (
										<li
											key={index}
											className="flex aspect-square items-center justify-center rounded-[10px] border border-gray-bluegray-2 bg-white text-body-1 font-medium text-dark-gray-1"
										></li>
									))}
								</ul>
							</div>
						</div>
					</section>
				)}
			</div>

			<footer className="flex justify-between gap-[13px]">
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
			</footer>
		</div>
	);
}
