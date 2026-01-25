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

import { auth } from "../firebase";

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
            <li><span onClick={() => scrollTo("home")}>Home</span></li>
            <li><span onClick={() => scrollTo("toys")}>Toys</span></li>
            <li><span onClick={() => scrollTo("guide")}>Guide</span></li>
            <li><span onClick={() => scrollTo("aboutUs")}>About Us</span></li>
            <li><span onClick={() => scrollTo("contactUs")}>Contact Us</span></li>

            <li className="navbar-cart">
              <img
                src={cartlogo}
                alt="Cart"
                onClick={() => (user ? setShowCart(true) : setShowLogin(true))}
              />
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

/* ================= WHATSAPP CHECKOUT ================= */

const checkoutOnWhatsApp = (cart) => {
  if (!cart || cart.length === 0) return;

  let total = 0;
  const items = cart.map((item, i) => {
    const t = Number(item.price) * item.quantity;
    total += t;
    return `${i + 1}. ${item.name} × ${item.quantity} = ₹${t}`;
  });

  const msg = `
🐾 PawSense Order

${items.join("\n")}

--------------------
Total: ₹${total}
--------------------

Please confirm availability.
`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg.trim())}`,
    "_blank"
  );
};

/* ================= CART ================= */

function CartModal({ close }) {
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  const removeItem = (id) => {
    const updated = cart.filter((i) => i.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

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
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          ))}

          <button
            style={{
              marginTop: 14,
              background: "#25D366",
              color: "#fff",
              fontWeight: "bold",
            }}
            onClick={() => checkoutOnWhatsApp(cart)}
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
  const [info, setInfo] = useState("");

  const login = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      close();
    } catch {
      setError("Invalid email or password.");
    }
  };

  const resetPassword = async () => {
    if (!email) {
      setError("Enter your email first.");
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

  const saveProfile = async (e) => {
    e.preventDefault();
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
      <form onSubmit={saveProfile}>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit">Save</button>
      </form>

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
