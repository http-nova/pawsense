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

/* ================= NAV ================= */

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

      if (cartUnsubRef.current) {
        cartUnsubRef.current();
        cartUnsubRef.current = null;
      }

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
        {/* LOGO */}

        <div className="navbar-logo">
          <img src={imglogo} alt="PawSense Logo" />
        </div>

                        {/* HAMBURGER MENU (LINKS ONLY) */}
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
                  {/* HAMBURGER */}
          <div
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

        {/* RIGHT SIDE (USER + CART + HAMBURGER) */}
        <div className="nav-right">
          {/* USER / LOGIN */}
          {user ? (
            <span
              className="nav-username"
              onClick={() => setShowProfile(true)}
            >
              Hi, {user.displayName || user.email}
            </span>
          ) : (
            <div className="auth-inline">
              <button onClick={() => setShowSignup(true)}>Sign Up</button>
              <button onClick={() => setShowLogin(true)}>Login</button>
            </div>
          )}

          {/* CART */}
          <div
            className="navbar-cart"
            onClick={() =>
              user ? setShowCart(true) : setShowLogin(true)
            }
          >
            <img src={cartlogo} alt="Cart" />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </div>


        </div>


      </nav>

      {/* MODALS */}
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

/* ================= WHATSAPP ================= */

const checkoutOnWhatsApp = (cart, user) => {
  if (!cart.length) return;

  const customer = user.displayName || user.email;
  let total = 0;

  const lines = cart.map((i, idx) => {
    const t = i.price * i.quantity;
    total += t;
    return `${idx + 1}. ${i.name} × ${i.quantity} = ₹${t}`;
  });

  const msg = `
🐾 PawSense Order
Customer: ${customer}

${lines.join("\n")}

Total: ₹${total}
`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
};

/* ================= CART MODAL ================= */

function CartModal({ cart, user, close }) {
  const updateQty = async (id, delta) => {
    const updated = cart
      .map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + delta } : i
      )
      .filter((i) => i.quantity > 0);

    await updateDoc(doc(db, "cart", user.uid), { items: updated });
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
              <span>{item.name} × {item.quantity}</span>
              <div>
                <button onClick={() => updateQty(item.id, -1)}>-</button>
                <button onClick={() => updateQty(item.id, 1)}>+</button>
              </div>
            </div>
          ))}

          <hr />
          <b>Total: ₹{total}</b>

          <button
            style={{
              marginTop: 14,
              background: "#25D366",
              color: "#fff",
              fontWeight: "bold",
            }}
            onClick={() => checkoutOnWhatsApp(cart, user)}
          >
            Checkout on WhatsApp
          </button>
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

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      close();
    } catch {
      setError("Invalid email or password.");
    }
  };

  return (
    <Modal title="Login" close={close}>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <Error text={error} />}
      <button onClick={login}>Login</button>
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
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <Error text={error} />}
      <button onClick={signup}>Create Account</button>
    </Modal>
  );
}

/* ================= PROFILE ================= */

function ProfileModal({ close }) {
  const user = auth.currentUser;
  const [name, setName] = useState(user?.displayName || "");

  const saveProfile = async () => {
    await updateProfile(user, { displayName: name });
  };

  return (
    <Modal title="Edit Profile" close={close}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={saveProfile}>Save</button>
      <button onClick={() => signOut(auth)}>Logout</button>
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

function Error({ text }) {
  return <p style={{ color: "#d32f2f", fontSize: 14 }}>{text}</p>;
}
