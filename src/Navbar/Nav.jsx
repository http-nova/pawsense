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
  deleteUser,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "../firebase";

const ADMIN_EMAIL = "pawsensemain@gmail.com";
const NAV_HEIGHT = 90;

/* ================= NAV ================= */

function Nav() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
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
      {/* ================= NAVBAR ================= */}
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
                onClick={() =>
                  user ? setShowCart(true) : setShowLogin(true)
                }
              />
            </li>
          </ul>

          <div className="navbar-actions">
            {user ? (
              <>
                {/* USER NAME ONLY */}
                <span
                  className="user-name"
                  onClick={() => setShowProfile(true)}
                  style={{ cursor: "pointer" }}
                >
                  Hi, {user.displayName || user.email}
                </span>

                {!user.emailVerified && (
                  <button onClick={() => sendEmailVerification(user)}>
                    Verify Email
                  </button>
                )}

                {user.email === ADMIN_EMAIL && (
                  <a href="admin">Admin</a>
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

      {/* ================= MODALS ================= */}
      {showLogin && <LoginModal close={() => setShowLogin(false)} />}
      {showSignup && <SignupModal close={() => setShowSignup(false)} />}
      {showProfile && <ProfileModal close={() => setShowProfile(false)} />}
      {showCart && <CartModal close={() => setShowCart(false)} />}
    </>
  );
}

export default Nav;

/* ================= LOGIN ================= */

function LoginModal({ close }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setError("");
    setInfo("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      close();
    } catch (e) {
      if (e.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (e.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setError("");
    setInfo("");

    if (!email) {
      setError("Enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setInfo("Password reset link sent to your email.");
    } catch {
      setError("Failed to send reset email.");
    }
  };

  return (
    <Modal title="Login" close={close}>
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

      {error && <Error text={error} />}
      {info && <p style={{ color: "green", fontSize: 14 }}>{info}</p>}

      <button onClick={login} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <button
        onClick={resetPassword}
        style={{
          background: "transparent",
          color: "#333",
          fontSize: 14,
          marginTop: 6,
        }}
      >
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
    } catch (e) {
      if (e.code === "auth/email-already-in-use") {
        setError("Email already in use.");
      } else if (e.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Unable to create account.");
      }
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

/* ================= PROFILE (NO AVATAR) ================= */

function ProfileModal({ close }) {
  const user = auth.currentUser;
  if (!user) return null;

  const [name, setName] = useState(user.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(user, { displayName: name });
      setStatus("Profile updated.");
    } catch {
      setError("Profile update failed.");
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      await updatePassword(user, newPassword);
      setStatus("Password updated.");
      setNewPassword("");
    } catch {
      setError("Re-login required.");
    }
  };

  const deleteAccountHandler = async () => {
    try {
      await deleteUser(user);
      close();
    } catch {
      setError("Re-login required.");
    }
  };

  return (
    <Modal title="Edit Profile" close={close}>
      <form onSubmit={saveProfile}>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit">Save</button>
      </form>

      <hr />

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={changePassword}>Change Password</button>

      <hr />

      <button
        onClick={deleteAccountHandler}
        style={{ background: "#ff5252", color: "#fff" }}
      >
        Delete Account
      </button>

      {status && <p style={{ color: "green" }}>{status}</p>}
      {error && <Error text={error} />}
    </Modal>
  );
}

/* ================= CART ================= */

function CartModal({ close }) {
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  return (
    <Modal title="Your Cart" close={close}>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cart.map((item) => (
          <div className="cart-item" key={item.id}>
            <span>{item.name}</span>
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </div>
        ))
      )}
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
