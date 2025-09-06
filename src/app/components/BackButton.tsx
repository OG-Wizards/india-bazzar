"use client";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Pages where we HIDE the back button
  const hideOnPages = ["/", "/login", "/signup"];

  if (hideOnPages.includes(pathname)) {
    return null; // Hide button on specific pages
  }

  return (
    <button
      onClick={() => router.back()}
      className="fixed top-4 left-4 flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl shadow hover:bg-gray-200 transition z-50"
    >
      <ArrowLeft size={18} />
      Back
    </button>
  );
}
