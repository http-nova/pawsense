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

import { auth, db } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

const ADMIN_EMAIL = "pawsensemain@gmail.com";
const NAV_HEIGHT = 90;
const WHATSAPP_NUMBER = "9172200424";

/* ================= NAV ================= */

function Nav() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - NAV_HEIGHT;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <img src={imglogo} alt="PawSense" />
        </div>

        <ul className="navbar-links">
          <li onClick={() => scrollTo("home")}>Home</li>
          <li onClick={() => scrollTo("toys")}>Toys</li>
          <li onClick={() => scrollTo("aboutUs")}>About</li>
          <li onClick={() => scrollTo("contactUs")}>Contact</li>

          <li className="navbar-cart">
            <img
              src={cartlogo}
              alt="Cart"
              onClick={() => user ? setShowCart(true) : setShowLogin(true)}
            />
          </li>
        </ul>

        <div className="navbar-actions">
          {user ? (
            <>
              <span onClick={() => setShowProfile(true)}>
                Hi, {user.displayName || user.email}
              </span>

              {user.email === ADMIN_EMAIL && (
                <a href="#/admin">Admin</a>
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
      </nav>

      {showLogin && <LoginModal close={() => setShowLogin(false)} />}
      {showSignup && <SignupModal close={() => setShowSignup(false)} />}
      {showProfile && <ProfileModal close={() => setShowProfile(false)} />}
      {showCart && <CartModal close={() => setShowCart(false)} />}
    </>
  );
}

export default Nav;

/* ================= CART ================= */

function CartModal({ close }) {
  const [cart, setCart] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "cart", user.uid);
    return onSnapshot(ref, (snap) => {
      setCart(snap.exists() ? snap.data().items : []);
    });
  }, [user]);

  const removeItem = async (id) => {
    const updated = cart.filter(i => i.id !== id);
    await updateDoc(doc(db, "cart", user.uid), { items: updated });
  };

  const checkoutOnWhatsApp = () => {
    let total = 0;
    const text = cart.map((i, idx) => {
      const t = i.price * i.quantity;
      total += t;
      return `${idx + 1}. ${i.name} × ${i.quantity} = ₹${t}`;
    }).join("\n");

    const msg = `🐾 PawSense Order\n\n${text}\n\nTotal: ₹${total}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <Modal title="Your Cart" close={close}>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map(i => (
            <div className="cart-item" key={i.id}>
              <span>{i.name} × {i.quantity}</span>
              <button onClick={() => removeItem(i.id)}>Remove</button>
            </div>
          ))}

          <button
            style={{ background: "#25D366", color: "#fff" }}
            onClick={checkoutOnWhatsApp}
          >
            Checkout on WhatsApp
          </button>
        </>
      )}
    </Modal>
  );
}

/* ================= AUTH MODALS ================= */

function LoginModal({ close }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Modal title="Login" close={close}>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={() => signInWithEmailAndPassword(auth, email, password).then(close)}>
        Login
      </button>
      <button onClick={() => sendPasswordResetEmail(auth, email)}>
        Forgot Password
      </button>
    </Modal>
  );
}

function SignupModal({ close }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const signup = async () => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, { displayName: name });
    await sendEmailVerification(res.user);
    close();
  };

  return (
    <Modal title="Sign Up" close={close}>
      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={signup}>Create Account</button>
    </Modal>
  );
}

function ProfileModal({ close }) {
  const user = auth.currentUser;
  const [name, setName] = useState(user?.displayName || "");

  return (
    <Modal title="Profile" close={close}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => updateProfile(user, { displayName: name })}>
        Save
      </button>
      <button onClick={() => updatePassword(user, prompt("New password"))}>
        Change Password
      </button>
    </Modal>
  );
}

/* ================= UI ================= */

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
