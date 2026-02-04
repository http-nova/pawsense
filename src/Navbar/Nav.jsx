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
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);

      if (cartUnsubRef.current) cartUnsubRef.current();

      if (u) {
        cartUnsubRef.current = onSnapshot(
          doc(db, "cart", u.uid),
          (snap) => {
            const items = snap.exists() ? snap.data().items || [] : [];
            setCart(items);
            setCartCount(items.reduce((s, i) => s + i.quantity, 0));
          }
        );
      } else {
        setCart([]);
        setCartCount(0);
      }
    });

    return () => {
      unsub();
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
        {/* LOGO */}
        <div className="navbar-logo">
          <img src={imglogo} alt="PawSense Logo" />
        </div>

        {/* RIGHT SIDE */}
        <div className="nav-right">
          {/* USER */}
          {user ? (
            <span
              className="nav-username"
              onClick={() => setShowProfile(true)}
            >
              Hi, {user.displayName || "User"}
            </span>
          ) : (
            <button
              className="nav-login-btn"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
          )}

          {/* CART */}
          <div
            className="navbar-cart"
            onClick={() => (user ? setShowCart(true) : setShowLogin(true))}
          >
            <img src={cartlogo} alt="Cart" />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
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
        </div>

        {/* MENU (LINKS ONLY) */}
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
          </ul>
        </div>
      </nav>

      {showLogin && <LoginModal close={() => setShowLogin(false)} />}
      {showSignup && <SignupModal close={() => setShowSignup(false)} />}
      {showProfile && <ProfileModal close={() => setShowProfile(false)} />}
      {showCart && (
        <CartModal cart={cart} user={user} close={() => setShowCart(false)} />
      )}
    </>
  );
}

export default Nav;

/* ================= CART ================= */

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
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
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
        </>
      )}
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
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => signInWithEmailAndPassword(auth, email, password)}>
        Login
      </button>
      <button onClick={() => close()}>Cancel</button>
    </Modal>
  );
}

function SignupModal({ close }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Modal title="Sign Up" close={close}>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={() =>
          createUserWithEmailAndPassword(auth, email, password)
        }
      >
        Create Account
      </button>
    </Modal>
  );
}

function ProfileModal({ close }) {
  const user = auth.currentUser;
  const [name, setName] = useState(user?.displayName || "");

  const save = async () => {
    await updateProfile(user, { displayName: name });
    close();
  };

  return (
    <Modal title="Profile" close={close}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={save}>Save</button>
      <button onClick={() => signOut(auth)}>Logout</button>
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
