import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import CloseIcon from "@/assets/icons/close.svg?react";
import { CARE_LABEL_SYMBOLS } from "@/entities/care-label/const";
import { useTempLaundry } from "@/entities/laundry/store/temp";
import { cn, symbolUrl } from "@/lib/utils";

export const Route = createFileRoute("/laundry/edit")({
	component: RouteComponent,
});

function RouteComponent() {
	const tempLaundry = useTempLaundry();
	// if (tempLaundry.state === null) {
	// 	return <Navigate to="/label-analysis" replace />;
	// }

	const navigate = useNavigate();
	const [step, setStep] = useState(0); // 0: 기본정보, 1: 물세탁, 2: 표백/탈수, 3: 자연건조/기계건조, 4: 드라이/웨트

	// 기호 코드와 설명을 매핑
	const codeToDesc = useMemo(() => {
		const map = new Map<string, { description: string }>();
		const cats = CARE_LABEL_SYMBOLS.laundrySymbol;
		(Object.keys(cats) as Array<keyof typeof cats>).forEach((cat) => {
			cats[cat].forEach((item) => {
				map.set(item.code, { description: item.description });
			});
		});

		return map;
	}, []);

	const goPrev = () => setStep((s) => Math.max(0, s - 1));
	const goNext = () => setStep((s) => Math.min(4, s + 1));

	// 선택된 심볼 Set 계산 헬퍼
	function selectedSetFor(
		category: keyof typeof CARE_LABEL_SYMBOLS.laundrySymbol,
	): Set<string> {
		const all = (tempLaundry.state?.laundrySymbols ?? []).filter(
			(s): s is { code: string; description: string } =>
				s != null && typeof (s as any).code === "string",
		);
		const allowed = new Set(
			CARE_LABEL_SYMBOLS.laundrySymbol[category].map((i) => i.code),
		);
		return new Set(all.filter((s) => allowed.has(s.code)).map((s) => s.code));
	}

	// 토글 헬퍼
	const toggleSymbol = (code: string) => {
		const current = tempLaundry.state?.laundrySymbols ?? [];
		const currentClean = current.filter(
			(s): s is { code: string; description: string } =>
				s != null && typeof (s as any).code === "string",
		);
		const exists = currentClean.some((s) => s.code === code);
		if (exists) {
			tempLaundry.set({
				laundrySymbols: currentClean.filter((s) => s.code !== code),
			});
			return;
		}

		const meta = codeToDesc.get(code);
		if (!meta) return;
		tempLaundry.set({
			laundrySymbols: [
				...currentClean,
				{ code, description: meta.description },
			],
		});
	};

	return (
		<div className="h-full bg-gray-3 px-[16px] pt-[54px] pb-[34px]">
			<header className="mb-[12px] flex items-center">
				<Link
					to="/label-anaysis/image"
					search={{ step: "analysis" }}
					className="ml-auto"
				>
					<CloseIcon />
				</Link>
			</header>

			<div
				className="mb-[18px] flex justify-start gap-[12px]"
				aria-label="진행 단계"
			>
				{Array.from({ length: 5 }).map((_, i) => (
					<span
						key={i}
						className={`h-[12px] w-[12px] rounded-full ${i <= step ? "bg-main-blue-1" : "bg-[#d9d9d9]"}`}
					/>
				))}
			</div>

			<h1 className="mb-[6px] text-title-1 font-semibold text-black-2">
				세탁 정보 추가
			</h1>

			<div className="mb-[28px] rounded-[12px] bg-gray-bluegray-1 p-[16px]">
				<p className="mb-[8px] text-body-1 font-semibold text-dark-gray-1">
					케어 라벨이 손상되어도 문제 없어요
				</p>
				<p className="text-body-2 text-dark-gray-2">
					라벨에 있는 기호를 보고 아래에서 해당하는 옵션을 선택하면 케어라벨이
					손상되어도 세탁 가이드를 제공해드려요. 앞에서 입력된 정보도 수정할 수
					있어요.
				</p>
			</div>

			<section className="rounded-[24px] bg-white px-[16px] py-[24px]">
				{step === 0 && (
					<>
						<FieldBlock label="소재">
							<input
								value={
									(tempLaundry.state?.materials || [])
										.filter((m): m is string => typeof m === "string")
										.join(", ") ?? ""
								}
								onChange={(e) =>
									tempLaundry.set({
										materials: e.target.value
											.split(",")
											.map((s) => s.trim())
											.filter((s) => s.length > 0),
									})
								}
								placeholder="쉼표로 구분: 면, 린넨"
								className="w-full rounded-[10px] border border-gray-bluegray-2 p-3 outline-none"
							/>
							<Helper>여러 개면 쉼표(,)로 구분해 주세요.</Helper>
						</FieldBlock>

						<div className="h-[16px]" />

						<FieldBlock label="색상">
							<input
								value={
									typeof tempLaundry.state?.color === "string"
										? tempLaundry.state.color
										: ""
								}
								onChange={(e) => tempLaundry.set({ color: e.target.value })}
								placeholder="예: 검정색, 아이보리"
								className="w-full rounded-[10px] border border-gray-bluegray-2 p-3 outline-none"
							/>
						</FieldBlock>

						<div className="h-[16px]" />

						<FieldBlock label="옷 종류">
							<input
								value={
									typeof tempLaundry.state?.type === "string"
										? tempLaundry.state.type
										: ""
								}
								onChange={(e) => tempLaundry.set({ type: e.target.value })}
								placeholder="옷의 종류를 정확히 입력해주세요"
								className="w-full rounded-[10px] border border-gray-bluegray-2 p-3 outline-none"
							/>
						</FieldBlock>

						<div className="h-[16px]" />

						<FieldBlock label="프린트/장식 여부">
							<div
								role="radiogroup"
								aria-label="프린트/장식 여부"
								className="grid grid-cols-2 gap-[8px]"
							>
								{(() => {
									const has = tempLaundry.state?.hasPrintOrTrims;
									const activeYes = has === true;
									const activeNo = has === false;
									return (
										<>
											<button
												type="button"
												role="radio"
												aria-checked={activeYes}
												onClick={() =>
													tempLaundry.set({ hasPrintOrTrims: true })
												}
												className={`${
													activeYes
														? "border-[2px] border-main-blue-1"
														: "border-gray-2"
												} rounded-[10px] border bg-white p-[12px] text-subhead`}
											>
												있음
											</button>
											<button
												type="button"
												role="radio"
												aria-checked={activeNo}
												onClick={() =>
													tempLaundry.set({ hasPrintOrTrims: false })
												}
												className={`${
													activeNo
														? "border-[2px] border-main-blue-1"
														: "border-gray-2"
												} rounded-[10px] border bg-white p-[12px] text-subhead`}
											>
												없음
											</button>
										</>
									);
								})()}
							</div>
						</FieldBlock>

						<div className="h-[16px]" />
					</>
				)}

				{step === 1 && (
					<FieldBlock label="물세탁">
						<SymbolCheckboxGrid
							name="waterWashing"
							items={CARE_LABEL_SYMBOLS.laundrySymbol.waterWashing}
							selectedCodes={selectedSetFor("waterWashing")}
							onToggle={toggleSymbol}
						/>
					</FieldBlock>
				)}

				{step === 2 && (
					<>
						<FieldBlock label="표백">
							<SymbolCheckboxGrid
								name="bleaching"
								items={CARE_LABEL_SYMBOLS.laundrySymbol.bleaching}
								selectedCodes={selectedSetFor("bleaching")}
								onToggle={toggleSymbol}
							/>
						</FieldBlock>
						<div className="h-[16px]" />
						<FieldBlock label="손으로 탈수">
							<SymbolCheckboxGrid
								name="wringing"
								items={CARE_LABEL_SYMBOLS.laundrySymbol.wringing}
								selectedCodes={selectedSetFor("wringing")}
								onToggle={toggleSymbol}
							/>
						</FieldBlock>
					</>
				)}

				{step === 3 && (
					<>
						<FieldBlock label="자연 건조">
							<SymbolCheckboxGrid
								name="naturalDrying"
								items={CARE_LABEL_SYMBOLS.laundrySymbol.naturalDrying}
								selectedCodes={selectedSetFor("naturalDrying")}
								onToggle={toggleSymbol}
							/>
						</FieldBlock>
						<div className="h-[16px]" />
						<FieldBlock label="기계건조">
							<SymbolCheckboxGrid
								name="tumbleDrying"
								items={CARE_LABEL_SYMBOLS.laundrySymbol.tumbleDrying}
								selectedCodes={selectedSetFor("tumbleDrying")}
								onToggle={toggleSymbol}
							/>
						</FieldBlock>
					</>
				)}

				{step === 4 && (
					<>
						<FieldBlock label="드라이클리닝">
							<SymbolCheckboxGrid
								name="dryCleaning"
								items={CARE_LABEL_SYMBOLS.laundrySymbol.dryCleaning}
								selectedCodes={selectedSetFor("dryCleaning")}
								onToggle={toggleSymbol}
							/>
						</FieldBlock>
						<div className="h-[16px]" />
						<FieldBlock label="웨트클리닝">
							<SymbolCheckboxGrid
								name="wetCleaning"
								items={CARE_LABEL_SYMBOLS.laundrySymbol.wetCleaning}
								selectedCodes={selectedSetFor("wetCleaning")}
								onToggle={toggleSymbol}
							/>
						</FieldBlock>
					</>
				)}
			</section>

			<footer className="mt-[16px] flex gap-[12px]">
				<button
					onClick={goPrev}
					disabled={step === 0}
					className="grow rounded-[10px] bg-gray-bluegray-2 py-[14px] text-subhead font-medium text-dark-gray-2 disabled:cursor-not-allowed"
				>
					이전
				</button>
				{step < 4 ? (
					<button
						onClick={goNext}
						className="grow rounded-[10px] bg-main-blue-1 py-[14px] text-white"
					>
						다음
					</button>
				) : (
					<button
						onClick={() =>
							navigate({
								to: "/label-anaysis/image",
								search: { step: "analysis" },
							})
						}
						className="grow rounded-[10px] bg-main-blue-1 py-[14px] text-white"
					>
						다 골랐어요
					</button>
				)}
			</footer>
		</div>
	);
}

