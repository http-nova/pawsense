import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import "./Toys.css";

function Toys() {
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  /* ================= LOAD PRODUCTS ================= */

  useEffect(() => {
    fetchProducts();
    fetchBestSellers();
  }, []);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    setProducts(
      snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        expanded: false,
      }))
    );
    setLoading(false);
  };

  const fetchBestSellers = async () => {
    const q = query(
      collection(db, "products"),
      orderBy("clickCount", "desc"),
      limit(4)
    );

    const snap = await getDocs(q);
    setBestSellers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  /* ================= ADD TO CART ================= */

  const addToCart = async (product) => {
    const user = auth.currentUser;

    if (!user) {
      setMessage("Please login to add items to cart.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    /* 🔥 Update Click Count */
    const productRef = doc(db, "products", product.id);
    await updateDoc(productRef, {
      clickCount: (product.clickCount || 0) + 1,
    });

    /* Cart Logic */
    const cartRef = doc(db, "cart", user.uid);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      const items = cartSnap.data().items || [];
      const index = items.findIndex(i => i.id === product.id);

      if (index !== -1) items[index].quantity += 1;
      else items.push({ ...product, quantity: 1 });

      await updateDoc(cartRef, { items });
    } else {
      await setDoc(cartRef, {
        items: [{ ...product, quantity: 1 }],
      });
    }

    fetchBestSellers();

    setMessage("Added to cart ✔");
    setTimeout(() => setMessage(""), 2000);
  };

  /* ================= TOGGLE READ MORE ================= */

  const toggleReadMore = (id) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, expanded: !p.expanded } : p
      )
    );
  };

  /* ================= CARD UI ================= */

  const renderCards = (list, isBestSeller = false) => (
    <div className="Toys-card">
      {list.map(p => (
        <div className="Toys-box" key={p.id}>
          <div className="toy-img">
            <img src={p.image} alt={p.name} />
          </div>

          <div className="toy-content">
            <h3>{p.name}</h3>

            <p className={`toy-desc ${p.expanded ? "expanded" : ""}`}>
              {p.description}
            </p>

            {!isBestSeller && (
              <span
                className="read-more"
                onClick={() => toggleReadMore(p.id)}
              >
                {p.expanded ? "Read less" : "Read more"}
              </span>
            )}

            <div className="price">₹{p.price}</div>

            <button onClick={() => addToCart(p)}>
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  /* ================= UI ================= */

  return (
    <section className="toys-section" id="toys">
      <h1>Pet Toys</h1>

      {message && <p className="msg">{message}</p>}

      {loading ? <p className="center">Loading…</p> : renderCards(products)}

      {/* ⭐ BEST SELLERS */}
      <h1 className="best-title">Best Sellers</h1>

      {bestSellers.length === 0 ? (
        <p className="center">No best sellers yet.</p>
      ) : (
        renderCards(bestSellers, true)
      )}
    </section>
  );
}

export default Toys;
