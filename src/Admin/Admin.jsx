import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const ADMIN_EMAIL = "pawsensemain@gmail.com";

function Admin() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id: null,
    name: "",
    price: "",
    description: "",
    imageFile: null,
    image: "",
  });

  /* ================= AUTH ================= */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  /* ================= LOAD PRODUCTS ================= */

  useEffect(() => {
    if (!authLoading && user?.email === ADMIN_EMAIL) {
      loadProducts();
    }
  }, [authLoading, user]);

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  /* ================= FORM ================= */

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = (e) =>
    setForm({ ...form, imageFile: e.target.files[0] });

  /* ================= SAFE IMAGE UPLOAD ================= */

  const uploadImageSafe = (file) =>
    new Promise((resolve, reject) => {
      onAuthStateChanged(auth, async (u) => {
        if (!u) {
          reject(new Error("Not authenticated"));
          return;
        }

        try {
          const imageRef = ref(
            storage,
            `products/${Date.now()}-${file.name}`
          );

          await uploadBytes(imageRef, file);
          const url = await getDownloadURL(imageRef);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      });
    });

  /* ================= SAVE PRODUCT ================= */

  const saveProduct = async () => {
    setError("");

    if (!form.name || !form.price || !form.description) {
      setError("Fill all fields.");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = form.image;

      if (form.imageFile) {
        imageUrl = await uploadImageSafe(form.imageFile);
      }

      if (form.id) {
        await updateDoc(doc(db, "products", form.id), {
          name: form.name,
          price: form.price,
          description: form.description,
          image: imageUrl,
        });
      } else {
        await addDoc(collection(db, "products"), {
          name: form.name,
          price: form.price,
          description: form.description,
          image: imageUrl,
          createdAt: serverTimestamp(),
        });
      }

      setForm({
        id: null,
        name: "",
        price: "",
        description: "",
        imageFile: null,
        image: "",
      });

      loadProducts();
    } catch (err) {
      console.error("SAVE PRODUCT ERROR:", err);
      setError(err.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  /* ================= GUARDS ================= */

  if (authLoading) {
    return <p style={{ padding: 40 }}>Checking admin access…</p>;
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return <p style={{ padding: 40 }}>Unauthorized</p>;
  }

  /* ================= UI ================= */

  return (
    <div style={{ padding: 40, maxWidth: 800 }}>
      <h1>Admin Panel</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        name="name"
        placeholder="Product name"
        value={form.name}
        onChange={handleChange}
      />

      <input
        name="price"
        placeholder="Price"
        value={form.price}
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />

      <input type="file" accept="image/*" onChange={handleImageUpload} />

      <button onClick={saveProduct} disabled={loading}>
        {loading ? "Saving..." : "Save Product"}
      </button>

      <hr />

      {products.map((p) => (
        <div key={p.id} style={{ marginBottom: 10 }}>
          <img src={p.image} width="60" alt={p.name} />
          <b> {p.name}</b> — ₹{p.price}
          <button onClick={() => deleteProduct(p.id)}>Delete</button>
        </div>
      ))}
      <p style={{ color: "blue", fontWeight: "bold" }}>
  Logged in as: {user?.email || "Not logged in"}
</p>

    </div>
  );
}

export default Admin;
