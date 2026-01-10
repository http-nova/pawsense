import { useState } from "react";
import "../Navbar/Nav.css";
import imglogo from "../assets/pawsense-logo.png";
import cartlogo from "../assets/cart.png";

function Nav() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleCartClick = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      setShowCart(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setShowCart(false);
    window.location.reload();
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

        {/* Actions */}
      </nav>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
      {showCart && <CartModal onClose={() => setShowCart(false)} />}
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

/* ================= SIGNUP MODAL ================= */

function SignupModal({ onClose }) {
  const [name, setName] = useState("");
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
      <div className="auth-modal cart-modal">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
        <h2>Your Cart</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
