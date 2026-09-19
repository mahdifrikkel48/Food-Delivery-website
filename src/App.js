import React from "react";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="header">
        <div className="logo">
          <img
            src="/projet V1/A vibrant 3D-rendered classic red scooter.jpg"
            alt="Fodly"
          />
          <h1>Fodly</h1>
        </div>

        <nav>
          <a href="#">Home</a>
          <a href="#categories">Categories</a>
          <a href="#about">About</a>
        </nav>

        <button className="cart">🛒 Cart (0)</button>
      </header>

      {/* HERO */}
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
          <button className="order-btn">Explore Food →</button>
        </div>

        <div className="hero-image">
          <img
            src="/projet V1/A vibrant 3D-rendered classic red scooter.jpg"
            alt="Food Delivery"
          />
        </div>
      </section>

      {/* CATEGORIES MENU */}
      <section className="categories" id="categories">
        <div className="section-title">
          <span>DISCOVER</span>
          <h2>What are you craving?</h2>
          <p>Choose your favorite category</p>
        </div>

        <div className="category-container">
          <a href="#burger" className="category-card burger">
            <div className="category-image">
              <img src="/projet V1/download.jpg" alt="Burger" />
            </div>
            <div className="category-info">
              <h3>Burger</h3>
              <p>Juicy & delicious</p>
              <span>Explore →</span>
            </div>
          </a>

          <a href="#tacos" className="category-card tacos">
            <div className="category-image">
              <img src="/projet V1/download (1).jpg" alt="Tacos" />
            </div>
            <div className="category-info">
              <h3>Tacos</h3>
              <p>Fresh & cheesy</p>
              <span>Explore →</span>
            </div>
          </a>

          <a href="#fries" className="category-card fries">
            <div className="category-image">
              <img src="/projet V1/Crispy Fry.jpg" alt="Crispy Fry" />
            </div>
            <div className="category-info">
              <h3>Crispy Fry</h3>
              <p>Golden & crispy</p>
              <span>Explore →</span>
            </div>
          </a>

          <a href="#drinks" className="category-card drinks">
            <div className="category-image">
              <img src="/projet V1/Coca Cola.jpg" alt="Drinks" />
            </div>
            <div className="category-info">
              <h3>Drinks</h3>
              <p>Cold & refreshing</p>
              <span>Explore →</span>
            </div>
          </a>
        </div>
      </section>

      {/* CATEGORY SECTIONS */}

      {/* 🍔 BURGERS */}
      <section id="burger" className="category-page">
        <div className="category-header">
          <span>🍔 CATEGORY</span>
          <h2>Burgers</h2>
          <p>Discover our delicious homemade burgers.</p>
        </div>

        <div className="products-grid">
          {[
            { name: "Classic Burger", price: "$8.99" },
            { name: "Cheeseburger", price: "$9.99" },
            { name: "Chicken Burger", price: "$10.50" },
            { name: "Spicy Burger", price: "$10.99" },
            { name: "Bacon Burger", price: "$11.99" },
            { name: "Egg Burger", price: "$9.50" },
            { name: "Mushroom Burger", price: "$11.50" },
            { name: "Double Burger", price: "$13.99" },
            { name: "Crispy Chicken Burger", price: "$10.99" },
            { name: "Veggie Burger", price: "$8.50" },
          ].map((item, idx) => (
            <div key={idx} className="product-card">
              <div className="product-img">
                <img src="/projet V1/download.jpg" alt={item.name} />
              </div>
              <div className="product-details">
                <h4>{item.name}</h4>
                <p className="price">{item.price}</p>
                <button className="add-btn">+ Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🌮 TACOS */}
      <section id="tacos" className="category-page">
        <div className="category-header">
          <span>🌮 CATEGORY</span>
          <h2>Tacos</h2>
          <p>Discover our cheesy & tasty french tacos.</p>
        </div>

        <div className="products-grid">
          {[
            { name: "Chicken Tacos", price: "$7.99" },
            { name: "Beef Tacos", price: "$8.99" },
            { name: "Mix Tacos", price: "$10.50" },
            { name: "XL Mega Tacos", price: "$12.99" },
          ].map((item, idx) => (
            <div key={idx} className="product-card">
              <div className="product-img">
                <img src="/projet V1/download (1).jpg" alt={item.name} />
              </div>
              <div className="product-details">
                <h4>{item.name}</h4>
                <p className="price">{item.price}</p>
                <button className="add-btn">+ Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🍟 FRIES */}
      <section id="fries" className="category-page">
        <div className="category-header">
          <span>🍟 CATEGORY</span>
          <h2>Crispy Fry</h2>
          <p>Hot, crispy, and golden fries.</p>
        </div>

        <div className="products-grid">
          {[
            { name: "Classic French Fries", price: "$3.50" },
            { name: "Cheese Fries", price: "$4.99" },
            { name: "Curly Fries", price: "$4.50" },
            { name: "Loaded Bacon Fries", price: "$6.50" },
          ].map((item, idx) => (
            <div key={idx} className="product-card">
              <div className="product-img">
                <img src="/projet V1/Crispy Fry.jpg" alt={item.name} />
              </div>
              <div className="product-details">
                <h4>{item.name}</h4>
                <p className="price">{item.price}</p>
                <button className="add-btn">+ Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🥤 DRINKS */}
      <section id="drinks" className="category-page">
        <div className="category-header">
          <span>🥤 CATEGORY</span>
          <h2>Drinks</h2>
          <p>Refresh yourself with our cool drinks.</p>
        </div>

        <div className="products-grid">
          {[
            { name: "Coca Cola", price: "$2.50" },
            { name: "Zero Coke", price: "$2.50" },
            { name: "Sprite", price: "$2.50" },
            { name: "Fresh Juice", price: "$3.99" },
          ].map((item, idx) => (
            <div key={idx} className="product-card">
              <div className="product-img">
                <img src="/projet V1/Coca Cola.jpg" alt={item.name} />
              </div>
              <div className="product-details">
                <h4>{item.name}</h4>
                <p className="price">{item.price}</p>
                <button className="add-btn">+ Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about">
        <h2>Fodly 🍔</h2>
        <p>Good food. Good mood.</p>
        <small>© 2026 Fodly. All rights reserved.</small>
      </footer>
    </div>
  );
}