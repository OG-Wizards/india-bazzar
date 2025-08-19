'use client';
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/config';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  
  query,
  where,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function SupplierDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [product, setProduct] = useState({
    name: '',
    price: '',
    description: '',
    quantity: '',
  });  

  useEffect(() => {
  const fetchUserData = async () => {
    if (user) {
      const docRef = doc(db, "users", user.uid); // assuming you saved signup data in `users`
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    }
  };
  fetchUserData();
}, [user]);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };
  

  const handleAddProduct = async () => {
    if (!user) return alert("User not authenticated");

    if (!product.name || !product.price || !product.quantity) {
      return alert("All fields are required.");
    }

    // ✅ Get live location (stored in Firestore but not displayed here)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
      

        try {
          await addDoc(collection(db, "products"), {
            ...product,
            price: parseFloat(product.price),
            quantity: parseInt(product.quantity),
            supplierId: user.uid,
            supplierCity: userData.city,
            createdAt: new Date(),
            location: { latitude, longitude }, // store live location
          });

          setProduct({
            name: "",
            price: "",
            description: "",
            quantity: "",
          });
          alert("Product added with location!");
        } catch (err) {
          console.error(err);
          alert("Failed to add product.");
        }
      },
      (error) => {
        console.error(error);
        alert("Could not get location. Please allow location access.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
      } else {
        setUser(firebaseUser);

        const q = query(
          collection(db, 'products'),
          where('supplierId', '==', firebaseUser.uid)
        );

        const unsubscribeProducts = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(data);
          setLoading(false);
        });

        return () => unsubscribeProducts();
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  return (
    <div className="min-h-screen w-full p-6"
    style={{background:"#FFFDF6"}}>

    
      <h1 className="text-2xl text-black font-bold mb-4">Supplier Dashboard</h1>

      {/* Add Product Form */}
      <div className="grid gap-3 mb-6">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleChange}
          className="border p-2 rounded border-black text-black"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={product.price}
          onChange={handleChange}
          className="border p-2 rounded border-black text-black"
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={product.quantity}
          onChange={handleChange}
          className="border p-2 rounded border-black text-black"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={product.description}
          onChange={handleChange}
          className="border p-2 rounded border-black text-black"
        />
        <button
          onClick={handleAddProduct}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Product
        </button>
      </div>

      {/* Product List */}
      <h2 className="text-xl text-black font-semibold mb-2">Your Products</h2>
      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products listed yet.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="border p-3 rounded flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center border-black"
            style={{background:"#DDEB9D"}}>
              <div>
                <h3 className="font-bold text-lg text-black"
                >{p.name}</h3>
                <p className="text-sm text-gray-900">₹{p.price} per unit</p>
                <p className="text-sm text-gray-900">📦 Quantity: {p.quantity}</p>
                {p.description && (
                  <p className="text-sm text-gray-900">{p.description}</p>
                )}
                {/* 🚫 Address/Location removed */}
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
    
  );
  
}
