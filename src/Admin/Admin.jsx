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
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

const ADMIN_EMAIL = "pawsensemain@gmail.com";

/* ================= HELPERS ================= */

const isValidImageUrl = (url) => {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      price: "",
      description: "",
      image: "",
    });
    setError("");
  };

  /* ================= SAVE / UPDATE ================= */

  const saveProduct = async () => {
    setError("");

    if (!form.name || !form.price || !form.description || !form.image) {
      setError("All fields are required.");
      return;
    }

    if (!isValidImageUrl(form.image)) {
      setError("Invalid image URL.");
      return;
    }

    try {
      setLoading(true);

      if (form.id) {
        await updateDoc(doc(db, "products", form.id), {
          name: form.name,
          price: form.price,
          description: form.description,
          image: form.image,
        });
      } else {
        await addDoc(collection(db, "products"), {
          name: form.name,
          price: form.price,
          description: form.description,
          image: form.image,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
      loadProducts();
    } catch {
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
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
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
    <div style={styles.page}>
      <h1 style={styles.title}>Admin Panel</h1>

      <p style={styles.user}>Logged in as: {user.email}</p>

      {/* ===== FORM ===== */}
      <div style={styles.card}>
        <h2>{form.id ? "Edit Product" : "Add Product"}</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          name="name"
          placeholder="Product name"
          value={form.name}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          style={styles.input}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          style={{ ...styles.input, height: 80 }}
        />

        <input
          name="image"
          placeholder="Image URL"
          value={form.image}
          onChange={handleChange}
          style={styles.input}
        />

        {isValidImageUrl(form.image) && (
          <img src={form.image} alt="preview" style={styles.preview} />
        )}

        <div style={styles.actions}>
          <button onClick={saveProduct} disabled={loading} style={styles.primary}>
            {loading ? "Saving..." : form.id ? "Update" : "Add"}
          </button>

          {form.id && (
            <button onClick={resetForm} style={styles.secondary}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ===== PRODUCTS ===== */}
      <div style={styles.grid}>
        {products.map((p) => (
          <div key={p.id} style={styles.product}>
            <img src={p.image} alt={p.name} style={styles.thumb} />
            <h3>{p.name}</h3>
            <p>₹{p.price}</p>

            <div style={styles.productActions}>
              <button onClick={() => editProduct(p)} style={styles.edit}>
                Edit
              </button>
              <button onClick={() => deleteProduct(p.id)} style={styles.delete}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: 20,
    maxWidth: 1100,
    margin: "auto",
  },
  title: {
    textAlign: "center",
  },
  user: {
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 15,
  },
  preview: {
    width: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  actions: {
    display: "flex",
    gap: 10,
  },
  primary: {
    flex: 1,
    padding: 12,
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  secondary: {
    flex: 1,
    padding: 12,
    background: "#ccc",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 20,
  },
  product: {
    background: "#fff",
    borderRadius: 12,
    padding: 15,
    textAlign: "center",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
  thumb: {
    width: "100%",
    height: 150,
    objectFit: "cover",
    borderRadius: 8,
  },
  productActions: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  edit: {
    flex: 1,
    padding: 8,
    background: "#2196F3",
    color: "#fff",
    border: "none",
    borderRadius: 6,
  },
  delete: {
    flex: 1,
    padding: 8,
    background: "#F44336",
    color: "#fff",
    border: "none",
    borderRadius: 6,
  },
};