function FieldBlock({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<p className="mb-[24px] text-title-3 font-semibold text-dark-gray-1">
				{label}
			</p>
			{children}
		</div>
	);
}

function Helper({ children }: { children: React.ReactNode }) {
	return <p className="mt-2 text-caption text-dark-gray-1">{children}</p>;
}

type SymbolItem = { code: string; description: string };

function SymbolCheckboxGrid({
	name,
	items,
	selectedCodes,
	onToggle,
}: {
	name: string;
	items: Array<SymbolItem>;
	selectedCodes: Set<string>;
	onToggle: (code: string) => void;
}) {
	return (
		<div
			role="group"
			aria-labelledby={`${name}-label`}
			className="grid grid-cols-3 gap-[16px]"
		>
			{items.map((item) => {
				const active = selectedCodes.has(item.code);
				return (
					<button
						key={item.code}
						type="button"
						role="checkbox"
						aria-checked={active}
						onClick={() => onToggle(item.code)}
						className={cn(
							"flex aspect-square items-center justify-center rounded-[12px] border bg-white p-[12px] text-left text-dark-gray-2 transition-colors",
							active ? "border-[2px] border-main-blue-1" : "border-gray-2",
						)}
					>
						<img src={symbolUrl(`${item.code}.png`)} className="size-4/6" />
					</button>
				);
			})}
		</div>
	);
}
