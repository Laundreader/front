import type { CareLabelAnalysis } from "@/features/laundry/model";

export async function getCareLabelAnalysis({
	imageData,
	imageFormat,
}: {
	imageData: string;
	imageFormat: "png" | "jpg" | "jpeg";
}): Promise<CareLabelAnalysis> {
	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/label-analysis`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				image: {
					format: imageFormat,
					data: imageData,
				},
			}),
		},
	);

	if (!response.ok) {
		if (response.status === 400) {
			const errorData = await response.json();
			throw new Error(errorData.messages || "세탁 라벨을 인식할 수 없습니다.");
		}
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return await response.json();
}
