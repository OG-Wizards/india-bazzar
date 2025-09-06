"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Addresstab from "@/app/components/AddressTab";

export default function SupplierProfile() {
  const [activeTab, setActiveTab] = useState("products");
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Fetch Supplier Data
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login");
      } else {
        setUser(firebaseUser);

        // Fetch supplier data
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        // Fetch supplier's products
        const q = query(
          collection(db, "products"),
          where("supplierId", "==", firebaseUser.uid)
        );
        const unsubscribeProducts = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setProducts(data);
          setLoading(false);
        });

        return () => unsubscribeProducts();
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  // ✅ Handle Edit Button
  const handleEditProduct = (product: any, index: number) => {
    setEditingIndex(index);
    setEditingProduct({ ...product });
  };

  // ✅ Handle Input Change While Editing
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setEditingProduct((prev: any) => ({
      ...prev,
      [name]: name === "price" || name === "quantity" ? Number(value) : value,
    }));
  };

  // ✅ Save Edited Product
  const handleSaveProduct = async () => {
    try {
      await updateDoc(doc(db, "products", editingProduct.id), {
        name: editingProduct.name,
        price: editingProduct.price,
        quantity: editingProduct.quantity,
        description: editingProduct.description,
      });

      setEditingIndex(null);
      setEditingProduct(null);
      alert("Product updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update product.");
    }
  };

  // ✅ Delete Product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", productId));
      alert("Product deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to delete product.");
    }
  };

  // ✅ Add New Address (Limit 3)
  const handleAddAddress = async () => {
    if (!newAddress.trim()) return alert("Please enter an address");

    const updatedAddresses = userData.addresses ? [...userData.addresses] : [];

    if (updatedAddresses.length >= 3) {
      alert("You can only add up to 3 addresses");
      return;
    }

    try {
      updatedAddresses.push(newAddress);

      await updateDoc(doc(db, "users", user.uid), {
        addresses: updatedAddresses,
      });

      setUserData({ ...userData, addresses: updatedAddresses });
      setNewAddress("");
      alert("Address added successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to add address.");
    }
  };

  // ✅ Delete Address
  const handleDeleteAddress = async (index: number) => {
    try {
      const updatedAddresses = [...userData.addresses];
      updatedAddresses.splice(index, 1);

      await updateDoc(doc(db, "users", user.uid), {
        addresses: updatedAddresses,
      });

      setUserData({ ...userData, addresses: updatedAddresses });
    } catch (error) {
      console.error(error);
      alert("Failed to delete address.");
    }
  };

  // ✅ Edit Address
  const handleEditAddress = (index: number) => {
    setEditingIndex(index);
    setNewAddress(userData.addresses[index]);
  };

  // ✅ Save Edited Address
  const handleSaveAddress = async () => {
    if (!newAddress.trim()) return alert("Please enter an address");

    try {
      const updatedAddresses = [...userData.addresses];
      updatedAddresses[editingIndex!] = newAddress;

      await updateDoc(doc(db, "users", user.uid), {
        addresses: updatedAddresses,
      });

      setUserData({ ...userData, addresses: updatedAddresses });
      setNewAddress("");
      setEditingIndex(null);
      alert("Address updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update address.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6"
     >
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 bg-white border px-4 py-2 rounded-xl shadow hover:bg-gray-200"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Supplier Profile
      </h1>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        {["products", "self", "address", "wallet"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === tab
                ? "bg-green-600 text-white"
                : "bg-white text-gray-800 border"
            }`}
          >
            {tab === "products" && "My Products"}
            {tab === "self" && "My Self"}
            {tab === "address" && "Address"}
            {tab === "wallet" && "Wallet"}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        {/* My Products */}
        {activeTab === "products" && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-black">My Products</h2>
            {loading ? (
              <p>Loading...</p>
            ) : products.length === 0 ? (
              <p>No products added yet.</p>
            ) : (
              <ul className="space-y-3">
                {products.map((p, index) => (
                  <li
                    key={p.id}
                    className="p-3 border rounded-lg"
                    style={{ background: "#DDEB9D" }}
                  >
                    {editingIndex === index ? (
                      // Editing Mode
                      <div className="space-y-2">
                        <input
                          type="text"
                          name="name"
                          value={editingProduct?.name}
                          onChange={handleInputChange}
                          className="border p-2 rounded w-full"
                        />
                        <input
                          type="number"
                          name="price"
                          value={editingProduct?.price}
                          onChange={handleInputChange}
                          className="border p-2 rounded w-full"
                        />
                        <input
                          type="number"
                          name="quantity"
                          value={editingProduct?.quantity}
                          onChange={handleInputChange}
                          className="border p-2 rounded w-full"
                        />
                        <textarea
                          name="description"
                          value={editingProduct?.description}
                          onChange={handleInputChange}
                          className="border p-2 rounded w-full"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveProduct}
                            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Normal View
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-lg text-black">{p.name}</h3>
                          <p className="text-lg text-black">₹{p.price}</p>
                          <p className="text-lg text-black">Qty(kg): {p.quantity}</p>
                          {p.description && (
                            <p className="text-gray-700">{p.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(p, index)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* My Self */}
        {activeTab === "self" && userData && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-black">My Details</h2>
            <p className="text-black"><strong>Name:</strong> {userData.name}</p>
            <p className="text-black"><strong>Email:</strong> {userData.email}</p>
            <p className="text-black"><strong>Phone:</strong> {userData.phone}</p>
            <p className="text-black"><strong>City:</strong> {userData.city}</p>
            <p className="text-black"><strong>GST No:</strong> {userData.gst || "Not provided"}</p>
            <p className="text-black"><strong>FSSAI No:</strong> {userData.fssai || "Not provided"}</p>
          </div>
        )}

        {/* Address */}
        {activeTab === "address" && (
          <div>
            <h1 className="text-2xl font-bold text-center text-black">Supplier Profile</h1>
            <Addresstab />
          </div>
        )}

        {/* Wallet */}
        {activeTab === "wallet" && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-black">Wallet</h2>
            <p className="text-lg text-black">Balance: ₹0.00</p>
            <p className="text-gray-600 mt-2">
              Wallet integration coming soon 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
