import { useEffect, useMemo, useRef, useState } from "react";
import {
	Link,
	Navigate,
	createFileRoute,
	useNavigate,
} from "@tanstack/react-router";
import type { LaundryAfterAnalysis } from "@/entities/laundry/model";
import { CARE_LABEL_SYMBOLS } from "@/entities/care-label/const";
import { laundryStore } from "@/idb";
import CloseIcon from "@/assets/icons/close.svg?react";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";


export const Route = createFileRoute("/laundry/$id/edit")({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const laundryId = useMemo(() => {
		const n = Number(id);
		return Number.isFinite(n) ? n : null;
	}, [id]);
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [laundry, setLaundry] = useState<LaundryAfterAnalysis | null>(null);

	const [step, setStep] = useState(0); // 0: 기본정보, 1: 물세탁, 2: 표백/탈수, 3: 자연건조/기계건조, 4: 드라이/웨트

	const [typeValue, setTypeValue] = useState("");
	const [materialsText, setMaterialsText] = useState(""); // 콤마로 구분
	const [colorValue, setColorValue] = useState("");
	const [hasPrintOrTrims, setHasPrintOrTrims] = useState(false);
	const [additionalText, setAdditionalText] = useState(""); // 개행으로 구분

	// 기호 선택 (카테고리별 다중 선택)
	const [selWaterWashing, setSelWaterWashing] = useState<Set<string>>(
		new Set(),
	);
	const [selBleaching, setSelBleaching] = useState<Set<string>>(new Set());
	const [selWringing, setSelWringing] = useState<Set<string>>(new Set());
	const [selNaturalDrying, setSelNaturalDrying] = useState<Set<string>>(
		new Set(),
	);
	const [selTumbleDrying, setSelTumbleDrying] = useState<Set<string>>(
		new Set(),
	);
	const [selDryCleaning, setSelDryCleaning] = useState<Set<string>>(new Set());
	const [selWetCleaning, setSelWetCleaning] = useState<Set<string>>(new Set());

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

	// 디바운스
	const saveTimerRef = useRef<number | null>(null);
	const scheduleSave = (next: LaundryAfterAnalysis) => {
		if (saveTimerRef.current) {
			window.clearTimeout(saveTimerRef.current);
		}

		saveTimerRef.current = window.setTimeout(async () => {
			await laundryStore.set({ id: next.id, value: next });
			setLaundry(next);
		}, 300);
	};

	// 초기화
	useEffect(() => {
		let mounted = true;

		(async () => {
			if (!laundryId) {
				setError("invalid-id");
				setLoading(false);

				return;
			}

			try {
				const record = (await laundryStore.get(laundryId)) as
					| LaundryAfterAnalysis
					| undefined;

				if (!mounted) {
					return;
				}

				if (!record) {
					setError("not-found");
				} else {
					setLaundry(record);
					setTypeValue(record.type ?? "");
					setMaterialsText((record.materials ?? []).join(", "));
					setColorValue(record.color ?? "");
					setHasPrintOrTrims(Boolean(record.hasPrintOrTrims));
					setAdditionalText((record.additionalInfo ?? []).join("\n"));

					// 기호 선택 초기화
					const codes = new Set(
						(record.laundrySymbols ?? []).map((s: { code: string }) => s.code),
					);
					// 카테고리별로 선택된 기호를 설정
					const pickMany = (
						category: keyof typeof CARE_LABEL_SYMBOLS.laundrySymbol,
					) => {
						const list = CARE_LABEL_SYMBOLS.laundrySymbol[category];

						return new Set(
							list.filter((i) => codes.has(i.code)).map((i) => i.code),
						);
					};

					setSelWaterWashing(pickMany("waterWashing"));
					setSelBleaching(pickMany("bleaching"));
					setSelWringing(pickMany("wringing"));
					setSelNaturalDrying(pickMany("naturalDrying"));
					setSelTumbleDrying(pickMany("tumbleDrying"));
					setSelDryCleaning(pickMany("dryCleaning"));
					setSelWetCleaning(pickMany("wetCleaning"));
				}
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
			if (saveTimerRef.current) {
				window.clearTimeout(saveTimerRef.current);
			}
		};
	}, [laundryId]);

	// 필드 변경시 저장(debounce)
	useEffect(() => {
		if (!laundry) return;
		// 기호 선택을 평면 배열로 변환
		const nextSymbols: LaundryAfterAnalysis["laundrySymbols"] = [];
		const pushSet = (set: Set<string>) => {
			for (const code of set) {
				const meta = codeToDesc.get(code);
				if (!meta) continue;
				nextSymbols.push({ code, description: meta.description });
			}
		};
		pushSet(selWaterWashing);
		pushSet(selBleaching);
		pushSet(selWringing);
		pushSet(selNaturalDrying);
		pushSet(selTumbleDrying);
		pushSet(selDryCleaning);
		pushSet(selWetCleaning);

		const next: LaundryAfterAnalysis = {
			...laundry,
			type: typeValue,
			materials: materialsText
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
			color: colorValue,
			hasPrintOrTrims,
			additionalInfo: additionalText
				.split("\n")
				.map((s) => s.trim())
				.filter(Boolean),
			laundrySymbols: nextSymbols,
		};
		scheduleSave(next);
	}, [
		typeValue,
		materialsText,
		colorValue,
		hasPrintOrTrims,
		additionalText,
		selWaterWashing,
		selBleaching,
		selWringing,
		selNaturalDrying,
		selTumbleDrying,
		selDryCleaning,
		selWetCleaning,
	]);

	if (loading) {
		return (
			<div className="p-[16px]">
				<p className="text-body-1 text-dark-gray-1">불러오는 중…</p>
			</div>
		);
	}

	if (error === "invalid-id" || error === "not-found" || !laundry) {
		return <Navigate to="/label-anaysis/image" replace />;
	}

	const goPrev = () => setStep((s) => Math.max(0, s - 1));
	const goNext = () => setStep((s) => Math.min(4, s + 1));

	const finishAndSeeSolution = () => {
		navigate({
			to: "/analysing",
			search: { laundryIds: [laundry.id] },
		});
	};

	return (
		<div className="h-full bg-gray-3 px-[16px] pt-[54px]">
			<header className="mb-[12px] flex items-center">
				<Link to=".." className="mr-auto">
					<ChevronLeftIcon />
				</Link>
				<Link to="/" className="ml-auto">
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
								value={materialsText}
								onChange={(e) => setMaterialsText(e.target.value)}
								placeholder="쉼표로 구분: 면, 린넨"
								className="w-full rounded-[10px] border border-gray-bluegray-2 p-3 outline-none"
							/>
							<Helper>여러 개면 쉼표(,)로 구분해 주세요.</Helper>
						</FieldBlock>

						<div className="h-[16px]" />

						<FieldBlock label="색상">
							<input
								value={colorValue}
								onChange={(e) => setColorValue(e.target.value)}
								placeholder="예: 검정색, 아이보리"
								className="w-full rounded-[10px] border border-gray-bluegray-2 p-3 outline-none"
							/>
						</FieldBlock>

						<div className="h-[16px]" />

						<FieldBlock label="옷 종류">
							<input
								value={typeValue}
								onChange={(e) => setTypeValue(e.target.value)}
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
								<button
									type="button"
									role="radio"
									aria-checked={hasPrintOrTrims === true}
									onClick={() => setHasPrintOrTrims(true)}
									className={`${
										hasPrintOrTrims
											? "border-[2px] border-main-blue-1"
											: "border-gray-2"
									} rounded-[10px] border bg-white p-[12px] text-subhead`}
								>
									있음
								</button>
								<button
									type="button"
									role="radio"
									aria-checked={hasPrintOrTrims === false}
									onClick={() => setHasPrintOrTrims(false)}
									className={`${
										!hasPrintOrTrims
											? "border-[2px] border-main-blue-1"
											: "border-gray-2"
									} rounded-[10px] border bg-white p-[12px] text-subhead`}
								>
									없음
								</button>
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
							selectedCodes={selWaterWashing}
							onToggle={(code) =>
								setSelWaterWashing((prev) => {
									const next = new Set(prev);
									next.has(code) ? next.delete(code) : next.add(code);
									return next;
								})
							}
						/>
					</FieldBlock>
				)}

				{step === 2 && (
					<>
						<FieldBlock label="표백">
							<SymbolCheckboxGrid
								name="bleaching"
								items={CARE_LABEL_SYMBOLS.laundrySymbol.bleaching}
								selectedCodes={selBleaching}
								onToggle={(code) =>
									setSelBleaching((prev) => {
										const next = new Set(prev);
										next.has(code) ? next.delete(code) : next.add(code);
										return next;
									})
								}
							/>
						</FieldBlock>
						<div className="h-[16px]" />
						<FieldBlock label="손으로 탈수">
							<SymbolCheckboxGrid
								name="wringing"
								items={CARE_LABEL_SYMBOLS.laundrySymbol.wringing}
								selectedCodes={selWringing}
								onToggle={(code) =>
									setSelWringing((prev) => {
										const next = new Set(prev);
										next.has(code) ? next.delete(code) : next.add(code);
										return next;
									})
								}
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
								selectedCodes={selNaturalDrying}
								onToggle={(code) =>
									setSelNaturalDrying((prev) => {
										const next = new Set(prev);
										next.has(code) ? next.delete(code) : next.add(code);
										return next;
									})
								}
							/>
						</FieldBlock>
						<div className="h-[16px]" />
						<FieldBlock label="기계건조">
							<SymbolCheckboxGrid
								name="tumbleDrying"
								items={CARE_LABEL_SYMBOLS.laundrySymbol.tumbleDrying}
								selectedCodes={selTumbleDrying}
								onToggle={(code) =>
									setSelTumbleDrying((prev) => {
										const next = new Set(prev);
										next.has(code) ? next.delete(code) : next.add(code);
										return next;
									})
								}
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
								selectedCodes={selDryCleaning}
								onToggle={(code) =>
									setSelDryCleaning((prev) => {
										const next = new Set(prev);
										next.has(code) ? next.delete(code) : next.add(code);
										return next;
									})
								}
							/>
						</FieldBlock>
						<div className="h-[16px]" />
						<FieldBlock label="웨트클리닝">
							<SymbolCheckboxGrid
								name="wetCleaning"
								items={CARE_LABEL_SYMBOLS.laundrySymbol.wetCleaning}
								selectedCodes={selWetCleaning}
								onToggle={(code) =>
									setSelWetCleaning((prev) => {
										const next = new Set(prev);
										next.has(code) ? next.delete(code) : next.add(code);
										return next;
									})
								}
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
						onClick={finishAndSeeSolution}
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
						className={`${
							active ? "border-[2px] border-main-blue-1" : "border-gray-2"
						} aspect-square rounded-[12px] border bg-white p-[12px] text-left text-dark-gray-2 transition-colors`}
					>
						<div className="mb-[6px] text-caption font-semibold opacity-80">
							{item.code}
						</div>
						<div className="line-clamp-5 text-body-2 leading-snug">
							{item.description}
						</div>
					</button>
				);
			})}
		</div>
	);
}
