"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Jaza jina la mtumiaji na password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Imeshindwa kuingia.");
        setLoading(false);
        return;
      }
      const dest = next || (data.user.role === "admin" ? "/dashibodi/admin" : "/dashibodi/mfanyakazi");
      router.push(dest);
      router.refresh();
    } catch {
      setError("Hitilafu ya mtandao. Hakikisha una intaneti kisha jaribu tena.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, var(--pink-soft), var(--bg))",
        padding: 16,
      }}
    >
      <div className="card" style={{ padding: 28, width: "100%", maxWidth: 380 }}>
        <div className="center mb-16">
          <h2 style={{ marginBottom: 4 }}>Pendo Stylish</h2>
          <p className="small muted">Ingia kwenye Dashibodi</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Jina la Kuingia</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Inaingia..." : "Ingia"}
          </button>
        </form>
        <p className="small muted center mt-16">
          <a href="/">← Rudi kwenye website</a>
        </p>
      </div>
    </div>
  );
}
