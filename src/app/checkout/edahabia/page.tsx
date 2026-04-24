"use client";

import { useState } from "react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  amount: string;
  description: string;
};

export default function EdahabiaCheckoutPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    amount: "1000",
    description: "Book design package",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chargily/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          amount: Number(form.amount) || 1000,
          description: form.description || "Book design package",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Payment creation failed");
      }

      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      throw new Error("No checkout URL returned");
    } catch (err) {
      const message = err instanceof Error ? err.message : "fetch failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-center">Chargily Pay · Edahabia</h1>
        <p className="mt-3 text-sm text-white/70 text-center">
          Enter your details below. You'll be redirected to Chargily's secure Edahabia checkout and returned here once payment is confirmed.
        </p>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          Chargily Package is <span className="font-semibold text-white">1000 DZD</span>. Your card will be charged in Algerian Dinars.
        </div>

        <p className="mt-4 text-center text-sm text-white/70">
          By continuing, you agree to be charged by Chargily on behalf of Abbassa Malik Design.
        </p>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <form onSubmit={handlePay} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/80">Full name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-purple-500"
              placeholder="Abbassa Malik"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">Email *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-purple-500"
              placeholder="abbassamalik@gmail.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">Phone *</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-purple-500"
              placeholder="+213..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">Package Price</label>
            <input
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              min="1"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-purple-500"
              placeholder="1000"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/80">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-purple-500"
              rows={3}
              placeholder="Book design package"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Processing..." : "Pay with Chargily"}
          </button>
        </form>
      </div>
    </div>
  );
}