const BASE_URL =
	(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") + "/payments";

export const sendPayment = async (formData: FormData) => {
	const fullName = formData.get("fullName")?.toString();
	const section = formData.get("section")?.toString();
	const month = formData.get("month")?.toString();
	const begenaId = formData.get("begenaId")?.toString();
	const batch = formData.get("batch")?.toString();
	const screenshot = formData.get("screenshot");

	// Validation
	if (!fullName?.trim()) return { error: "Full name is required" };
	if (!begenaId?.trim()) return { error: "Begena ID is required" };
	if (!section) return { error: "Section is required" };
	if (!batch) return { error: "Batch is required" };
	if (!month) return { error: "Month is required" };
	if (!screenshot || !(screenshot instanceof File) || screenshot.size === 0) {
		return { error: "Payment screenshot image is required" };
	}

	try {
		const response = await fetch(BASE_URL, {
			method: "POST",
			body: formData,
		});

		const data = await response.json();

		if (!response.ok) {
			return { error: data.message || `Server error: ${response.status}` };
		}

		return data;
	} catch (error) {
		console.error("API Submission Error:", error);
		return {
			error: "Could not connect to the server. Please check your connection.",
		};
	}
};
