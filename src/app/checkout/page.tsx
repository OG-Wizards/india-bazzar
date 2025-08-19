"use client";

import { useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const price = searchParams.get("price") || "100"; // fallback

  const handlePayment = () => {
    const options = {
      key: "rzp_test_1DP5mmOlF5G5ag", // 🔹 Replace with Razorpay Test Key ID
      amount: Number(price) * 100, // Amount in paisa
      currency: "INR",
      name: "India Bazzar",
      description: `Purchase of ${name}`,
      handler: function (response: any) {
        alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
      },
      prefill: {
        name: "Test User",
        email: "test@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#33C0F5", // your custom theme color
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="mb-2"><strong>Product:</strong> {name}</p>
        <p className="mb-4"><strong>Price:</strong> ₹{price}</p>

        <button
          onClick={handlePayment}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
}
