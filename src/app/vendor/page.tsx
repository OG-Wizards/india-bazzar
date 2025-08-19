"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  Timestamp,
  addDoc,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { toast } from "sonner";
import  Button  from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Search, Mic, ShoppingCart, X } from "lucide-react";
import { useRouter } from "next/navigation";  // ✅ import router
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  createdAt: Date;
}

interface Review {
  id: string;
  productId: string;
  text: string;
  createdAt: Date;
}

const VendorDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  const [reviewText, setReviewText] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const recognitionRef = useRef<any>(null);
  const [listening, setListening] = useState(false);

  const reviewUnsubscribers = useRef<Record<string, () => void>>({});

  // ✅ Voice search setup
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        toast.success("Voice input captured!");
      };

      recognition.onend = () => setListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  // ✅ Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data: Product[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
          createdAt: (doc.data().createdAt as Timestamp)?.toDate() ?? new Date(),
        }));
        setProducts(data);
        setFiltered(data);

        data.forEach((product) => {
          listenReviews(product.id);
        });
      } catch (err) {
        console.error("Error fetching products:", err);
        toast.error("Failed to load products");
      }
    };

    fetchProducts();

    return () => {
      Object.values(reviewUnsubscribers.current).forEach((unsub) => unsub());
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // ✅ Listen to reviews
  const listenReviews = (productId: string) => {
    const q = query(
      collection(db, "reviews"),
      where("productId", "==", productId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Review[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() ?? new Date(),
      }));
      setReviews((prev) => ({ ...prev, [productId]: data }));
    });

    reviewUnsubscribers.current[productId] = unsubscribe;
  };

  // ✅ Submit review
  const submitReview = async (productId: string) => {
    const text = reviewText[productId]?.trim();
    if (!text) {
      toast.error("Please enter a review.");
      return;
    }
    try {
      await addDoc(collection(db, "reviews"), {
        productId,
        text,
        createdAt: new Date(),
      });

      setReviewText((prev) => ({ ...prev, [productId]: "" }));
      toast.success("Review submitted!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review.");
    }
  };


const router = useRouter();

const handleBuyNow = (product: any) => {
  // For now, redirect to checkout page with product details
  router.push(`/checkout?productId=${product.id}&name=${product.name}&price=${product.price}`);
};



  // ✅ Cart actions
  const addToCart = (product: Product) => {
    setCart((prev) => [...prev, product]);
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removed from cart");
  };

  // ✅ Mic
  const toggleMic = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not supported");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  // ✅ Search
  useEffect(() => {
    const filteredProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFiltered(filteredProducts);
  }, [searchQuery, products]);

  return (
    <div className="p-6 min-h-screen text-black" style={{ background: "#BBDCE5" }}>
      <h1
        className="text-3xl font-bold mb-6 text-center"
        style={{ color: "#000405ff" }}
      >
        Vendor Dashboard
      </h1>

      {/* Search */}
      <div
        className="flex items-center gap-2 mb-6 max-w-lg mx-auto text-white"
        style={{ background: "#BBDCE5" }}
      >
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button
          className="mt-3 text-black"
          style={{ background: "#CFAB8D" }}
          onClick={toggleMic}
          variant="outline"
        >
          <Mic className={listening ? "text-red-500" : ""} />
        </Button>
      </div>

      {/* Floating Cart Button */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed top-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <ShoppingCart />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-2">
            {cart.length}
          </span>
        )}
      </button>

      {/* Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product) => (
          <Card
            key={product.id}
            className="shadow-md"
            style={{ backgroundColor: "#ECEEDF" }}
          >
            <CardContent className="p-4">
              <h2 className="text-black font-semibold">{product.name}</h2>
              <p className="text-black">{product.description}</p>
              <p className="font-bold mt-2 text-black">₹{product.price}</p>
              {(product as any).location && (
  <a
    href={`https://www.google.com/maps?q=${(product as any).location.latitude},${(product as any).location.longitude}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 underline mt-1 block"
  >
    📍 View Supplier Location
  </a>
)}

              <Button
                className="mt-3 text-black"
                style={{ background: "#D9C4B0" }}
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </Button> 
             <Button 
  className="mt-3 bg-green-600 text-white hover:bg-green-700"
  onClick={() => handleBuyNow(product)}
>
  Buy Now
</Button>



              {/* Reviews */}
              <div className="mt-4 text-black">
                <h3 className="font-bold">Reviews:</h3>
               <div 
  className="space-y-2 max-h-32 overflow-y-auto border p-2 rounded"
  style={{ backgroundColor: "#F9F3EE", borderColor: "#D9C4B0" }} // box color + border color
>
  {(reviews[product.id] || []).map((review) => (
    <p 
      key={review.id} 
      className="text-sm" 
      style={{ color: "#4A2C2A" }} // text color
    >
      {review.text}
    </p>
  ))}
</div>

                <div className="flex gap-2 mt-2">
              
                  <Input
                    placeholder="Write a review..."
                    value={reviewText[product.id] || ""}
                    onChange={(e) =>
                      setReviewText((prev) => ({
                        ...prev,
                        [product.id]: e.target.value,
                      }))
                    }
                  />
                  <Button
                    className="mt-3 text-black"
                    style={{ background: "#D9C4B0" }}
                    onClick={() => submitReview(product.id)}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-4 z-50">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xl font-bold">Your Cart</h2>
            <button onClick={() => setShowCart(false)}>
              <X className="text-red-600" />
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {cart.length === 0 ? (
              <p className="text-gray-500">Cart is empty</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm">₹{item.price}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
