import React, { useState, useEffect, useCallback } from "react";
import "./Admin.css";

const API = "http://localhost:8000/api"; // adresse de ton Laravel
const TOKEN_KEY = "fodly_admin_token";

const STATUSES = ["pending", "confirmed", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed"];

const money = (n) => `$${Number(n).toFixed(2)}`;

async function request(path, token, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.errors
      ? Object.values(data.errors)[0][0]
      : data.message || "Request failed";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ===================== LOGIN ===================== */
function AdminLogin({ onLogin, onExit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await request("/admin/login", null, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      onLogin(data.token);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot reach the server. Is Laravel running?"
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-login" onSubmit={submit}>
        <h2>Admin login</h2>
        <p>Sign in to manage Fodly orders.</p>

        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="admin-error">{error}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <button type="button" className="admin-link-btn" onClick={onExit}>
          ← Back to site
        </button>
      </form>
    </div>
  );
}

/* ===================== DASHBOARD ===================== */
function Dashboard({ token, onLogout, onExit }) {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, last: 1, total: 0 });
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page });
      if (statusFilter) params.set("status", statusFilter);
      if (query) params.set("q", query);

      const [o, s] = await Promise.all([
        request(`/admin/orders?${params}`, token),
        request("/admin/stats", token),
      ]);

      setOrders(o.data);
      setMeta({ page: o.current_page, last: o.last_page, total: o.total });
      setStats(s);
      setError("");
    } catch (err) {
      if (err.status === 401) onLogout();
      else
        setError(
          err instanceof TypeError
            ? "Cannot reach the server. Is Laravel running?"
            : err.message
        );
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, query, onLogout]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000); // refresh auto toutes les 30s
    return () => clearInterval(timer);
  }, [load]);

  const patchOrder = async (order, field, value) => {
    try {
      const updated = await request(`/admin/orders/${order.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ [field]: value }),
      });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      const s = await request("/admin/stats", token);
      setStats(s);
    } catch (err) {
      alert(err.message);
    }
  };

  const removeOrder = async (order) => {
    if (!window.confirm(`Delete order ${order.reference}?`)) return;
    try {
      await request(`/admin/orders/${order.id}`, token, { method: "DELETE" });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const logout = async () => {
    try {
      await request("/admin/logout", token, { method: "POST" });
    } catch (_) {
      /* on deconnecte quand meme */
    }
    onLogout();
  };

  const applySearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const changeFilter = (value) => {
    setPage(1);
    setStatusFilter(value);
  };

  return (
    <div className="admin">
      <div className="admin-top">
        <div>
          <h2>Orders dashboard</h2>
          <p>All reservations from your customers, newest first.</p>
        </div>
        <div className="admin-top-actions">
          <button className="admin-btn" onClick={load}>↻ Refresh</button>
          <button className="admin-btn" onClick={onExit}>View site</button>
          <button className="admin-btn danger" onClick={logout}>Log out</button>
        </div>
      </div>

      {/* STATS */}
      {stats && (
        <div className="stats">
          <div className="stat">
            <span>Total orders</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat">
            <span>Today</span>
            <strong>{stats.today}</strong>
          </div>
          <div className="stat warn">
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>
          <div className="stat ok">
            <span>Delivered</span>
            <strong>{stats.delivered}</strong>
          </div>
          <div className="stat money">
            <span>Revenue</span>
            <strong>{money(stats.revenue)}</strong>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="admin-filters">
        <div className="tabs">
          {["", ...STATUSES].map((s) => (
            <button
              key={s || "all"}
              className={`tab ${statusFilter === s ? "active" : ""}`}
              onClick={() => changeFilter(s)}
            >
              {s ? s : "all"}
            </button>
          ))}
        </div>

        <form className="admin-search" onSubmit={applySearch}>
          <input
            placeholder="Search name, phone or order number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="admin-btn primary">Search</button>
        </form>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* TABLE */}
      <div className="table-card">
        {loading ? (
          <p className="admin-empty">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="admin-empty">No orders found.</p>
        ) : (
          <div className="table-scroll">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Delivery</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <React.Fragment key={o.id}>
                    <tr>
                      <td>
                        <b>{o.reference}</b>
                        <small>{new Date(o.created_at).toLocaleString()}</small>
                      </td>
                      <td>
                        <b>{o.customer_name}</b>
                        <small>{o.phone}</small>
                      </td>
                      <td>
                        <b>{o.delivery_date}</b>
                        <small>{String(o.delivery_time).slice(0, 5)}</small>
                      </td>
                      <td className="total-cell">{money(o.total)}</td>
                      <td>
                        <b>
                          {o.payment_method === "cash"
                            ? "💵 Cash"
                            : `💳 •••• ${o.card_last4 ?? ""}`}
                        </b>
                        <select
                          className={`pill pay-${o.payment_status}`}
                          value={o.payment_status}
                          onChange={(e) =>
                            patchOrder(o, "payment_status", e.target.value)
                          }
                        >
                          {PAYMENT_STATUSES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className={`pill st-${o.status}`}
                          value={o.status}
                          onChange={(e) => patchOrder(o, "status", e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="admin-btn small"
                          onClick={() =>
                            setExpanded(expanded === o.id ? null : o.id)
                          }
                        >
                          {expanded === o.id ? "Hide" : "Details"}
                        </button>
                        <button
                          className="admin-btn small danger"
                          onClick={() => removeOrder(o)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {expanded === o.id && (
                      <tr className="detail-row">
                        <td colSpan={7}>
                          <div className="detail">
                            <div>
                              <h4>Address</h4>
                              <p>{o.address}</p>
                              {o.notes && (
                                <>
                                  <h4>Notes</h4>
                                  <p>{o.notes}</p>
                                </>
                              )}
                            </div>
                            <div>
                              <h4>Items</h4>
                              {o.items.map((it) => (
                                <div key={it.id} className="detail-item">
                                  <span>{it.quantity} × {it.name}</span>
                                  <span>{money(it.price * it.quantity)}</span>
                                </div>
                              ))}
                              <div className="detail-item total">
                                <span>Total</span>
                                <span>{money(o.total)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {meta.last > 1 && (
        <div className="pagination">
          <button
            className="admin-btn"
            disabled={meta.page <= 1}
            onClick={() => setPage(meta.page - 1)}
          >
            ← Previous
          </button>
          <span>
            Page {meta.page} / {meta.last} ({meta.total} orders)
          </span>
          <button
            className="admin-btn"
            disabled={meta.page >= meta.last}
            onClick={() => setPage(meta.page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

/* ===================== MAIN ===================== */
export default function Admin({ onExit }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
  }, []);

  if (!token) return <AdminLogin onLogin={setToken} onExit={onExit} />;
  return <Dashboard token={token} onLogout={logout} onExit={onExit} />;
}