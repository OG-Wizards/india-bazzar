"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function LoginBackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/"); // Redirect to Home if no previous page
    }
  };

  return (
    <button
      onClick={handleBack}
      className="absolute top-4 left-4 flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl shadow hover:bg-gray-200 transition"
    >
      <ArrowLeft size={18} />
      Back
    </button>
  );
}
