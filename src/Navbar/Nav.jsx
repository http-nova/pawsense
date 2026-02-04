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

        {/* RIGHT ICONS (CART + HAMBURGER) */}
        <div className="nav-right">
          <div
            className="navbar-cart"
            onClick={() => (user ? setShowCart(true) : setShowLogin(true))}
          >
            <img src={cartlogo} alt="Cart" />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>

          <div
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* MENU */}
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

          {/* ACTIONS */}
          <div className="navbar-actions">
            {user ? (
              <>
                <span className="user-name" onClick={() => setShowProfile(true)}>
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
              <div className="auth-inline">
                <button onClick={() => setShowSignup(true)}>Sign Up</button>
                <button onClick={() => setShowLogin(true)}>Login</button>
              </div>
            )}
          </div>
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
