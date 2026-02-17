import { redirect } from "next/navigation";
import toast from "react-hot-toast";

const BASE_URL = "https://begena-backend.onrender.com/api/payments";

export const sendPayment = async (formData: FormData) => {
	const fullName = formData.get("fullName")?.toString();
	const section = formData.get("section")?.toString();
	const imageUrl = formData.get("imageUrl")?.toString();
	const month = formData.get("month")?.toString();
	const begenaId = formData.get("begenaId")?.toString();
	const batch = formData.get("batch")?.toString();

	// Client-side validation
	if (!fullName?.trim()) throw new Error("Full name is required");
	if (!section) throw new Error("Section is required");
	if (!imageUrl) throw new Error("Payment screenshot is required");
	if (!month) throw new Error("Month is required");

	try {
		const response = await fetch(BASE_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				fullName: fullName.trim(),
				section,
				screenshot: imageUrl,
				month,
				begenaId,
				batch,
			}),
		});

		const data = await response.json();

		if (!response.ok) {
			let errorDetails = "Submission failed on the server";

			try {
				const errorData = await response.json();
				errorDetails = errorData.message || errorDetails;
			} catch (jsonError) {
				console.error("Error parsing JSON:", jsonError);
				errorDetails = `Server returned status ${response.status}`;
			}
			toast.error(`${errorDetails} please contact the admins"`);
			redirect("/");

		}

		return data;
	} catch (error) {
		console.error("API Submission Error:", error);
		throw error; 
	}
};

