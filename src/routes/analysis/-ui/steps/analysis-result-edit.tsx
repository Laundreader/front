import { ManualForm } from "../manual-form";

export const AnalysisResultEdit = ({
	onDone,
	onExit,
}: {
	onDone: () => void;
	onExit: () => void;
}) => {
	return <ManualForm onDone={onDone} onExit={onExit} />;
};
