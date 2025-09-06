"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/firebase/config";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function AddressTab() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    pincode: "",
    flat: "",
    street: "",
    landmark: "",
    city: "",
    state: ""
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const user = auth.currentUser;
  const handleFetchLocation = async () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;

        // Fetch address from OpenStreetMap Nominatim API
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await response.json();

        if (data && data.address) {
          setForm((prev) => ({
            ...prev,
            flat: data.address.house_number || "",
            street: data.address.road || data.address.suburb || "",
            city: data.address.city || data.address.town || data.address.village || "",
            state: data.address.state || "",
            pincode: data.address.postcode || ""
          }));
          alert("Location fetched successfully!");
        } else {
          alert("Couldn't fetch address details.");
        }
      } catch (error) {
        alert("Failed to fetch location. Please try again.");
      }
    },
    () => {
      alert("Unable to fetch location. Please allow location access.");
    }
  );
};
 const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setForm((prev) => ({ ...prev, pincode: value }));

  // Fetch city & state only when pincode is 6 digits
  if (value.length === 6) {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${value}`);
      const data = await response.json();

      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setForm((prev) => ({
          ...prev,
          city: postOffice.District,
          state: postOffice.State,
        }));
      } else {
        alert("Invalid Pincode. Please enter a valid one.");
      }
    } catch (error) {
      console.error("Error fetching pincode details:", error);
      alert("Failed to fetch city and state.");
    }
  }
};


  // Fetch all saved addresses
  const fetchAddresses = async () => {
    if (!user) return;
    const querySnapshot = await getDocs(collection(db, "suppliers", user.uid, "addresses"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setAddresses(data);
  };

  // Save or Update address
  const handleSave = async (e: any) => {
    e.preventDefault();
    if (!user) return alert("Please log in first");

    if (editId) {
      await updateDoc(doc(db, "suppliers", user.uid, "addresses", editId), form);
      alert("Address updated successfully!");
      setEditId(null);
    } else {
      if (addresses.length >= 3) {
        alert("You can only save up to 3 addresses!");
        return;
      }
      await addDoc(collection(db, "suppliers", user.uid, "addresses"), form);
      alert("Address added successfully!");
    }

    setForm({
      fullName: "",
      mobile: "",
      pincode: "",
      flat: "",
      street: "",
      landmark: "",
      city: "",
      state: ""
    });

    fetchAddresses();
  };

  // Delete address
  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "suppliers", user.uid, "addresses", id));
    fetchAddresses();
  };

  // Edit address → pre-fill form
  const handleEdit = (addr: any) => {
    setForm({
      fullName: addr.fullName,
      mobile: addr.mobile,
      pincode: addr.pincode,
      flat: addr.flat,
      street: addr.street,
      landmark: addr.landmark,
      city: addr.city,
      state: addr.state
    });
    setEditId(addr.id);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setForm({
      fullName: "",
      mobile: "",
      pincode: "",
      flat: "",
      street: "",
      landmark: "",
      city: "",
      state: ""
    });
    setEditId(null);
  };

  // Get current location and auto-fill fields
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Use OpenStreetMap API (Free)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();

          if (data && data.address) {
            setForm((prev) => ({
              ...prev,
              pincode: data.address.postcode || prev.pincode,
              city: data.address.city || data.address.town || data.address.village || prev.city,
              state: data.address.state || prev.state,
              street: data.address.road || prev.street
            }));
            alert("Location fetched successfully!");
          } else {
            alert("Unable to fetch address details");
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          alert("Failed to fetch location details");
        }

        setLoadingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to fetch your location");
        setLoadingLocation(false);
      }
    );
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-black">{editId ? "Edit Address" : "Add New Address"}</h2>

      {/* Address Form */}
      <form onSubmit={handleSave} className="grid grid-cols-2 gap-4 text-black">
        <input className="border p-2 rounded" placeholder="Full Name"
          value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Mobile"
          value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
       <input
  type="text"
  name="pincode"
  value={form.pincode}
  onChange={handlePincodeChange}
  maxLength={6}
  placeholder="Enter Pincode"
  className="w-full p-2 border rounded"
/>

        <input className="border p-2 rounded" placeholder="Flat / House No."
          value={form.flat} onChange={(e) => setForm({ ...form, flat: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Street / Locality"
          value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Landmark"
          value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
        <input className="border p-2 rounded" placeholder="City"
          value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input className="border p-2 rounded" placeholder="State"
          value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />

        <div className="col-span-2 flex gap-3">
          <button
  type="button"
  onClick={handleFetchLocation}
  className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 mt-2"
>
  📍 Use Current Location
</button>


          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {editId ? "Update Address" : "Save Address"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Saved Addresses */}
      <h3 className="text-xl font-semibold mt-6 mb-2 text-black">Saved Addresses</h3>
      <div className="space-y-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="border p-4 rounded flex justify-between items-center text-black">
            <div>
              <p className="font-bold">{addr.fullName}</p>
              <p>{addr.flat}, {addr.street}</p>
              <p>{addr.city} - {addr.pincode}</p>
              <p>{addr.state}</p>
              <p>📞 {addr.mobile}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(addr)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(addr.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
