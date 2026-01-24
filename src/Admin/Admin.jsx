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

  /* ================= AUTH STATE ================= */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  /* ================= LOAD PRODUCTS ================= */

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  /* ================= FORM ================= */

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, imageFile: file });
  };

  /* ================= IMAGE UPLOAD (FIXED) ================= */

  const uploadImage = async (file) => {
    const imageRef = ref(
      storage,
      `products/${Date.now()}-${file.name}`
    );

    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

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
        imageUrl = await uploadImage(form.imageFile);
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

      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT / DELETE ================= */

  const editProduct = (p) => {
    setForm({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      image: p.image,
      imageFile: null,
    });
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      price: "",
      description: "",
      imageFile: null,
      image: "",
    });
  };

  /* ================= UI STATES ================= */

  if (authLoading) {
    return <p style={{ padding: 40 }}>Checking admin access…</p>;
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return <p style={{ padding: 40 }}>Unauthorized</p>;
  }

  /* ================= UI ================= */

  return (
    <div style={{ padding: 40, maxWidth: 1000 }}>
      <h1>Admin Panel</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        <input
          name="name"
          placeholder="Product Name"
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
          rows={3}
          value={form.description}
          onChange={handleChange}
        />

        <input type="file" accept="image/*" onChange={handleImageUpload} />

        <button onClick={saveProduct} disabled={loading}>
          {loading ? "Saving..." : "Save Product"}
        </button>
      </div>

      <table width="100%" border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                <img src={p.image} width="60" alt={p.name} />
              </td>
              <td>{p.name}</td>
              <td>₹{p.price}</td>
              <td>{p.description}</td>
              <td>
                <button onClick={() => editProduct(p)}>Edit</button>
                <button onClick={() => deleteProduct(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
