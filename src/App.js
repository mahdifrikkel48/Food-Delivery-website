import React, { useState } from "react";
import "./App.css";
import Admin from "./Admin";

const IMG = {
  hero: "/projet V1/A vibrant 3D-rendered classic red scooter.jpg",
  burger: "/projet V1/download.jpg",
  tacos: "/projet V1/download (1).jpg",
  fries: "/projet V1/Crispy Fry.jpg",
  drinks: "/projet V1/Coca Cola.jpg",
};

const MENU = [
  {
    id: "burger", emoji: "🍔", title: "Burgers", img: IMG.burger,
    desc: "Discover our delicious homemade burgers.",
    items: [
      { name: "Classic Burger", price: 8.99 },
      { name: "Cheeseburger", price: 9.99 },
      { name: "Chicken Burger", price: 10.5 },
      { name: "Spicy Burger", price: 10.99 },
      { name: "Bacon Burger", price: 11.99 },
      { name: "Egg Burger", price: 9.5 },
      { name: "Mushroom Burger", price: 11.5 },
      { name: "Double Burger", price: 13.99 },
      { name: "Crispy Chicken Burger", price: 10.99 },
      { name: "Veggie Burger", price: 8.5 },
    ],
  },
  {
    id: "tacos", emoji: "🌮", title: "Tacos", img: IMG.tacos,
    desc: "Discover our cheesy & tasty french tacos.",
    items: [
      { name: "Chicken Tacos", price: 7.99 },
      { name: "Beef Tacos", price: 8.99 },
      { name: "Mix Tacos", price: 10.5 },
      { name: "XL Mega Tacos", price: 12.99 },
    ],
  },
  {
    id: "fries", emoji: "🍟", title: "Crispy Fry", img: IMG.fries,
    desc: "Hot, crispy, and golden fries.",
    items: [
      { name: "Classic French Fries", price: 3.5 },
      { name: "Cheese Fries", price: 4.99 },
      { name: "Curly Fries", price: 4.5 },
      { name: "Loaded Bacon Fries", price: 6.5 },
    ],
  },
  {
    id: "drinks", emoji: "🥤", title: "Drinks", img: IMG.drinks,
    desc: "Refresh yourself with our cool drinks.",
    items: [
      { name: "Coca Cola", price: 2.5 },
      { name: "Zero Coke", price: 2.5 },
      { name: "Sprite", price: 2.5 },
      { name: "Fresh Juice", price: 3.99 },
    ],
  },
];

const CATEGORY_CARDS = [
  { id: "burger", title: "Burger", sub: "Juicy & delicious", img: IMG.burger },
  { id: "tacos", title: "Tacos", sub: "Fresh & cheesy", img: IMG.tacos },
  { id: "fries", title: "Crispy Fry", sub: "Golden & crispy", img: IMG.fries },
  { id: "drinks", title: "Drinks", sub: "Cold & refreshing", img: IMG.drinks },
];

const API = "http://localhost:8000/api"; // adresse de ton Laravel

const EMPTY_FORM = { name: "", phone: "", address: "", date: "", time: "", notes: "" };
const EMPTY_CARD = { number: "", holder: "", expiry: "", cvv: "" };

