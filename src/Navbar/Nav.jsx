import { useEffect, useRef, useState } from "react";
import "./Nav.css";
import imglogo from "../assets/pawsense-logo.png";
import cartlogo from "../assets/cart.png";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";

import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const ADMIN_EMAIL = "pawsensemain@gmail.com";
const NAV_HEIGHT = 90;
const WHATSAPP_NUMBER = "9172200424";

function Nav() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const cartUnsubRef = useRef(null);

  /* ================= AUTH + CART ================= */

  useEffect(() => {
    const authUnsub = onAuthStateChanged(auth, (u) => {
      setUser(u);

      if (cartUnsubRef.current) cartUnsubRef.current();

      if (u) {
        const cartRef = doc(db, "cart", u.uid);
        cartUnsubRef.current = onSnapshot(cartRef, (snap) => {
          if (!snap.exists()) {
            setCart([]);
            setCartCount(0);
            return;
          }

          const items = snap.data().items || [];
          setCart(items);
          setCartCount(items.reduce((s, i) => s + i.quantity, 0));
        });
      } else {
        setCart([]);
        setCartCount(0);
      }
    });

    return () => {
      authUnsub();
      if (cartUnsubRef.current) cartUnsubRef.current();
    };
  }, []);

  /* ================= SCROLL ================= */

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const y =
      el.getBoundingClientRect().top +
      window.pageYOffset -
      NAV_HEIGHT;

    window.scrollTo({ top: y, behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <img src={imglogo} alt="PawSense Logo" />
        </div>

        {/* HAMBURGER */}
        <div
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={`navbar-options ${menuOpen ? "open" : ""}`}>
          <ul className="navbar-links">
            {["home", "toys", "guide", "aboutUs", "contactUs"].map((id) => (
              <li key={id} onClick={() => scrollTo(id)}>
                {id === "aboutUs"
                  ? "About Us"
                  : id === "contactUs"
                  ? "Contact Us"
                  : id.charAt(0).toUpperCase() + id.slice(1)}
              </li>
            ))}

            <li
              className="navbar-cart"
              onClick={() => (user ? setShowCart(true) : setShowLogin(true))}
            >
              <img src={cartlogo} alt="Cart" />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </li>
          </ul>

          <div className="navbar-actions">
            {user ? (
              <>
                <span
                  className="user-name"
                  onClick={() => setShowProfile(true)}
                >
                  Hi, {user.displayName || user.email}
                </span>

                {!user.emailVerified && (
                  <button onClick={() => sendEmailVerification(user)}>
                    Verify Email
                  </button>
                )}

                {user.email === ADMIN_EMAIL && (
                  <button onClick={() => (window.location.hash = "#/admin")}>
                    Admin
                  </button>
                )}

                <button onClick={() => signOut(auth)}>Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => setShowSignup(true)}>Sign Up</button>
                <button onClick={() => setShowLogin(true)}>Login</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {showLogin && <LoginModal close={() => setShowLogin(false)} />}
      {showSignup && <SignupModal close={() => setShowSignup(false)} />}
      {showProfile && <ProfileModal close={() => setShowProfile(false)} />}
      {showCart && <CartModal cart={cart} user={user} close={() => setShowCart(false)} />}
    </>
  );
}

export default Nav;

/* ================= CART ================= */

const checkoutOnWhatsApp = (cart, user) => {
  let total = 0;
  const lines = cart.map((i, idx) => {
    const t = i.price * i.quantity;
    total += t;
    return `${idx + 1}. ${i.name} × ${i.quantity} = ₹${t}`;
  });

  const msg = `🐾 PawSense Order\n\n${lines.join("\n")}\n\nTotal: ₹${total}`;
  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
};

function CartModal({ cart, user, close }) {
  const updateQty = async (id, delta) => {
    const updated = cart
      .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
      .filter((i) => i.quantity > 0);

    await updateDoc(doc(db, "cart", user.uid), { items: updated });
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <Modal title="Your Cart" close={close}>
      {cart.map((i) => (
        <div className="cart-item" key={i.id}>
          <span>{i.name} × {i.quantity}</span>
          <div>
            <button onClick={() => updateQty(i.id, -1)}>-</button>
            <button onClick={() => updateQty(i.id, 1)}>+</button>
          </div>
        </div>
      ))}
      <b>Total: ₹{total}</b>
      <button
        style={{ background: "#25D366", color: "#fff" }}
        onClick={() => checkoutOnWhatsApp(cart, user)}
      >
        Checkout on WhatsApp
      </button>
    </Modal>
  );
}

/* ================= MODALS ================= */

function LoginModal({ close }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Modal title="Login" close={close}>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={() => signInWithEmailAndPassword(auth, email, password)}>Login</button>
    </Modal>
  );
}

function SignupModal({ close }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Modal title="Sign Up" close={close}>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={() => createUserWithEmailAndPassword(auth, email, password)}>Create</button>
    </Modal>
  );
}

function ProfileModal({ close }) {
  return (
    <Modal title="Profile" close={close}>
      <p>Edit profile coming soon</p>
    </Modal>
  );
}

function Modal({ title, children, close }) {
  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={close}>✕</button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
