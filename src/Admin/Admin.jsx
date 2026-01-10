import { useEffect, useState } from "react";

function Admin() {
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        id: null,
        name: "",
        price: "",
        description: "",
        image: ""
    });

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("products")) || [];
        setProducts(stored);
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setForm({ ...form, image: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const saveProduct = () => {
        if (!form.name || !form.price || !form.description || !form.image) {
            alert("Fill all fields");
            return;
        }

        let updatedProducts;

        if (form.id) {
            // EDIT
            updatedProducts = products.map(p =>
                p.id === form.id ? { ...p, ...form } : p
            );
        } else {
            // ADD
            updatedProducts = [
                ...products,
                {
                    ...form,
                    id: Date.now(),
                    cartCount: 0
                }
            ];
        }

        setProducts(updatedProducts);
        localStorage.setItem("products", JSON.stringify(updatedProducts));

        setForm({
            id: null,
            name: "",
            price: "",
            description: "",
            image: ""
        });
    };

    const editProduct = (product) => {
        setForm(product);
    };

    const deleteProduct = (id) => {
        if (!window.confirm("Delete this product?")) return;

        const updated = products.filter(p => p.id !== id);
        setProducts(updated);
        localStorage.setItem("products", JSON.stringify(updated));
    };

    return (
        <div style={{ padding: "40px", maxWidth: "1000px" }}>
            <h1>Admin Panel</h1>

            {/* FORM */}
            <div style={{ display: "grid", gap: "10px", marginBottom: "20px" }}>
                <input
                    name="name"
                    placeholder="Product Name"
                    value={form.name}
                    onChange={handleChange}
                />

                <input
                    name="price"
                    placeholder="Price"
                    value={form.price}
                    onChange={handleChange}
                />

                <textarea
                    name="description"
                    placeholder="Product Description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                />

                <input type="file" accept="image/*" onChange={handleImageUpload} />

                <button onClick={saveProduct}>
                    {form.id ? "Update Product" : "Add Product"}
                </button>
            </div>

            {/* PRODUCT LIST */}
            <table width="100%" border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id}>
                            <td><img src={p.image} width="60" /></td>
                            <td>{p.name}</td>
                            <td>${p.price}</td>
                            <td>{p.description}</td>
                            <td>
                                <button onClick={() => editProduct(p)}>Edit</button>
                                <button onClick={() => deleteProduct(p.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Admin;
