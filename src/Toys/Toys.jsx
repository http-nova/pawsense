import { useEffect, useState } from "react";
import "../Toys/Toys.css";

function Toys() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
        const storedCart = JSON.parse(localStorage.getItem("cart")) || [];

        setProducts(storedProducts);
        setCart(storedCart);
    }, []);

    const isLoggedIn = () => {
        return localStorage.getItem("user") !== null;
    };

    const addToCart = (product) => {
        if (!isLoggedIn()) {
            alert("Please login first to add items to cart.");
            return;
        }

        let updatedCart = [...cart];
        const index = updatedCart.findIndex(item => item.id === product.id);

        if (index !== -1) {
            updatedCart[index].quantity += 1;
        } else {
            updatedCart.push({ ...product, quantity: 1 });
        }

        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    // ✅ SAFE best seller logic
    const bestSellers =
        cart.length > 0
            ? [...cart]
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 3)
            : products.slice(0, 3);

    return (
        <section className="toys-section" id="toys">
            <h1>Pet Toys</h1>

            <div className="Toys-card">
                {products.map(p => (
                    <Card
                        key={p.id}
                        product={p}
                        onAdd={() => addToCart(p)}
                    />
                ))}
            </div>

            <h1>Best Sellers</h1>

            <div className="Toys-card">
                {bestSellers.map(p => (
                    <Card
                        key={p.id}
                        product={p}
                        onAdd={() => addToCart(p)}
                    />
                ))}
            </div>
        </section>
    );
}

function Card({ product, onAdd }) {
    return (
        <div className="Toys-box">
            <div className="toy-img">
                <img src={product.image} alt={product.name} />
            </div>

            <div className="toy-content">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="price">${product.price}</div>
                <button onClick={onAdd}>Add to Cart</button>
            </div>
        </div>
    );
}

export default Toys;
