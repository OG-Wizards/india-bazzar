'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/config';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function SupplierDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [product, setProduct] = useState({
    name: '',
    price: '',
    description: '',
    address: '',
    quantity: '',
  });
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async () => {
    if (!user) {
      alert('User not authenticated. Please login again.');
      return;
    }

    const { name, price, quantity, description, address } = product;

    if (!name || !price || !quantity || !address) {
      alert('All fields are required.');
      return;
    }

    try {
      await addDoc(collection(db, 'products'), {
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        description,
        address,
        supplierId: user.uid,
        createdAt: new Date(),
      });

      setProduct({
        name: '',
        price: '',
        description: '',
        address: '',
        quantity: '',
      });
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product.');
    }
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
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supplier Dashboard</h1>

      {/* Add Product Form */}
      <div className="grid gap-3 mb-6">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={product.name}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={product.price}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={product.quantity}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={product.description}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={product.address}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <button
          onClick={handleAddProduct}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Product
        </button>
      </div>

      {/* Product List */}
      <h2 className="text-xl font-semibold mb-2">Your Products</h2>
      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products listed yet.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="border p-3 rounded flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center"
            >
              <div>
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p>₹{p.price} per unit</p>
                <p>📦 Quantity: {p.quantity}</p>
                {p.description && (
                  <p className="text-sm text-gray-600">{p.description}</p>
                )}
                {p.address && (
                  <p className="text-sm text-gray-500">📍 {p.address}</p>
                )}
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
