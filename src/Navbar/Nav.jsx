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

/* ================= NAV ================= */

function Nav() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);

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
            <li onClick={() => scrollTo("home")}>Home</li>
            <li onClick={() => scrollTo("toys")}>Toys</li>
            <li onClick={() => scrollTo("guide")}>Guide</li>
            <li onClick={() => scrollTo("aboutUs")}>About Us</li>
            <li onClick={() => scrollTo("contactUs")}>Contact Us</li>

            <li className="navbar-cart" onClick={() =>
              user ? setShowCart(true) : setShowLogin(true)
            }>
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
                  <button onClick={() => window.location.hash = "#/admin"}>
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

/* ================= CART MODAL ================= */

function CartModal({ cart, user, close }) {
  const updateQty = async (id, delta) => {
    const updated = cart
      .map((i) =>
        i.id === id
          ? { ...i, quantity: i.quantity + delta }
          : i
      )
      .filter((i) => i.quantity > 0);

    await updateDoc(doc(db, "cart", user.uid), {
      items: updated,
    });
  };

  const total = cart.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <Modal title="Your Cart" close={close}>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <span>
                {item.name} × {item.quantity}
              </span>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => updateQty(item.id, -1)}>-</button>
                <button onClick={() => updateQty(item.id, 1)}>+</button>
              </div>
            </div>
          ))}

          <hr />
          <b>Total: ₹{total}</b>
        </>
      )}
    </Modal>
  );
}

/* ================= LOGIN ================= */

function LoginModal({ close }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const login = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      close();
    } catch (e) {
      if (e.code === "auth/user-not-found") {
        setError("No account found. Please sign up.");
      } else if (e.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Login failed.");
      }
    }
  };

  const resetPassword = async () => {
    if (!email) {
      setError("Enter email first.");
      return;
    }
    await sendPasswordResetEmail(auth, email);
    setInfo("Password reset email sent.");
  };

  return (
    <Modal title="Login" close={close}>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

      {error && <Error text={error} />}
      {info && <p style={{ color: "green" }}>{info}</p>}

      <button onClick={login}>Login</button>
      <button onClick={resetPassword} style={{ background: "transparent" }}>
        Forgot password?
      </button>
    </Modal>
  );
}

/* ================= SIGNUP ================= */

function SignupModal({ close }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const signup = async () => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: username });
      await sendEmailVerification(res.user);
      close();
    } catch {
      setError("Signup failed.");
    }
  };

  return (
    <Modal title="Sign Up" close={close}>
      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      {error && <Error text={error} />}
      <button onClick={signup}>Create Account</button>
    </Modal>
  );
}

/* ================= PROFILE ================= */

function ProfileModal({ close }) {
  const user = auth.currentUser;
  const [name, setName] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const saveProfile = async () => {
    await updateProfile(user, { displayName: name });
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      setError("Password too short.");
      return;
    }
    await updatePassword(user, newPassword);
  };

  return (
    <Modal title="Edit Profile" close={close}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={saveProfile}>Save</button>

      <input
        type="password"
        placeholder="New Password"
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={changePassword}>Change Password</button>

      {error && <Error text={error} />}
    </Modal>
  );
}

/* ================= UI HELPERS ================= */

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

function Error({ text }) {
  return <p style={{ color: "#d32f2f", fontSize: 14 }}>{text}</p>;
}
