import { CARE_SYMBOLS } from "@/entities/care-label/const";
import { useTempLaundry } from "@/entities/laundry/store/temp";
import { cn, symbolUrl } from "@/lib/utils";
import { useEffect, useRef, useState, type RefCallback } from "react";
import { toast, Toaster } from "sonner";
import ErrorIcon from "@/assets/icons/error.svg?react";
import CloseIcon from "@/assets/icons/close.svg?react";

export const ManualForm = ({
	onDone,
	onExit,
}: {
	onDone: () => void;
	onExit: () => void;
}) => {
	const tempLaundry = useTempLaundry();

	const [step, setStep] = useState(0); // 0: 기본정보, 1: 물세탁, 2: 표백/탈수, 3: 자연건조/기계건조, 4: 드라이/웨트
	const [selectedCareSymbolCodeSet, setSelectedCareSymbolCodeSet] = useState(
		() =>
			new Set<string>(
				tempLaundry.state?.laundrySymbols.map(
					(careSymbol) => careSymbol.code,
				) ?? [],
			),
	);

	const prevStepRef = useRef<number>(step);

	function stepBackward() {
		setStep((prev) => Math.max(0, prev - 1));
		prevStepRef.current = step;
	}
	function stepForward() {
		setStep((prev) => Math.min(4, prev + 1));
		prevStepRef.current = step;
	}

	useEffect(() => {
		if (step !== prevStepRef.current) {
			window.scrollTo({ top: 0, behavior: "smooth" });
			prevStepRef.current = step;
		}
	});

	function handleClickSymbol(code: string) {
		if (selectedCareSymbolCodeSet.has(code)) {
			selectedCareSymbolCodeSet.delete(code);
		} else {
			selectedCareSymbolCodeSet.add(code);
		}

		setSelectedCareSymbolCodeSet(new Set(selectedCareSymbolCodeSet));
		tempLaundry.set({
			laundrySymbols: Array.from(selectedCareSymbolCodeSet).map((code) => ({
				code,
				description: codeToDesc[code],
			})),
		});
	}

	return (
		<div className="grid min-h-dvh grid-rows-[auto_1fr] p-4">
			<nav className="flex items-center justify-end">
				<button onClick={onExit}>
					<CloseIcon />
					<span className="sr-only">직접 입력 취소</span>
				</button>
				{/* <Link to="/analysis">
				</Link> */}
			</nav>

			<div className="grid grid-rows-[auto_1fr_auto] gap-6">
				<div className="space-y-4">
					{/* 
						MARK: 스텝퍼
					*/}
					<div className="flex justify-start gap-3" aria-label="진행 단계">
						{Array.from({ length: 5 }).map((_, i) => (
							<span
								key={i}
								className={cn(
									"h-3 w-3 shrink-0 rounded-full",
									i <= step ? "bg-main-blue-1" : "bg-gray-2",
								)}
							/>
						))}
					</div>

					{/*
						MARK: 헤더
					*/}
					<header className="space-y-2">
						<h1 className="text-title-1 font-semibold text-black-2">
							세탁 정보 추가
						</h1>

						<div className="space-y-2 rounded-xl bg-gray-bluegray-1 p-4">
							<p className="text-body-1 font-semibold text-dark-gray-1">
								케어 라벨이 손상되어도 문제 없어요
							</p>
							<p className="text-body-2 text-dark-gray-2">
								라벨에 있는 기호를 보고 아래에서 해당하는 옵션을 선택하면
								케어라벨이 손상되어도 세탁 가이드를 제공해드려요. 앞에서 입력된
								정보도 수정할 수 있어요.
							</p>
						</div>
					</header>
				</div>

				{/*
					MARK: 본문
				*/}
				<section className="space-y-6">
					{/* 
						MARK: 기본 정보
				 	*/}
					{step === 0 && (
						<>
							<FieldBlock label="소재" htmlFor="materials">
								<input
									type="text"
									id="materials"
									name="materials"
									value={(tempLaundry.state?.materials ?? []).join(", ")}
									onChange={(e) => {
										tempLaundry.set({
											materials: e.target.value
												.split(",")
												.map((s) => s.trim())
												.filter(Boolean),
										});
									}}
									placeholder="'면' 또는 '면 60%, 폴리 40%'"
									className="mb-2 w-full rounded-[10px] border border-gray-bluegray-2 p-3 outline-none"
								/>
								<Helper>여러 소재가 섞여 있다면 모두 알려주세요.</Helper>
							</FieldBlock>

							<FieldBlock label="색상" htmlFor="color">
								<input
									type="text"
									id="color"
									name="color"
									value={tempLaundry.state?.color}
									onChange={(e) =>
										tempLaundry.set({ color: e.target.value.trim() })
									}
									placeholder="검정, 아이보리"
									className="w-full rounded-[10px] border border-gray-bluegray-2 p-3 outline-none"
								/>
							</FieldBlock>

							<FieldBlock label="옷 종류" htmlFor="type">
								<input
									type="text"
									id="type"
									name="type"
									value={tempLaundry.state?.type}
									onChange={(e) =>
										tempLaundry.set({ type: e.target.value.trim() })
									}
									placeholder="셔츠, 바지, 코트"
									className="w-full rounded-[10px] border border-gray-bluegray-2 p-3 outline-none"
								/>
							</FieldBlock>

							<FieldBlock label="프린트/장식 여부" htmlFor="hasPrintOrTrims">
								<div
									role="radiogroup"
									aria-label="프린트/장식 여부"
									className="space-x-4"
								>
									{(() => {
										const hasPrintOrTrims =
											tempLaundry.state?.hasPrintOrTrims ?? false;
										return (
											<>
												<button
													type="button"
													role="radio"
													aria-checked={hasPrintOrTrims}
													onClick={() =>
														tempLaundry.set({ hasPrintOrTrims: true })
													}
													className="h-14 w-27 rounded-[10px] border border-gray-2 bg-white p-3 text-subhead aria-checked:border-2 aria-checked:border-main-blue-1"
												>
													있음
												</button>
												<button
													type="button"
													role="radio"
													aria-checked={hasPrintOrTrims === false}
													onClick={() =>
														tempLaundry.set({ hasPrintOrTrims: false })
													}
													className="h-14 w-27 rounded-[10px] border border-gray-2 bg-white p-3 text-subhead aria-checked:border-2 aria-checked:border-main-blue-1"
												>
													없음
												</button>
											</>
										);
									})()}
								</div>
							</FieldBlock>
						</>
					)}

					{/* 
						MARK: 물세탁
 					*/}
					{step === 1 && (
						<FieldBlock label="물세탁">
							<CareSymbolCheckboxGrid
								name="물세탁"
								careSymbols={CARE_SYMBOLS.wash}
								selectedCareSymbolCodeSet={selectedCareSymbolCodeSet}
								onToggle={handleClickSymbol}
							/>
						</FieldBlock>
					)}

					{/* 
						MARK: 표백/탈수
 					*/}
					{step === 2 && (
						<>
							<FieldBlock label="표백">
								<CareSymbolCheckboxGrid
									name="표백"
									careSymbols={CARE_SYMBOLS.bleach}
									selectedCareSymbolCodeSet={selectedCareSymbolCodeSet}
									onToggle={handleClickSymbol}
								/>
							</FieldBlock>
							<FieldBlock label="손으로 탈수">
								<CareSymbolCheckboxGrid
									name="손으로 탈수"
									careSymbols={CARE_SYMBOLS.wring}
									selectedCareSymbolCodeSet={selectedCareSymbolCodeSet}
									onToggle={handleClickSymbol}
								/>
							</FieldBlock>
						</>
					)}

					{/* 
						MARK: 자연건조/기계건조
 					*/}
					{step === 3 && (
						<>
							<FieldBlock label="자연 건조">
								<CareSymbolCheckboxGrid
									name="자연 건조"
									careSymbols={CARE_SYMBOLS.naturalDry}
									selectedCareSymbolCodeSet={selectedCareSymbolCodeSet}
									onToggle={handleClickSymbol}
								/>
							</FieldBlock>
							<FieldBlock label="기계건조">
								<CareSymbolCheckboxGrid
									name="기계 건조"
									careSymbols={CARE_SYMBOLS.tumbleDry}
									selectedCareSymbolCodeSet={selectedCareSymbolCodeSet}
									onToggle={handleClickSymbol}
								/>
							</FieldBlock>
						</>
					)}

					{/* 
						MARK: 드라이/웨트
 					*/}
					{step === 4 && (
						<>
							<FieldBlock label="드라이클리닝">
								<CareSymbolCheckboxGrid
									name="드라이클리닝"
									careSymbols={CARE_SYMBOLS.dryClean}
									selectedCareSymbolCodeSet={selectedCareSymbolCodeSet}
									onToggle={handleClickSymbol}
								/>
							</FieldBlock>
							<FieldBlock label="웨트클리닝">
								<CareSymbolCheckboxGrid
									name="웨트클리닝"
									careSymbols={CARE_SYMBOLS.wetClean}
									selectedCareSymbolCodeSet={selectedCareSymbolCodeSet}
									onToggle={handleClickSymbol}
								/>
							</FieldBlock>
						</>
					)}
				</section>

				{/* 
					MARK: 푸터
				*/}
				<footer className="sticky bottom-0 -mx-4 -mb-4 grid grid-cols-2 gap-3 bg-white p-4 pt-5.5">
					<button
						disabled={step === 0}
						onClick={stepBackward}
						className={cn(
							"h-14 rounded-[10px] border border-gray-2 bg-white text-subhead font-medium text-dark-gray-2",
							"disabled:border-none disabled:bg-gray-bluegray-2 disabled:text-gray-1",
						)}
					>
						이전
					</button>
					{step < 4 ? (
						<button
							onClick={stepForward}
							className="h-14 rounded-[10px] bg-main-blue-1 text-white"
						>
							다음
						</button>
					) : (
						<button
							onClick={onDone}
							className="h-14 rounded-[10px] bg-main-blue-1 text-white"
						>
							다 골랐어요
						</button>
					)}
				</footer>
			</div>
		</div>
	);
};