export default function App() {
  const [page, setPage] = useState("home"); // "home" | "reservation" | "admin"
  const [cart, setCart] = useState([]);
  const [sent, setSent] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [payment, setPayment] = useState("cash"); // "cash" | "card"
  const [card, setCard] = useState(EMPTY_CARD);
  const [loading, setLoading] = useState(false);

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const goTo = (p) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  const addToCart = (item, img) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.name === item.name);
      if (exists) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, img, qty: 1 }];
    });
  };

  const changeQty = (name, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.name === name ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCardChange = (e) => {
    let { name, value } = e.target;

    if (name === "number") {
      value = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    }
    if (name === "expiry") {
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (name === "cvv") {
      value = value.replace(/\D/g, "").slice(0, 4);
    }
    setCard({ ...card, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty!");

    let cardLast4 = null;
    if (payment === "card") {
      const digits = card.number.replace(/\s/g, "");
      if (digits.length !== 16) return alert("Card number must be 16 digits");
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return alert("Expiry must be MM/YY");
      if (card.cvv.length < 3) return alert("Invalid CVV");
      cardLast4 = digits.slice(-4); // on n'envoie JAMAIS le numero complet
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...form,
          payment_method: payment,
          card_last4: cardLast4,
          items: cart.map((i) => ({ name: i.name, qty: i.qty })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        // erreurs de validation Laravel (422)
        const firstError = data.errors
          ? Object.values(data.errors)[0][0]
          : data.message || "Something went wrong";
        return alert(firstError);
      }

      setLastOrder({
        ...form,
        payment,
        cardLast4,
        reference: data.order.reference,
        total: data.order.total,
        items: cart,
      });
      setSent(true);
      setCart([]);
      setCard(EMPTY_CARD);
      setForm(EMPTY_FORM);
      setPayment("cash");
    } catch (err) {
      alert("Cannot reach the server. Is Laravel running (php artisan serve)?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="header">
        <div className="logo" onClick={() => goTo("home")} style={{ cursor: "pointer" }}>
          <img src={IMG.hero} alt="Fodly" />
          <h1>Fodly</h1>
        </div>

        <nav>
          <a href="#" onClick={() => goTo("home")}>Home</a>
          {page === "home" && <a href="#categories">Categories</a>}
          {page === "home" && <a href="#about">About</a>}
        </nav>

        <button className="cart" onClick={() => goTo("reservation")}>
          🛒 Cart ({cartCount})
        </button>
      </header>

      {/* ================= HOME PAGE ================= */}
      {page === "home" && (
        <>
          <section className="hero">
            <div className="hero-text">
              <span className="welcome">WELCOME TO FODLY 👋</span>
              <h2>
                Your favorite food, <span>delivered fast.</span>
              </h2>
              <p>
                Discover delicious meals from your favorite categories and enjoy
                them wherever you are.
              </p>
              <a href="#categories">
                <button className="order-btn">Explore Food →</button>
              </a>
            </div>
            <div className="hero-image">
              <img src={IMG.hero} alt="Food Delivery" />
            </div>
          </section>

          <section className="categories" id="categories">
            <div className="section-title">
              <span>DISCOVER</span>
              <h2>What are you craving?</h2>
              <p>Choose your favorite category</p>
            </div>

            <div className="category-container">
              {CATEGORY_CARDS.map((c) => (
                <a key={c.id} href={`#${c.id}`} className={`category-card ${c.id}`}>
                  <div className="category-image">
                    <img src={c.img} alt={c.title} />
                  </div>
                  <div className="category-info">
                    <h3>{c.title}</h3>
                    <p>{c.sub}</p>
                    <span>Explore →</span>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {MENU.map((cat) => (
            <section key={cat.id} id={cat.id} className="category-page">
              <div className="category-header">
                <span>{cat.emoji} CATEGORY</span>
                <h2>{cat.title}</h2>
                <p>{cat.desc}</p>
              </div>

              <div className="products-grid">
                {cat.items.map((item) => (
                  <div key={item.name} className="product-card">
                    <div className="product-img">
                      <img src={cat.img} alt={item.name} />
                    </div>
                    <div className="product-details">
                      <h4>{item.name}</h4>
                      <p className="price">${item.price.toFixed(2)}</p>
                      <button className="add-btn" onClick={() => addToCart(item, cat.img)}>
                        + Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <footer id="about">
            <h2>Fodly 🍔</h2>
            <p>Good food. Good mood.</p>
            <small>© 2026 Fodly. All rights reserved.</small>
            <br />
            <button className="admin-link" onClick={() => goTo("admin")}>
              Admin
            </button>
          </footer>
        </>
      )}

      {/* ================= ADMIN ================= */}
      {page === "admin" && <Admin onExit={() => goTo("home")} />}

      {/* ================= CHECKOUT PAGE ================= */}
      {page === "reservation" && (
        <section className="checkout">
          <button className="back-btn" onClick={() => goTo("home")}>
            ← Back to menu
          </button>

          {sent && lastOrder ? (
            <div className="success-box">
              <div className="success-icon">✓</div>
              <h2>Reservation sent!</h2>
              <p className="success-sub">
                Thank you {lastOrder.name}, we'll contact you soon.
                <br />
                Order number: <b>{lastOrder.reference}</b>
              </p>

              <div className="order-recap">
                {lastOrder.items.map((i) => (
                  <div key={i.name} className="recap-row">
                    <span>{i.qty} × {i.name}</span>
                    <span>${(i.price * i.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="recap-row total">
                  <span>Total</span>
                  <span>${lastOrder.total.toFixed(2)}</span>
                </div>
                <p className="recap-pay">
                  {lastOrder.payment === "cash"
                    ? "💵 Cash on delivery"
                    : `💳 Card •••• ${lastOrder.cardLast4}`}
                </p>
              </div>

              <button
                className="submit-btn"
                onClick={() => { setSent(false); goTo("home"); }}
              >
                Back to Home
              </button>
            </div>
          ) : (
            <>
              <div className="checkout-head">
                <h2>Checkout</h2>
                <p>Fill in your details and we'll take care of the rest.</p>
              </div>

              <div className="checkout-grid">
                {/* ---------- LEFT: FORM ---------- */}
                <form id="checkout-form" className="checkout-form" onSubmit={handleSubmit}>
                  {/* Step 1 */}
                  <div className="panel">
                    <div className="panel-title">
                      <span className="step">1</span>
                      <h3>Delivery details</h3>
                    </div>

                    <div className="field">
                      <label htmlFor="name">Full name</label>
                      <input id="name" name="name" placeholder="John Doe"
                        value={form.name} onChange={handleChange} required />
                    </div>

                    <div className="field-row">
                      <div className="field">
                        <label htmlFor="phone">Phone</label>
                        <input id="phone" name="phone" type="tel" placeholder="06 00 00 00 00"
                          value={form.phone} onChange={handleChange} required />
                      </div>
                      <div className="field">
                        <label htmlFor="address">Address</label>
                        <input id="address" name="address" placeholder="Street, number, city"
                          value={form.address} onChange={handleChange} required />
                      </div>
                    </div>

                    <div className="field-row">
                      <div className="field">
                        <label htmlFor="date">Date</label>
                        <input id="date" name="date" type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={form.date} onChange={handleChange} required />
                      </div>
                      <div className="field">
                        <label htmlFor="time">Time</label>
                        <input id="time" name="time" type="time"
                          value={form.time} onChange={handleChange} required />
                      </div>
                    </div>

                    <div className="field">
                      <label htmlFor="notes">Notes <small>(optional)</small></label>
                      <textarea id="notes" name="notes" rows="3"
                        placeholder="Ring the bell, no onions, extra sauce…"
                        value={form.notes} onChange={handleChange} />
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="panel">
                    <div className="panel-title">
                      <span className="step">2</span>
                      <h3>Payment method</h3>
                    </div>

                    <div className="pay-options">
                      <label className={`pay-option ${payment === "cash" ? "active" : ""}`}>
                        <input type="radio" name="payment" value="cash"
                          checked={payment === "cash"} onChange={() => setPayment("cash")} />
                        <span className="pay-icon">💵</span>
                        <span>
                          <b>Cash</b>
                          <small>Pay on delivery</small>
                        </span>
                      </label>

                      <label className={`pay-option ${payment === "card" ? "active" : ""}`}>
                        <input type="radio" name="payment" value="card"
                          checked={payment === "card"} onChange={() => setPayment("card")} />
                        <span className="pay-icon">💳</span>
                        <span>
                          <b>Credit card</b>
                          <small>Pay online</small>
                        </span>
                      </label>
                    </div>

                    {payment === "card" && (
                      <div className="card-section">
                        <div className="card-preview">
                          <div className="chip" />
                          <div className="cp-number">{card.number || "•••• •••• •••• ••••"}</div>
                          <div className="cp-row">
                            <span>{card.holder || "FULL NAME"}</span>
                            <span>{card.expiry || "MM/YY"}</span>
                          </div>
                        </div>

                        <div className="field">
                          <label htmlFor="number">Card number</label>
                          <input id="number" name="number" inputMode="numeric" autoComplete="cc-number"
                            placeholder="1234 5678 9012 3456"
                            value={card.number} onChange={handleCardChange} required />
                        </div>

                        <div className="field">
                          <label htmlFor="holder">Name on card</label>
                          <input id="holder" name="holder" autoComplete="cc-name"
                            value={card.holder} onChange={handleCardChange} required />
                        </div>

                        <div className="field-row">
                          <div className="field">
                            <label htmlFor="expiry">Expiry</label>
                            <input id="expiry" name="expiry" inputMode="numeric" autoComplete="cc-exp"
                              placeholder="MM/YY"
                              value={card.expiry} onChange={handleCardChange} required />
                          </div>
                          <div className="field">
                            <label htmlFor="cvv">CVV</label>
                            <input id="cvv" name="cvv" inputMode="numeric" autoComplete="cc-csc"
                              placeholder="123"
                              value={card.cvv} onChange={handleCardChange} required />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </form>

                {/* ---------- RIGHT: ORDER SUMMARY ---------- */}
                <aside className="summary">
                  <h3>Your order</h3>

                  {cart.length === 0 ? (
                    <div className="empty-cart">
                      <div className="empty-emoji">🛒</div>
                      <p>Your cart is empty.</p>
                      <button type="button" className="submit-btn outline" onClick={() => goTo("home")}>
                        Browse the menu
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="sum-list">
                        {cart.map((i) => (
                          <div key={i.name} className="sum-item">
                            <img src={i.img} alt={i.name} />
                            <div className="sum-info">
                              <b>{i.name}</b>
                              <span>${i.price.toFixed(2)}</span>
                            </div>
                            <div className="qty">
                              <button type="button" onClick={() => changeQty(i.name, -1)}>−</button>
                              <b>{i.qty}</b>
                              <button type="button" onClick={() => changeQty(i.name, 1)}>+</button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="sum-total">
                        <span>Total ({cartCount} {cartCount > 1 ? "items" : "item"})</span>
                        <strong>${total.toFixed(2)}</strong>
                      </div>

                      <button type="submit" form="checkout-form" className="submit-btn" disabled={loading}>
                        {loading
                          ? "Sending…"
                          : payment === "cash"
                          ? "Confirm reservation"
                          : `Pay $${total.toFixed(2)} & confirm`}
                      </button>
                    </>
                  )}
                </aside>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}