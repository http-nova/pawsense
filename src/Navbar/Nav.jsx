import { useEffect, useState } from "react";
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
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

const ADMIN_EMAIL = "pawsensemain@gmail.com";
const NAV_HEIGHT = 90;
const WHATSAPP_NUMBER = "9172200424";

/* ================= NAV ================= */

function Nav() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCart, setShowCart] = useState(false);

  /* ================= AUTH ================= */

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) listenToCart(u.uid);
      else {
        setCart([]);
        setCartCount(0);
      }
    });
  }, []);

  /* ================= CART LISTENER ================= */

  const listenToCart = (uid) => {
    const ref = doc(db, "cart", uid);

    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setCart([]);
        setCartCount(0);
        return;
      }

      const items = snap.data().items || [];
      setCart(items);

      const totalQty = items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      setCartCount(totalQty);
    });
  };

  /* ================= SCROLL ================= */

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const y =
      el.getBoundingClientRect().top +
      window.pageYOffset -
      NAV_HEIGHT;

    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <img src={imglogo} alt="PawSense Logo" />
        </div>

        <div className="navbar-options">
          <ul className="navbar-links">
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#toys">Toys</a>
            </li>
            <li>
              <a href="#guide">Guide</a>
            </li>
            <li>
              <a href="#aboutUs">About Us</a>
            </li>
            <li>
              <a href="#contactUs">Contact Us</a>
            </li>
            <li className="navbar-cart" onClick={handleCartClick}>
              <img src={cartlogo} alt="Cart" />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </li>
          </ul>

          <div className="navbar-actions">
            {user ? (
              <>
                <span className="user-name">Hi, {user.name}</span>
                <button onClick={logout}>Logout</button>
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
      {showCart && (
        <CartModal
          cart={cart}
          user={user}
          close={() => setShowCart(false)}
        />
      )}
    </>
  );
}

export default Nav;

/* ================= LOGIN MODAL ================= */

function LoginModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const found = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!found) {
      alert("Invalid email or password");
      return;
    }

    localStorage.setItem("user", JSON.stringify(found));
    onClose();
    window.location.reload();
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
        <h2>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>
      </div>
    </div>
  );
}

/* ================= SIGNUP ================= */

function SignupModal({ close }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.some((u) => u.email === email)) {
      alert("User already exists");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("user", JSON.stringify(newUser));

    onClose();
    window.location.reload();
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
        <h2>Sign Up</h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={signup}>Create Account</button>
      </div>
    </div>
  );
}

/* ================= CART MODAL ================= */

function CartModal({ onClose }) {
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

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

function Error({ text }) {
  return <p style={{ color: "#d32f2f", fontSize: 14 }}>{text}</p>;
}
