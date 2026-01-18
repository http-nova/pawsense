import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    price: "",
    description: "",
    image: ""
  });

  const productsRef = collection(db, "products");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const snapshot = await getDocs(productsRef);
    setProducts(
      snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    );
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(file);
  };

  const saveProduct = async () => {
    if (!form.name || !form.price || !form.description || !form.image) {
      alert("Fill all fields");
      return;
    }

    if (form.id) {
      const productDoc = doc(db, "products", form.id);
      await updateDoc(productDoc, form);
    } else {
      await addDoc(productsRef, {
        ...form,
        cartCount: 0
      });
    }

    fetchProducts();
    setForm({ id: null, name: "", price: "", description: "", image: "" });
  };

  const editProduct = (product) => setForm(product);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return;
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Admin Panel</h1>

      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
      <input name="price" placeholder="Price" value={form.price} onChange={handleChange} />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <input type="file" onChange={handleImageUpload} />
      <button onClick={saveProduct}>
        {form.id ? "Update" : "Add"}
      </button>

      <table border="1" cellPadding="10">
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td><img src={p.image} width="60" /></td>
              <td>{p.name}</td>
              <td>${p.price}</td>
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
