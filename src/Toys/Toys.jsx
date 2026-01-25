import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import "./Toys.css";


function Toys() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  /* ================= LOAD PRODUCTS ================= */

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "products"));
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD TO CART ================= */

  const addToCart = async (product) => {
    const user = auth.currentUser;

    if (!user) {
      setMessage("Please login to add items to cart.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    const cartRef = doc(db, "cart", user.uid);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      const items = cartSnap.data().items || [];
      const index = items.findIndex(i => i.id === product.id);

      if (index !== -1) {
        items[index].quantity += 1;
      } else {
        items.push({ ...product, quantity: 1 });
      }

      await updateDoc(cartRef, { items });
    } else {
      await setDoc(cartRef, {
        items: [{ ...product, quantity: 1 }],
      });
    }

    setMessage("Added to cart ✔");
    setTimeout(() => setMessage(""), 2000);
  };

  /* ================= UI ================= */

  return (
    <section className="toys-section" id="toys">
      <h1>Pet Toys</h1>

      {message && (
        <p style={{ textAlign: "center", color: "#2e7d32" }}>
          {message}
        </p>
      )}

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading products…</p>
      ) : products.length === 0 ? (
        <p style={{ textAlign: "center" }}>No products available.</p>
      ) : (
        <div className="Toys-card">
          {products.map((p) => (
            <div className="Toys-box" key={p.id}>
              <div className="toy-img">
                <img src={p.image} alt={p.name} />
              </div>

              <div className="toy-content">
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <div className="price">₹{p.price}</div>

                <button onClick={() => addToCart(p)}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Toys;