function FieldBlock({
	ref,
	label,
	htmlFor,
	children,
}: {
	ref?: RefCallback<HTMLLabelElement>;
	label: string;
	htmlFor?: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label
				ref={ref}
				id={label}
				htmlFor={htmlFor}
				className="mb-4 block w-fit text-title-3 font-semibold text-dark-gray-1"
			>
				{label}
			</label>
			{children}
		</div>
	);
}

function Helper({ children }: { children: React.ReactNode }) {
	return <p className="text-caption text-gray-1">{children}</p>;
}

type CareSymbol = { code: string; description: string };

function CareSymbolCheckboxGrid({
	name,
	careSymbols,
	selectedCareSymbolCodeSet,
	onToggle,
}: {
	name: string;
	careSymbols: Array<CareSymbol>;
	selectedCareSymbolCodeSet: Set<string>;
	onToggle: (code: string) => void;
}) {
	return (
		<div role="group" aria-labelledby={name} className="grid grid-cols-3 gap-3">
			{careSymbols.map((careSymbol) => {
				const checked = selectedCareSymbolCodeSet.has(careSymbol.code);

				function handleToggle() {
					if (checked) {
						onToggle(careSymbol.code);
					} else {
						if (selectedCareSymbolCodeSet.size >= 6) {
							toast("최대 6개까지 선택할 수 있어요.", {
								icon: <ErrorIcon className="text-main-yellow" />,
								unstyled: true,
								classNames: {
									toast:
										"flex w-full items-center gap-2 rounded-xl bg-navy px-4 py-5",
									title: "font-medium text-subhead text-white text-inherit",
								},
							});
						} else {
							onToggle(careSymbol.code);
						}
					}
				}

				return (
					<button
						key={careSymbol.code}
						type="button"
						role="checkbox"
						aria-checked={checked}
						onClick={handleToggle}
						className="flex aspect-square items-center justify-center rounded-xl border border-gray-2 bg-white p-1 text-left text-dark-gray-2 transition-colors aria-checked:outline-2 aria-checked:outline-main-blue-1"
					>
						<img src={symbolUrl(careSymbol.code)} className="size-10/12" />
					</button>
				);
			})}

			<Toaster
				position="bottom-center"
				duration={1500}
				visibleToasts={1}
				offset={{ bottom: "6rem" }}
				mobileOffset={{ bottom: "6rem" }}
				style={{ fontFamily: "inherit" }}
			/>
		</div>
	);
}

const codeToDesc = Object.entries(CARE_SYMBOLS).reduce(
	(codeToDesc, [, careSymbols]) => {
		careSymbols.forEach(({ code, description }) => {
			codeToDesc[code] = description;
		});

		return codeToDesc;
	},
	{} as Record<string, string>,
);
