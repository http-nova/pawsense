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
      {/* ================= NAVBAR ================= */}
      <nav className="navbar">
        <div className="navbar-logo">
          <img src={imglogo} alt="PawSense Logo" />
        </div>

        <div className="navbar-options">
          <ul className="navbar-links">
            <li style={{ cursor: "pointer" }} onClick={() => scrollTo("home")}>Home</li>
            <li style={{ cursor: "pointer" }} onClick={() => scrollTo("toys")}>Toys</li>
            <li style={{ cursor: "pointer" }} onClick={() => scrollTo("guide")}>Guide</li>
            <li style={{ cursor: "pointer" }} onClick={() => scrollTo("aboutUs")}>About Us</li>
            <li style={{ cursor: "pointer" }} onClick={() => scrollTo("contactUs")}>Contact Us</li>

            <li className="navbar-cart">
              <img
                src={cartlogo}
                alt="Cart"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  user ? setShowCart(true) : setShowLogin(true)
                }
              />
            </li>
          </ul>

          <div className="navbar-actions">
            {user ? (
              <>
                <span
                  className="user-name"
                  style={{ cursor: "pointer" }}
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
                  <button onClick={() => window.location.href = "#/admin"}>
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

      {/* ================= MODALS ================= */}
      {showLogin && <LoginModal close={() => setShowLogin(false)} openSignup={() => {
        setShowLogin(false);
        setShowSignup(true);
      }} />}
      {showSignup && <SignupModal close={() => setShowSignup(false)} />}
      {showProfile && <ProfileModal close={() => setShowProfile(false)} />}
      {showCart && <CartModal close={() => setShowCart(false)} />}
    </>
  );
}

export default Nav;

/* ================= LOGIN ================= */

function LoginModal({ close, openSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const login = async () => {
    setError("");
    setInfo("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      close();
    } catch (e) {
      if (e.code === "auth/user-not-found") {
        setError("No account found. Please create an account.");
      } else if (e.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (e.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Login failed.");
      }
    }
  };

  const resetPassword = async () => {
    if (!email) {
      setError("Enter your email first.");
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
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

      {error && <Error text={error} />}
      {info && <p style={{ color: "green", fontSize: 14 }}>{info}</p>}

      <button onClick={login}>Login</button>
      <button onClick={resetPassword} style={{ background: "transparent" }}>
        Forgot Password?
      </button>

      <p style={{ fontSize: 13, textAlign: "center", cursor: "pointer" }} onClick={openSignup}>
        No account? <b>Create one</b>
      </p>
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
    setError("");

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: username });
      await sendEmailVerification(res.user);
      close();
    } catch (e) {
      if (e.code === "auth/email-already-in-use") {
        setError("Email already registered.");
      } else if (e.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Signup failed.");
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

/* ================= PROFILE ================= */

function ProfileModal({ close }) {
  const user = auth.currentUser;
  const [name, setName] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const saveProfile = async () => {
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
      setStatus("Password changed successfully.");
      setNewPassword("");
    } catch {
      setError("Re-login required to change password.");
    }
  };

  return (
    <Modal title="Edit Profile" close={close}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={saveProfile}>Save Profile</button>

      <hr />

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={changePassword}>Change Password</button>

      {status && <p style={{ color: "green" }}>{status}</p>}
      {error && <Error text={error} />}
    </Modal>
  );
}

/* ================= CART (UI ONLY) ================= */

function CartModal({ close }) {
  return (
    <Modal title="Your Cart" close={close}>
      <p>Cart is handled via Firestore.</p>
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
