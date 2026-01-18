import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "firebase/firestore";

function Toys() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const addToCart = async (product) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login first");
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
        items: [{ ...product, quantity: 1 }]
      });
    }
  };

  return (
    <section className="toys-section">
      <h1>Pet Toys</h1>

      <div className="Toys-card">
        {products.map(p => (
          <div className="Toys-box" key={p.id}>
            <img src={p.image} />
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <div>${p.price}</div>
            <button onClick={() => addToCart(p)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Toys;
