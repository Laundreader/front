import { cn } from "@/lib/utils";

const STEP_LABELS = ["라벨스캔", "의류스캔", "정보확인"] as const;

type StepperProps = {
	total: number;
	current: number;
	className?: string;
};

export const Stepper = ({ total, current, className }: StepperProps) => {
	return (
		<div className={cn("flex items-center", className)}>
			{[...new Array(total)].map((_, i) => {
				if (i + 1 < current) {
					return <PrevStep key={i} />;
				} else if (i + 1 === current) {
					return <CurrStep key={i} step={i + 1} />;
				} else {
					return <NextStep key={i} />;
				}
			})}
		</div>
	);
};

const PrevStep = () => {
	return (
		<div className="flex items-center">
			<div className="flex size-3 items-center justify-center rounded-full bg-main-blue-1"></div>
			<div className="w-4 border border-dashed border-main-blue-1"></div>
		</div>
	);
};

const CurrStep = ({ step }: { step: number }) => {
	return (
		<div className="flex items-center gap-2 not-first:ml-1 not-last:mr-1">
			<div className="flex size-4.5 items-center justify-center rounded-full bg-main-blue-1">
				<span className="text-caption font-semibold text-white">{step}</span>
			</div>
			<span className="text-body-2 font-semibold text-deep-blue">
				{STEP_LABELS[step - 1]}
			</span>
		</div>
	);
};

const NextStep = () => {
	return (
		<div className="flex items-center">
			<div className="w-4 border border-dashed border-gray-2"></div>
			<div className="flex size-3 items-center justify-center rounded-full bg-gray-2"></div>
		</div>
	);
};
