import React, { useState, useEffect } from "react";

// ─── Types & Data ─────────────────────────────────────────────────────────────

export type Category = "food" | "transport" | "housing" | "entertainment" | "health" | "shopping" | "income";
export type TxType = "expense" | "income";

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: Category;
  date: string;
  type: TxType;
}

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  initials: string;
  createdAt: string;
}

interface StoredAccount extends User {
  password: string;
}

export interface Budget {
  category: Category;
  limit: number;
  label: string;
}

const DEFAULT_BUDGETS: Budget[] = [
  { category: "food", label: "Food & Dining", limit: 600 },
  { category: "housing", label: "Housing", limit: 2500 },
  { category: "transport", label: "Transport", limit: 200 },
  { category: "entertainment", label: "Entertainment", limit: 250 },
  { category: "health", label: "Health", limit: 300 },
  { category: "shopping", label: "Shopping", limit: 350 },
];

const CATEGORY_COLORS: Record<Category, string> = {
  food: "#b8ff57",
  transport: "#57b8ff",
  housing: "#ffa657",
  entertainment: "#d557ff",
  health: "#ff57b8",
  shopping: "#57ffd4",
  income: "#b8ff57",
};

const CATEGORY_ICONS: Record<Category, string> = {
  food: "🍜",
  transport: "🚇",
  housing: "🏠",
  entertainment: "🎬",
  health: "🩺",
  shopping: "🛍",
  income: "💰",
};

const EXPENSE_CATEGORIES: Category[] = ["food", "transport", "housing", "entertainment", "health", "shopping"];

export const CURRENCIES = [
  { symbol: "$", label: "USD ($)" },
  { symbol: "₹", label: "INR (₹)" },
  { symbol: "€", label: "EUR (€)" },
  { symbol: "£", label: "GBP (£)" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function fmt(amount: number, currency = "$"): string {
  const sign = amount < 0 ? "−" : "+";
  return `${sign}${currency}${Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function fmtAbs(amount: number, currency = "$"): string {
  return `${currency}${Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "U";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Auth Screen (Sign In & Sign Up) ──────────────────────────────────────────

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState("$");
  const [error, setError] = useState("");

  const inputStyle: React.CSSProperties = {
    background: "var(--secondary)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
    outline: "none",
    fontFamily: "var(--font-sans)",
    borderRadius: "12px",
    width: "100%",
    padding: "14px 16px",
    fontSize: "14px",
    marginBottom: "14px",
    display: "block",
  };

  function getStoredAccounts(): StoredAccount[] {
    try {
      const data = localStorage.getItem("expense_accounts_v1");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveAccounts(accounts: StoredAccount[]) {
    localStorage.setItem("expense_accounts_v1", JSON.stringify(accounts));
  }

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    const accounts = getStoredAccounts();

    if (isSignUp) {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }
      if (accounts.some(a => a.email === cleanEmail)) {
        setError("An account with this email already exists. Please sign in.");
        return;
      }

      const newUser: StoredAccount = {
        id: "usr_" + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        currency,
        initials: getInitials(name),
        password,
        createdAt: new Date().toISOString(),
      };

      accounts.push(newUser);
      saveAccounts(accounts);
      onLogin(newUser);
    } else {
      const found = accounts.find(a => a.email === cleanEmail && a.password === password);
      if (!found) {
        setError("Invalid email or password. Please try again or create an account.");
        return;
      }
      onLogin(found);
    }
  }

  function handleQuickDemo() {
    const demoUser: StoredAccount = {
      id: "demo_guest",
      name: "Ashu Sharma",
      email: "demo@expenseflow.app",
      currency: "$",
      initials: "AS",
      password: "demo",
      createdAt: new Date().toISOString(),
    };
    const accounts = getStoredAccounts();
    if (!accounts.some(a => a.id === demoUser.id)) {
      accounts.push(demoUser);
      saveAccounts(accounts);
    }
    onLogin(demoUser);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#050507", fontFamily: "var(--font-sans)" }}>
      <div
        className="w-full max-w-sm rounded-3xl p-6 sm:p-8 flex flex-col justify-between"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        <div>
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl font-bold shadow-lg"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontFamily: "var(--font-mono)" }}
            >
              ⚡
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
              ExpenseFlow
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              Personal budget & expense tracker
            </p>
          </div>

          {/* Toggle between Sign In / Sign Up */}
          <div className="flex p-1 rounded-xl mb-6" style={{ background: "var(--secondary)", gap: "4px" }}>
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(""); }}
              className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
              style={{
                background: !isSignUp ? "var(--card)" : "transparent",
                color: !isSignUp ? "var(--foreground)" : "var(--muted-foreground)",
                border: !isSignUp ? "1px solid var(--border)" : "none",
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(""); }}
              className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
              style={{
                background: isSignUp ? "var(--card)" : "transparent",
                color: isSignUp ? "var(--foreground)" : "var(--muted-foreground)",
                border: isSignUp ? "1px solid var(--border)" : "none",
                cursor: "pointer",
              }}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth}>
            {isSignUp && (
              <div>
                <input
                  type="text"
                  placeholder="Your Full Name (e.g. Ashu Sharma)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={inputStyle}
                  required
                />

                {/* Currency preference */}
                <div className="mb-3">
                  <p className="text-xs mb-1.5 font-medium" style={{ color: "var(--muted-foreground)" }}>
                    Preferred Currency
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {CURRENCIES.map(c => (
                      <button
                        key={c.symbol}
                        type="button"
                        onClick={() => setCurrency(c.symbol)}
                        className="py-2 text-xs font-bold rounded-xl transition-all"
                        style={{
                          background: currency === c.symbol ? "var(--primary)" : "var(--secondary)",
                          color: currency === c.symbol ? "var(--primary-foreground)" : "var(--foreground)",
                          border: `1px solid ${currency === c.symbol ? "var(--primary)" : "var(--border)"}`,
                          cursor: "pointer",
                        }}
                      >
                        {c.symbol}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              required
            />

            {error && (
              <div className="p-3 rounded-xl mb-4 text-xs font-medium" style={{ background: "#ff575718", color: "#ff5757", border: "1px solid #ff575730" }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all shadow-md mt-2"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none",
                cursor: "pointer",
              }}
            >
              {isSignUp ? "Create Account & Start ($0)" : "Sign In"}
            </button>
          </form>

          {/* Quick Demo */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-xs font-medium underline"
              style={{ color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}
            >
              Or tap here to test as Guest Demo
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            🔒 Private & stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Profile / Account Modal ──────────────────────────────────────────────────

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
  onUpdateCurrency: (currency: string) => void;
  transactionCount: number;
}

function ProfileModal({ user, onClose, onLogout, onUpdateCurrency, transactionCount }: ProfileModalProps) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          zIndex: 60,
        }}
      />
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "var(--card)",
          borderTop: "1px solid var(--border)",
          borderRadius: "24px 24px 0 0",
          zIndex: 70,
          padding: "20px 24px 36px",
        }}
      >
        <div className="flex justify-center mb-3">
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border)" }} />
        </div>

        <div className="flex justify-between items-center mb-5">
          <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>My Account</p>
          <button
            onClick={onClose}
            style={{ color: "var(--muted-foreground)", fontSize: 20, lineHeight: 1, background: "none", border: "none", cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl mb-5" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontFamily: "var(--font-mono)" }}
          >
            {user.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold truncate" style={{ color: "var(--foreground)" }}>{user.name}</p>
            <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{user.email}</p>
            <p className="text-xs mt-1" style={{ color: "var(--primary)" }}>{transactionCount} transactions recorded</p>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="mb-6">
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Display Currency</p>
          <div className="grid grid-cols-4 gap-2">
            {CURRENCIES.map(c => (
              <button
                key={c.symbol}
                onClick={() => onUpdateCurrency(c.symbol)}
                className="py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: user.currency === c.symbol ? "var(--primary)" : "var(--secondary)",
                  color: user.currency === c.symbol ? "var(--primary-foreground)" : "var(--foreground)",
                  border: `1px solid ${user.currency === c.symbol ? "var(--primary)" : "var(--border)"}`,
                  cursor: "pointer",
                }}
              >
                {c.symbol} {c.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{
            background: "#ff575715",
            color: "#ff5757",
            border: "1px solid #ff575740",
            cursor: "pointer",
          }}
        >
          <span>🚪</span> Log Out
        </button>
      </div>
    </>
  );
}

// ─── Add Transaction Sheet ────────────────────────────────────────────────────

interface AddSheetProps {
  onClose: () => void;
  onAdd: (t: Omit<Transaction, "id">) => void;
  currency: string;
}

function AddSheet({ onClose, onAdd, currency }: AddSheetProps) {
  const [txType, setTxType] = useState<TxType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!description.trim()) { setError("Please enter a description."); return; }
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) { setError("Enter a valid amount."); return; }
    const finalCategory: Category = txType === "income" ? "income" : category;
    onAdd({
      description: description.trim(),
      amount: txType === "expense" ? -parsed : parsed,
      category: finalCategory,
      date,
      type: txType,
    });
    onClose();
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--secondary)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
    outline: "none",
    fontFamily: "var(--font-sans)",
    borderRadius: "12px",
    width: "100%",
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 40,
        }}
      />
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "var(--card)",
          borderTop: "1px solid var(--border)",
          borderRadius: "24px 24px 0 0",
          zIndex: 50,
          padding: "0 20px 36px",
        }}
      >
        <div className="flex justify-center pt-3 pb-4">
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border)" }} />
        </div>

        <div className="flex justify-between items-center mb-5">
          <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Add Transaction</p>
          <button
            onClick={onClose}
            style={{ color: "var(--muted-foreground)", fontSize: 20, lineHeight: 1, background: "none", border: "none", cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        {/* type toggle */}
        <div className="flex mb-5 p-1 rounded-xl" style={{ background: "var(--secondary)", gap: "4px" }}>
          {(["expense", "income"] as TxType[]).map(t => (
            <button
              key={t}
              onClick={() => { setTxType(t); setError(""); }}
              className="flex-1 py-2 text-sm font-semibold capitalize rounded-lg"
              style={{
                background: txType === t ? (t === "income" ? "var(--primary)" : "#ff5757") : "transparent",
                color: txType === t ? (t === "income" ? "var(--primary-foreground)" : "#fff") : "var(--muted-foreground)",
                transition: "all 0.15s",
                border: "none",
                cursor: "pointer",
              }}
            >
              {t === "income" ? "＋ Income" : "－ Expense"}
            </button>
          ))}
        </div>

        {/* amount */}
        <div className="mb-4 flex items-center gap-2 rounded-xl px-4 py-4" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
          <span className="text-2xl font-semibold" style={{ color: txType === "income" ? "var(--primary)" : "#ff5757", fontFamily: "var(--font-mono)" }}>
            {txType === "income" ? "+" : "−"}{currency}
          </span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={e => { setAmount(e.target.value); setError(""); }}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--foreground)",
              fontFamily: "var(--font-mono)",
              fontSize: "24px",
              fontWeight: 600,
              flex: 1,
              minWidth: 0,
            }}
          />
        </div>

        {/* description */}
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={e => { setDescription(e.target.value); setError(""); }}
          style={{ ...inputStyle, padding: "12px 16px", fontSize: "14px", marginBottom: "12px", display: "block" }}
        />

        {/* category */}
        {txType === "expense" && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1"
                  style={{
                    background: category === c ? CATEGORY_COLORS[c] + "25" : "var(--secondary)",
                    color: category === c ? CATEGORY_COLORS[c] : "var(--muted-foreground)",
                    border: `1px solid ${category === c ? CATEGORY_COLORS[c] + "60" : "var(--border)"}`,
                    transition: "all 0.15s",
                    cursor: "pointer",
                  }}
                >
                  {CATEGORY_ICONS[c]} {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* date */}
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{
            ...inputStyle,
            padding: "12px 16px",
            fontSize: "14px",
            marginBottom: "16px",
            display: "block",
            colorScheme: "dark",
          }}
        />

        {error && (
          <p className="text-xs mb-3" style={{ color: "#ff5757" }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl text-sm font-semibold"
          style={{
            background: txType === "income" ? "var(--primary)" : "#ff5757",
            color: txType === "income" ? "var(--primary-foreground)" : "#fff",
            border: "none",
            fontFamily: "var(--font-sans)",
            cursor: "pointer",
          }}
        >
          {txType === "income" ? "Add Income" : "Add Expense"}
        </button>
      </div>
    </>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

interface HomeProps {
  user: User;
  transactions: Transaction[];
  budgets: Budget[];
  onAdd: () => void;
  onDelete?: (id: number) => void;
  onOpenProfile: () => void;
  onOpenBudgets: () => void;
  onOpenSuggestModal: () => void;
}

function HomeScreen({ user, transactions, budgets, onAdd, onDelete, onOpenProfile, onOpenBudgets, onOpenSuggestModal }: HomeProps) {
  const currency = user.currency || "$";
  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpenses;
  const activeBudgets = budgets && budgets.length > 0 ? budgets : DEFAULT_BUDGETS;

  function spentInCategory(cat: Category) {
    return transactions.filter(t => t.category === cat && t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-12 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs tracking-widest uppercase" style={{ color: "var(--muted-foreground)" }}>September 2026</p>
            <p className="text-base font-medium mt-0.5" style={{ color: "var(--foreground)" }}>
              Good morning, {user.name} 👋
            </p>
          </div>
          <button
            onClick={onOpenProfile}
            title="Open profile & settings"
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-transform hover:scale-105"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              fontFamily: "var(--font-mono)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {user.initials}
          </button>
        </div>
      </div>

      {/* balance card */}
      <div className="px-5 mb-5">
        <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #1a1f12 0%, #0f1a00 100%)", border: "1px solid #b8ff5730" }}>
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b8ff5780" }}>Net Balance</p>
          <p className="text-4xl font-semibold tracking-tight mb-5" style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}>
            {fmtAbs(balance, currency)}
          </p>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--primary)" }} />
                <span className="text-xs" style={{ color: "#b8ff5780" }}>Income</span>
              </div>
              <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)" }}>{fmtAbs(totalIncome, currency)}</p>
            </div>
            <div className="w-px self-stretch" style={{ background: "#b8ff5720" }} />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-2 h-2 rounded-full" style={{ background: "#ff5757" }} />
                <span className="text-xs" style={{ color: "#b8ff5780" }}>Spent</span>
              </div>
              <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)" }}>{fmtAbs(totalExpenses, currency)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* quick actions */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: "+", label: "Add", action: onAdd, isPrimary: true },
            { icon: "🪄", label: "Suggest", action: onOpenSuggestModal, isPrimary: false },
            { icon: "🎯", label: "Budgets", action: onOpenBudgets, isPrimary: false },
            { icon: "👤", label: "Profile", action: onOpenProfile, isPrimary: false },
          ].map(a => (
            <button key={a.label} onClick={a.action} className="flex flex-col items-center gap-2" style={{ background: "none", border: "none", cursor: a.action ? "pointer" : "default" }}>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-semibold transition hover:scale-105 active:scale-95"
                style={{
                  background: a.isPrimary ? "var(--primary)" : "var(--secondary)",
                  color: a.isPrimary ? "var(--primary-foreground)" : "var(--primary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {a.icon}
              </div>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Smart Budget Advisor prompt banner */}
      <div className="px-5 mb-6">
        <div
          onClick={onOpenSuggestModal}
          className="rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer transition hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: "linear-gradient(135deg, rgba(184, 255, 87, 0.12) 0%, rgba(87, 184, 255, 0.08) 100%)",
            border: "1px solid rgba(184, 255, 87, 0.28)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: "rgba(184, 255, 87, 0.18)", color: "var(--primary)" }}
            >
              🪄
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
                Smart Budget Advisor
              </p>
              <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                Give your money, get the finest budget
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            Suggest →
          </span>
        </div>
      </div>

      {/* spending by category */}
      <div className="px-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Spending vs Budget</p>
          <button
            onClick={onOpenBudgets}
            className="text-xs hover:underline flex items-center gap-1"
            style={{ color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <span>Budgets</span>
            <span>→</span>
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {activeBudgets.map(b => {
            const spent = spentInCategory(b.category);
            const pct = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 100;
            const color = spent > b.limit ? "#ff5757" : CATEGORY_COLORS[b.category];
            return (
              <div key={b.category} className="shrink-0 rounded-xl p-4 flex flex-col gap-2.5"
                style={{ background: "var(--card)", border: "1px solid var(--border)", width: "128px" }}>
                <span className="text-xl">{CATEGORY_ICONS[b.category]}</span>
                <div>
                  <p className="text-xs mb-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>{b.label}</p>
                  <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)" }}>{fmtAbs(spent, currency)}</p>
                  <p className="text-[10px]" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>of {fmtAbs(b.limit, currency)}</p>
                </div>
                <div style={{ background: "var(--secondary)", height: "3px", borderRadius: "2px" }}>
                  <div style={{ width: `${pct}%`, height: "3px", background: color, borderRadius: "2px" }} />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs" style={{ color, fontFamily: "var(--font-mono)" }}>{pct.toFixed(0)}%</p>
                  {spent > b.limit && (
                    <span className="text-[9px] font-bold px-1 rounded" style={{ background: "rgba(255, 87, 87, 0.2)", color: "#ff5757" }}>OVER</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* recent transactions */}
      <div className="px-5 pb-6">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Recent</p>
        </div>
        {transactions.length === 0 ? (
          <div className="rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3"
            style={{ background: "var(--card)", border: "1px dashed var(--border)" }}>
            <span className="text-3xl">✨</span>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Clean slate! Starting from {fmtAbs(0, currency)}</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Tap the <strong>+</strong> button above to log your first income or expense.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.slice(0, 6).map(t => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: "var(--secondary)" }}>
                  {CATEGORY_ICONS[t.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{t.description}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{formatDate(t.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold shrink-0"
                    style={{ fontFamily: "var(--font-mono)", color: t.type === "income" ? "var(--primary)" : "var(--foreground)" }}>
                    {fmt(t.amount, currency)}
                  </p>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(t.id)}
                      title="Delete transaction"
                      style={{ background: "none", border: "none", color: "#ff5757", cursor: "pointer", fontSize: "14px", padding: "4px" }}
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Transactions Screen ──────────────────────────────────────────────────────

interface TransactionsScreenProps {
  user: User;
  transactions: Transaction[];
  onDelete?: (id: number) => void;
}

function TransactionsScreen({ user, transactions, onDelete }: TransactionsScreenProps) {
  const currency = user.currency || "$";
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");

  const filtered = transactions.filter(t => {
    if (filter === "income" && t.type !== "income") return false;
    if (filter === "expense" && t.type !== "expense") return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-12 pb-4">
        <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--muted-foreground)" }}>All time</p>
        <p className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>Transactions</p>
      </div>
      <div className="px-5 mb-4 flex flex-col gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search…"
          style={{
            background: "var(--secondary)", border: "1px solid var(--border)",
            color: "var(--foreground)", outline: "none", fontFamily: "var(--font-sans)", borderRadius: "12px",
            padding: "12px 16px", fontSize: "14px", width: "100%",
          }}
        />
        <div className="flex gap-2">
          {(["all", "income", "expense"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 text-xs font-medium capitalize rounded-full"
              style={{
                background: filter === f ? "var(--primary)" : "var(--secondary)",
                color: filter === f ? "var(--primary-foreground)" : "var(--muted-foreground)",
                transition: "all 0.15s", border: "none", cursor: "pointer",
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-6 flex flex-col gap-2">
        {filtered.map(t => (
          <div key={t.id} className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: "var(--secondary)" }}>
              {CATEGORY_ICONS[t.category]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{t.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background: CATEGORY_COLORS[t.category] + "18",
                    color: CATEGORY_COLORS[t.category],
                    fontFamily: "var(--font-mono)", fontSize: "10px",
                  }}>
                  {t.category}
                </span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{formatDate(t.date)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold shrink-0"
                style={{ fontFamily: "var(--font-mono)", color: t.type === "income" ? "var(--primary)" : "var(--foreground)" }}>
                {fmt(t.amount, currency)}
              </p>
              {onDelete && (
                <button
                  onClick={() => onDelete(t.id)}
                  title="Delete transaction"
                  style={{ background: "none", border: "none", color: "#ff5757", cursor: "pointer", fontSize: "14px", padding: "4px" }}
                >
                  🗑
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            {transactions.length === 0 ? "No transactions recorded yet." : "No transactions match your filter."}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Budget Modal (Set Custom Budgets) ──────────────────────────────────────────

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: Budget[];
  onSave: (newBudgets: Budget[]) => void;
  onReset: () => void;
  currency: string;
  transactions: Transaction[];
  initialCategory?: Category | null;
  onOpenSuggestModal?: () => void;
}

function BudgetModal({
  isOpen,
  onClose,
  budgets,
  onSave,
  onReset,
  currency,
  transactions,
  initialCategory,
  onOpenSuggestModal,
}: BudgetModalProps) {
  if (!isOpen) return null;

  const [draftLimits, setDraftLimits] = useState<Record<string, number | "">>(() => {
    const map: Record<string, number | ""> = {};
    budgets.forEach(b => {
      map[b.category] = b.limit;
    });
    return map;
  });

  const [savedNotice, setSavedNotice] = useState(false);

  function spentInCategory(cat: Category) {
    return transactions
      .filter(t => t.category === cat && t.type === "expense")
      .reduce((s, t) => s + Math.abs(t.amount), 0);
  }

  const draftTotal = Object.values(draftLimits).reduce((s: number, val) => s + (Number(val) || 0), 0);
  const currentTotal = budgets.reduce((s, b) => s + b.limit, 0);
  const diffTotal = draftTotal - currentTotal;

  function handleLimitChange(cat: Category, value: string) {
    if (value === "") {
      setDraftLimits(prev => ({ ...prev, [cat]: "" }));
    } else {
      const num = Math.max(0, parseFloat(value) || 0);
      setDraftLimits(prev => ({ ...prev, [cat]: num }));
    }
  }

  function handleAdjust(cat: Category, delta: number) {
    setDraftLimits(prev => {
      const cur = Number(prev[cat]) || 0;
      return { ...prev, [cat]: Math.max(0, cur + delta) };
    });
  }

  function handleSave() {
    const updated = budgets.map(b => ({
      ...b,
      limit: draftLimits[b.category] !== "" && !isNaN(Number(draftLimits[b.category]))
        ? Number(draftLimits[b.category])
        : b.limit,
    }));
    onSave(updated);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 300);
  }

  function handleResetToDefaults() {
    if (confirm("Reset all category budgets to default values?")) {
      const resetMap: Record<string, number> = {};
      DEFAULT_BUDGETS.forEach(b => {
        resetMap[b.category] = b.limit;
      });
      setDraftLimits(resetMap);
      onReset();
      setSavedNotice(true);
      setTimeout(() => {
        setSavedNotice(false);
        onClose();
      }, 300);
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          zIndex: 40,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "92%",
          background: "var(--card)",
          borderTop: "1px solid var(--border)",
          borderRadius: "24px 24px 0 0",
          zIndex: 50,
          padding: "0 20px 28px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* drag handle */}
        <div className="flex justify-center pt-3 pb-3">
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border)" }} />
        </div>

        {/* header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Set Your Budgets</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Customize spending limits per category</p>
          </div>
          <button
            onClick={onClose}
            style={{
              color: "var(--muted-foreground)",
              fontSize: 22,
              lineHeight: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Total monthly preview card */}
        <div
          className="p-4 rounded-2xl mb-3"
          style={{
            background: "var(--secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--muted-foreground)" }}>
                Total Monthly Budget
              </p>
              <p className="text-2xl font-bold mt-0.5" style={{ fontFamily: "var(--font-mono)", color: "var(--primary)" }}>
                {fmtAbs(draftTotal, currency)}
              </p>
            </div>
            {diffTotal !== 0 && (
              <div
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: diffTotal > 0 ? "rgba(184, 255, 87, 0.15)" : "rgba(255, 87, 87, 0.15)",
                  color: diffTotal > 0 ? "var(--primary)" : "#ff5757",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {diffTotal > 0 ? `+${fmtAbs(diffTotal, currency)}` : `-${fmtAbs(Math.abs(diffTotal), currency)}`}
              </div>
            )}
          </div>
        </div>

        {/* Suggestion prompt button */}
        {onOpenSuggestModal && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSuggestModal();
            }}
            className="w-full mb-4 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition hover:opacity-90 active:scale-98"
            style={{
              background: "linear-gradient(135deg, rgba(184, 255, 87, 0.12) 0%, rgba(87, 184, 255, 0.08) 100%)",
              border: "1px solid rgba(184, 255, 87, 0.3)",
              color: "var(--primary)",
              cursor: "pointer",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🪄</span>
              <span className="text-left">
                <span className="font-bold block text-[11px]" style={{ color: "var(--foreground)" }}>Need an optimal allocation?</span>
                <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Let Smart Advisor suggest the finest budget for your money</span>
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              Suggest →
            </span>
          </button>
        )}

        {/* Category list (scrollable) */}
        <div className="overflow-y-auto pr-1 flex flex-col gap-3 mb-4" style={{ maxHeight: "40vh" }}>
          {budgets.map(b => {
            const spent = spentInCategory(b.category);
            const curVal = draftLimits[b.category] !== undefined ? draftLimits[b.category] : b.limit;
            const isHighlighted = initialCategory === b.category;

            return (
              <div
                key={b.category}
                className="p-3 rounded-xl transition"
                style={{
                  background: isHighlighted ? "rgba(184, 255, 87, 0.06)" : "rgba(255, 255, 255, 0.02)",
                  border: `1px solid ${isHighlighted ? "var(--primary)" : "var(--border)"}`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_ICONS[b.category]}</span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{b.label}</p>
                      <p className="text-[10px]" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
                        Spent: {fmtAbs(spent, currency)}
                      </p>
                    </div>
                  </div>

                  {/* Input field */}
                  <div
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg"
                    style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                  >
                    <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
                      {currency}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={curVal}
                      onChange={e => handleLimitChange(b.category, e.target.value)}
                      className="w-20 text-right text-xs font-semibold bg-transparent focus:outline-none"
                      style={{ color: "var(--foreground)", fontFamily: "var(--font-mono)" }}
                    />
                  </div>
                </div>

                {/* Quick adjustment chip buttons */}
                <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Adjust limit:</span>
                  <div className="flex gap-1.5">
                    {[-100, -50, 50, 100].map(delta => (
                      <button
                        key={delta}
                        type="button"
                        onClick={() => handleAdjust(b.category, delta)}
                        className="text-[10px] px-2 py-0.5 rounded-md hover:opacity-80 transition"
                        style={{
                          background: "var(--secondary)",
                          color: delta > 0 ? "var(--primary)" : "var(--muted-foreground)",
                          border: "1px solid var(--border)",
                          cursor: "pointer",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {delta > 0 ? `+${delta}` : delta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-3 py-3 rounded-xl text-xs font-semibold hover:opacity-80 transition shrink-0"
            style={{
              background: "var(--secondary)",
              color: "var(--muted-foreground)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            ↺ Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl text-sm font-semibold hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 16px rgba(184, 255, 87, 0.3)",
            }}
          >
            {savedNotice ? "✓ Saved!" : "Save Budgets"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Smart Budget Suggestion Modal ─────────────────────────────────────────────

interface BudgetStrategy {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  splitSummary: string;
  needsPct: number;
  wantsPct: number;
  savingsPct: number;
  ratios: {
    housing: number;
    food: number;
    transport: number;
    health: number;
    entertainment: number;
    shopping: number;
    savings: number;
  };
  tips: string[];
}

const BUDGET_STRATEGIES: BudgetStrategy[] = [
  {
    id: "balanced",
    name: "Balanced 50/30/20",
    tagline: "The timeless gold standard for sustainable wealth & lifestyle",
    badge: "Gold Standard",
    splitSummary: "50% Needs · 30% Wants · 20% Savings",
    needsPct: 50,
    wantsPct: 30,
    savingsPct: 20,
    ratios: {
      housing: 0.30,
      food: 0.12,
      transport: 0.05,
      health: 0.03,
      entertainment: 0.12,
      shopping: 0.18,
      savings: 0.20,
    },
    tips: [
      "🏠 30% Housing Anchor: Keep rent/mortgage strictly within 30% of income so cashflow stays resilient.",
      "🍜 Food Envelope: Divide your monthly food allowance into 4 weekly caps for effortless discipline.",
      "💰 Pay Yourself First: Transfer 20% savings on the day your money lands, before any spending.",
    ],
  },
  {
    id: "wealth",
    name: "Wealth Accelerator",
    tagline: "Aggressive 40% savings for financial independence & debt freedom",
    badge: "High Saver 40%",
    splitSummary: "40% Needs · 20% Wants · 40% Savings",
    needsPct: 40,
    wantsPct: 20,
    savingsPct: 40,
    ratios: {
      housing: 0.25,
      food: 0.09,
      transport: 0.04,
      health: 0.02,
      entertainment: 0.08,
      shopping: 0.12,
      savings: 0.40,
    },
    tips: [
      "🚀 Hyper-Compounding: Saving 40% builds a 6-month safety net in just 9 months.",
      "🛍️ 72-Hour Cooldown: Delay non-essential purchases for 3 days to wipe out impulse buying.",
      "🍲 Smart Batching: Preparing home meals & coffee recovers 10–15% of food spend immediately.",
    ],
  },
  {
    id: "student",
    name: "Student & Lean",
    tagline: "Essentials-heavy model for students, early careers & lean seasons",
    badge: "Cost Minimalist",
    splitSummary: "70% Needs · 15% Wants · 15% Savings",
    needsPct: 70,
    wantsPct: 15,
    savingsPct: 15,
    ratios: {
      housing: 0.40,
      food: 0.18,
      transport: 0.08,
      health: 0.04,
      entertainment: 0.07,
      shopping: 0.08,
      savings: 0.15,
    },
    tips: [
      "🎓 Shared Resources: Maximize student passes, shared utility bundles & campus facilities.",
      "🎬 Free Perks: Capitalize on student discounts, local libraries & community events.",
      "🛡️ Micro-Emergency Buffer: Even 15% monthly builds an indispensable buffer against emergencies.",
    ],
  },
  {
    id: "lifestyle",
    name: "Comfort & Lifestyle",
    tagline: "Higher discretionary allowance for dining out, travel & social experiences",
    badge: "Lifestyle 35%",
    splitSummary: "50% Needs · 35% Wants · 15% Savings",
    needsPct: 50,
    wantsPct: 35,
    savingsPct: 15,
    ratios: {
      housing: 0.30,
      food: 0.13,
      transport: 0.04,
      health: 0.03,
      entertainment: 0.15,
      shopping: 0.20,
      savings: 0.15,
    },
    tips: [
      "🏖️ Guilt-Free Leisure: Since essentials & 15% savings are locked, enjoy your wants with zero anxiety.",
      "💳 Reward Optimization: Channel planned dining & travel spends through high-cashback cards.",
      "🔍 Quarterly Audit: Review active recurring subscriptions every 90 days to eliminate unused apps.",
    ],
  },
];

interface BudgetSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  transactions: Transaction[];
  currentBudgets: Budget[];
  onApplyBudgets: (newBudgets: Budget[]) => void;
}

function BudgetSuggestionModal({
  isOpen,
  onClose,
  currency,
  transactions,
  currentBudgets,
  onApplyBudgets,
}: BudgetSuggestionModalProps) {
  if (!isOpen) return null;

  const recordedIncome = transactions
    .filter(t => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const defaultSeed = recordedIncome > 0
    ? Math.round(recordedIncome)
    : (currency === "₹" ? 50000 : 3500);

  const [income, setIncome] = useState<number>(defaultSeed);
  const [strategyId, setStrategyId] = useState<string>("balanced");
  const [customDeltas, setCustomDeltas] = useState<Record<string, number>>({});
  const [appliedToast, setAppliedToast] = useState(false);

  const strategy = BUDGET_STRATEGIES.find(s => s.id === strategyId) || BUDGET_STRATEGIES[0];

  const baseAmounts: Record<string, number> = {
    housing: Math.round(income * strategy.ratios.housing),
    food: Math.round(income * strategy.ratios.food),
    transport: Math.round(income * strategy.ratios.transport),
    health: Math.round(income * strategy.ratios.health),
    entertainment: Math.round(income * strategy.ratios.entertainment),
    shopping: Math.round(income * strategy.ratios.shopping),
    savings: Math.round(income * strategy.ratios.savings),
  };

  function getAmount(key: string): number {
    const base = baseAmounts[key] || 0;
    const delta = customDeltas[key] || 0;
    return Math.max(0, base + delta);
  }

  function handleAdjustDelta(key: string, step: number) {
    setCustomDeltas(prev => {
      const cur = prev[key] || 0;
      return { ...prev, [key]: cur + step };
    });
  }

  function handleResetDeltas() {
    setCustomDeltas({});
  }

  const presets = currency === "₹"
    ? [25000, 50000, 100000, 200000]
    : [1500, 3000, 5000, 8000];

  const stepDelta = currency === "₹" ? 500 : 50;

  const foodAmt = getAmount("food");
  const entAmt = getAmount("entertainment");
  const shopAmt = getAmount("shopping");
  const savingsAmt = getAmount("savings");
  const housingAmt = getAmount("housing");
  const transportAmt = getAmount("transport");
  const healthAmt = getAmount("health");

  const dailyDiscretionary = (foodAmt + entAmt + shopAmt) / 30;
  const annualSavings = savingsAmt * 12;
  const monthlyNeeds = housingAmt + foodAmt + transportAmt + healthAmt;
  const emergencyTarget = monthlyNeeds * 3;
  const monthsToEmergency = savingsAmt > 0 ? (emergencyTarget / savingsAmt).toFixed(1) : "—";

  function handleApply() {
    const updated: Budget[] = DEFAULT_BUDGETS.map(def => {
      const suggested = getAmount(def.category);
      return {
        ...def,
        limit: suggested > 0 ? suggested : def.limit,
      };
    });
    onApplyBudgets(updated);
    setAppliedToast(true);
    setTimeout(() => {
      setAppliedToast(false);
      onClose();
    }, 400);
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(6px)",
          zIndex: 60,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "92%",
          background: "var(--card)",
          borderTop: "1px solid var(--border)",
          borderRadius: "28px 28px 0 0",
          zIndex: 70,
          padding: "0 20px 32px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -20px 50px rgba(0,0,0,0.8)",
        }}
      >
        {/* drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div style={{ width: 44, height: 4, borderRadius: 2, background: "var(--border)" }} />
        </div>

        {/* header */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: "rgba(184, 255, 87, 0.15)", color: "var(--primary)" }}
            >
              🪄
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                Finest Budget Advisor
              </p>
              <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                Give your money, get the finest budget blueprint
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              color: "var(--muted-foreground)",
              fontSize: 22,
              lineHeight: 1,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto pr-1 flex flex-col gap-4 mb-3" style={{ maxHeight: "68vh" }}>
          {/* 1. Money / Income Input Card */}
          <div
            className="p-4 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(30, 30, 34, 0.9) 0%, rgba(20, 20, 24, 0.9) 100%)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Your Monthly Income / Available Money
              </label>
              {recordedIncome > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIncome(Math.round(recordedIncome));
                    handleResetDeltas();
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md font-semibold transition hover:opacity-80"
                  style={{
                    background: "rgba(184, 255, 87, 0.15)",
                    color: "var(--primary)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ⚡ Use Logged ({fmtAbs(recordedIncome, currency)})
                </button>
              )}
            </div>

            <div
              className="flex items-center gap-2 rounded-xl px-3.5 py-3 mb-2.5"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <span className="text-xl font-bold font-mono" style={{ color: "var(--primary)" }}>
                {currency}
              </span>
              <input
                type="number"
                min="100"
                step="50"
                value={income}
                onChange={e => {
                  const val = Math.max(0, parseFloat(e.target.value) || 0);
                  setIncome(val);
                }}
                className="w-full text-2xl font-bold bg-transparent focus:outline-none"
                style={{ color: "var(--foreground)", fontFamily: "var(--font-mono)" }}
                placeholder="Enter amount..."
              />
            </div>

            {/* Quick chips */}
            <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
              {presets.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setIncome(p);
                    handleResetDeltas();
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold font-mono shrink-0 transition"
                  style={{
                    background: income === p ? "var(--primary)" : "var(--secondary)",
                    color: income === p ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    border: `1px solid ${income === p ? "var(--primary)" : "var(--border)"}`,
                    cursor: "pointer",
                  }}
                >
                  {fmtAbs(p, currency)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Financial Persona / Strategy Tabs */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>
              Choose Your Financial Strategy
            </p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {BUDGET_STRATEGIES.map(s => {
                const isSelected = strategyId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setStrategyId(s.id);
                      handleResetDeltas();
                    }}
                    className="p-2.5 rounded-xl text-left transition relative flex flex-col justify-between"
                    style={{
                      background: isSelected ? "rgba(184, 255, 87, 0.08)" : "var(--secondary)",
                      border: `1px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold truncate" style={{ color: isSelected ? "var(--primary)" : "var(--foreground)" }}>
                          {s.name}
                        </span>
                      </div>
                      <p className="text-[10px] line-clamp-2 leading-tight" style={{ color: "var(--muted-foreground)" }}>
                        {s.tagline}
                      </p>
                    </div>
                    <span
                      className="mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded self-start"
                      style={{
                        background: isSelected ? "var(--primary)" : "rgba(255,255,255,0.05)",
                        color: isSelected ? "var(--primary-foreground)" : "var(--muted-foreground)",
                      }}
                    >
                      {s.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Split Bar Visualizer */}
            <div className="p-3 rounded-xl" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
              <div className="flex justify-between items-center text-[11px] font-mono mb-1.5">
                <span className="font-semibold" style={{ color: "var(--foreground)" }}>Split Allocation</span>
                <span style={{ color: "var(--muted-foreground)" }}>{strategy.splitSummary}</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div style={{ width: `${strategy.needsPct}%`, background: "#57b8ff" }} title={`Needs: ${strategy.needsPct}%`} />
                <div style={{ width: `${strategy.wantsPct}%`, background: "#d557ff" }} title={`Wants: ${strategy.wantsPct}%`} />
                <div style={{ width: `${strategy.savingsPct}%`, background: "var(--primary)" }} title={`Savings: ${strategy.savingsPct}%`} />
              </div>
              <div className="flex justify-between text-[10px] mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "#57b8ff" }}></span>Needs ({strategy.needsPct}%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "#d557ff" }}></span>Wants ({strategy.wantsPct}%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--primary)" }}></span>Savings ({strategy.savingsPct}%)</span>
              </div>
            </div>
          </div>

          {/* 3. Financial Health Metrics Trio */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl text-center" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
              <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--muted-foreground)" }}>Daily Safe Spend</p>
              <p className="text-sm font-bold mt-1 font-mono" style={{ color: "var(--primary)" }}>
                {fmtAbs(dailyDiscretionary, currency)}
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>discretionary/day</p>
            </div>

            <div className="p-2.5 rounded-xl text-center" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
              <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--muted-foreground)" }}>1-Yr Savings</p>
              <p className="text-sm font-bold mt-1 font-mono" style={{ color: "#57ffd4" }}>
                +{fmtAbs(annualSavings, currency)}
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>projected wealth</p>
            </div>

            <div className="p-2.5 rounded-xl text-center" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
              <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--muted-foreground)" }}>Emergency Net</p>
              <p className="text-sm font-bold mt-1 font-mono" style={{ color: "#ffa657" }}>
                {monthsToEmergency} mo
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>to 3-mo buffer</p>
            </div>
          </div>

          {/* 4. Category Breakdown List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                The Suggested Expense Breakdown
              </p>
              {Object.keys(customDeltas).length > 0 && (
                <button
                  type="button"
                  onClick={handleResetDeltas}
                  className="text-[10px] text-xs underline"
                  style={{ color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Reset fine-tuning
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {[
                {
                  key: "housing",
                  label: "Housing & Living",
                  icon: "🏠",
                  color: "#ffa657",
                  guide: "Rent/mortgage, maintenance, utilities & insurance",
                  pct: (strategy.ratios.housing * 100).toFixed(0),
                },
                {
                  key: "food",
                  label: "Food & Dining",
                  icon: "🍜",
                  color: "#b8ff57",
                  guide: `~${fmtAbs(foodAmt / 4, currency)}/week for groceries, pantry & eating out`,
                  pct: (strategy.ratios.food * 100).toFixed(0),
                },
                {
                  key: "transport",
                  label: "Transport & Transit",
                  icon: "🚇",
                  color: "#57b8ff",
                  guide: "Transit passes, rideshare, gas & vehicle upkeep",
                  pct: (strategy.ratios.transport * 100).toFixed(0),
                },
                {
                  key: "entertainment",
                  label: "Entertainment & Leisure",
                  icon: "🎬",
                  color: "#d557ff",
                  guide: "Movies, concerts, dining experiences & hobbies",
                  pct: (strategy.ratios.entertainment * 100).toFixed(0),
                },
                {
                  key: "health",
                  label: "Health & Wellness",
                  icon: "🩺",
                  color: "#ff57b8",
                  guide: "Gym memberships, pharmacy, dental & preventative care",
                  pct: (strategy.ratios.health * 100).toFixed(0),
                },
                {
                  key: "shopping",
                  label: "Shopping & Personal",
                  icon: "🛍",
                  color: "#57ffd4",
                  guide: "Clothing, gadgets, accessories & home needs",
                  pct: (strategy.ratios.shopping * 100).toFixed(0),
                },
                {
                  key: "savings",
                  label: "Savings & Investments",
                  icon: "💰",
                  color: "var(--primary)",
                  guide: "Automated deposit into high-yield account or funds",
                  pct: (strategy.ratios.savings * 100).toFixed(0),
                  isSavings: true,
                },
              ].map(item => {
                const amt = getAmount(item.key);
                const actualPct = income > 0 ? ((amt / income) * 100).toFixed(0) : "0";

                return (
                  <div
                    key={item.key}
                    className="p-3 rounded-xl transition"
                    style={{
                      background: item.isSavings ? "rgba(184, 255, 87, 0.05)" : "rgba(255, 255, 255, 0.02)",
                      border: `1px solid ${item.isSavings ? "rgba(184, 255, 87, 0.3)" : "var(--border)"}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.icon}</span>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                            {item.label}
                          </p>
                          <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                            {item.guide}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold font-mono" style={{ color: item.color }}>
                          {fmtAbs(amt, currency)}
                        </p>
                        <span
                          className="text-[9px] font-mono px-1 rounded"
                          style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
                        >
                          {actualPct}%
                        </span>
                      </div>
                    </div>

                    {/* Stepper adjustment chips */}
                    {!item.isSavings && (
                      <div className="flex justify-end gap-1.5 mt-1 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                        <span className="text-[10px] self-center mr-auto" style={{ color: "var(--muted-foreground)" }}>Tweak:</span>
                        <button
                          type="button"
                          onClick={() => handleAdjustDelta(item.key, -stepDelta)}
                          className="text-[10px] px-1.5 py-0.5 rounded font-mono hover:opacity-80"
                          style={{ background: "var(--secondary)", color: "var(--muted-foreground)", border: "1px solid var(--border)", cursor: "pointer" }}
                        >
                          −{currency}{stepDelta}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustDelta(item.key, stepDelta)}
                          className="text-[10px] px-1.5 py-0.5 rounded font-mono hover:opacity-80"
                          style={{ background: "var(--secondary)", color: "var(--primary)", border: "1px solid var(--border)", cursor: "pointer" }}
                        >
                          +{currency}{stepDelta}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Strategy Management Golden Rules */}
          <div className="p-3.5 rounded-xl" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "var(--primary)" }}>
              <span>💡</span> Expense Management Playbook
            </p>
            <div className="flex flex-col gap-2">
              {strategy.tips.map((tip, idx) => (
                <div key={idx} className="text-xs leading-relaxed" style={{ color: "var(--foreground)" }}>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-98 flex items-center justify-center gap-2"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(184, 255, 87, 0.35)",
            }}
          >
            {appliedToast ? (
              <span>✓ Finest Budget Applied to App!</span>
            ) : (
              <>
                <span>🪄</span>
                <span>Apply This Budget to My App</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Budgets Screen ───────────────────────────────────────────────────────────

interface BudgetsScreenProps {
  user: User;
  transactions: Transaction[];
  budgets: Budget[];
  onOpenBudgetModal: () => void;
  onEditCategory: (category: Category) => void;
  onOpenSuggestModal: () => void;
}

function BudgetsScreen({ user, transactions, budgets, onOpenBudgetModal, onEditCategory, onOpenSuggestModal }: BudgetsScreenProps) {
  const currency = user.currency || "$";
  const activeBudgets = budgets && budgets.length > 0 ? budgets : DEFAULT_BUDGETS;

  function spentInCategory(cat: Category) {
    return transactions.filter(t => t.category === cat && t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
  }

  const totalBudget = activeBudgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = activeBudgets.reduce((s, b) => s + spentInCategory(b.category), 0);
  const pctUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-12 pb-4 flex justify-between items-end">
        <div>
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--muted-foreground)" }}>
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          <p className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>Budgets</p>
        </div>
        <button
          id="set-budget-btn"
          onClick={() => onOpenBudgetModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold hover:opacity-90 active:scale-95 transition"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 0 14px rgba(184, 255, 87, 0.25)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span>Set Budget</span>
        </button>
      </div>

      {/* Smart Budget Architect recommendation banner */}
      <div className="px-5 mb-4">
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(184, 255, 87, 0.12) 0%, rgba(87, 184, 255, 0.08) 100%)",
            border: "1px solid rgba(184, 255, 87, 0.3)",
            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                  style={{ background: "rgba(184, 255, 87, 0.2)", color: "var(--primary)" }}>
                  ✨ Smart Advisor
                </span>
              </div>
              <p className="text-sm font-semibold mt-1" style={{ color: "var(--foreground)" }}>
                Get The Finest Budget Breakdown
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                Give your money, and let financial models calculate the finest expense limits for your goals.
              </p>
            </div>
          </div>
          <button
            id="suggest-budget-btn"
            onClick={onOpenSuggestModal}
            className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition hover:opacity-95 active:scale-98"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 16px rgba(184, 255, 87, 0.25)",
            }}
          >
            <span>🪄</span> Suggest My Budget Plan
          </button>
        </div>
      </div>
      <div className="px-5 mb-5">
        <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)" }}>Total spent</p>
              <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)" }}>{fmtAbs(totalSpent, currency)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs pb-0.5" style={{ color: "var(--muted-foreground)" }}>of {fmtAbs(totalBudget, currency)}</p>
              <p className="text-xs font-medium" style={{ fontFamily: "var(--font-mono)", color: totalRemaining >= 0 ? "var(--primary)" : "#ff5757" }}>
                {totalRemaining >= 0 ? `${fmtAbs(totalRemaining, currency)} left` : `${fmtAbs(Math.abs(totalRemaining), currency)} over`}
              </p>
            </div>
          </div>
          <div style={{ background: "var(--secondary)", height: "6px", borderRadius: "3px" }}>
            <div style={{ width: `${Math.min(pctUsed, 100)}%`, height: "6px", borderRadius: "3px", background: pctUsed > 100 ? "#ff5757" : pctUsed > 85 ? "var(--warning)" : "var(--primary)", transition: "width 0.4s" }} />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{pctUsed.toFixed(1)}% of monthly budget used</p>
            <button
              onClick={() => onOpenBudgetModal()}
              className="text-xs hover:underline"
              style={{ color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Edit Limits
            </button>
          </div>
        </div>
      </div>
      <div className="px-5 pb-6 flex flex-col gap-3">
        {activeBudgets.map(b => {
          const spent = spentInCategory(b.category);
          const pct = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 100;
          const over = spent > b.limit;
          const color = over ? "#ff5757" : CATEGORY_COLORS[b.category];
          const remaining = b.limit - spent;
          return (
            <div key={b.category} className="rounded-xl p-4"
              style={{ background: "var(--card)", border: `1px solid ${over ? "#ff575740" : "var(--border)"}` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_ICONS[b.category]}</span>
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{b.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {over && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "#ff575718", color: "#ff5757", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                      OVER
                    </span>
                  )}
                  <button
                    onClick={() => onEditCategory(b.category)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs hover:bg-[var(--secondary)] transition"
                    style={{ color: "var(--muted-foreground)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", cursor: "pointer" }}
                    title={`Edit ${b.label} budget`}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                </div>
              </div>
              <div style={{ background: "var(--secondary)", height: "4px", borderRadius: "2px", marginBottom: "10px" }}>
                <div style={{ width: `${pct}%`, height: "4px", background: color, borderRadius: "2px", transition: "width 0.4s" }} />
              </div>
              <div className="flex justify-between items-baseline">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-semibold" style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)" }}>{fmtAbs(spent, currency)}</span>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>/ {fmtAbs(b.limit, currency)}</span>
                </div>
                <span className="text-xs" style={{ fontFamily: "var(--font-mono)", color: over ? "#ff5757" : color }}>
                  {over ? `${fmtAbs(Math.abs(remaining), currency)} over` : `${fmtAbs(remaining, currency)} left`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

type Screen = "home" | "transactions" | "budgets";

const NAV_ITEMS: { id: Screen; label: string; icon: React.ReactNode }[] = [
  {
    id: "home", label: "Home",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "transactions", label: "Transactions",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    id: "budgets", label: "Budgets",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
      </svg>
    ),
  },
];

// ─── App Shell ────────────────────────────────────────────────────────────────

function AppShell() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("expense_current_user_v1");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [screen, setScreen] = useState<Screen>("home");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const userStr = localStorage.getItem("expense_current_user_v1");
      if (userStr) {
        const user = JSON.parse(userStr);
        const saved = localStorage.getItem(`expense_budgets_${user.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return DEFAULT_BUDGETS.map(def => {
              const found = parsed.find((b: Budget) => b.category === def.category);
              return found ? { ...def, limit: Number(found.limit) >= 0 ? Number(found.limit) : def.limit } : def;
            });
          }
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_BUDGETS;
  });

  // Load user's private transactions when user logs in
  useEffect(() => {
    if (!currentUser) {
      setTransactions([]);
      return;
    }
    try {
      const key = `expense_txs_${currentUser.id}`;
      const saved = localStorage.getItem(key);
      setTransactions(saved ? JSON.parse(saved) : []);
    } catch {
      setTransactions([]);
    }
  }, [currentUser?.id]);

  // Save transactions to user's private key
  useEffect(() => {
    if (!currentUser) return;
    try {
      const key = `expense_txs_${currentUser.id}`;
      localStorage.setItem(key, JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions, currentUser?.id]);

  // Load user's private budgets when user logs in
  useEffect(() => {
    if (!currentUser) {
      setBudgets(DEFAULT_BUDGETS);
      return;
    }
    try {
      const key = `expense_budgets_${currentUser.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = DEFAULT_BUDGETS.map(def => {
            const found = parsed.find((b: Budget) => b.category === def.category);
            return found ? { ...def, limit: Number(found.limit) >= 0 ? Number(found.limit) : def.limit } : def;
          });
          setBudgets(merged);
          return;
        }
      }
    } catch {
      // ignore
    }
    setBudgets(DEFAULT_BUDGETS);
  }, [currentUser?.id]);

  function handleLogin(user: User) {
    setCurrentUser(user);
    localStorage.setItem("expense_current_user_v1", JSON.stringify(user));
  }

  function handleLogout() {
    setCurrentUser(null);
    localStorage.removeItem("expense_current_user_v1");
    setShowProfile(false);
  }

  function handleUpdateCurrency(newCurrency: string) {
    if (!currentUser) return;
    const updated = { ...currentUser, currency: newCurrency };
    setCurrentUser(updated);
    localStorage.setItem("expense_current_user_v1", JSON.stringify(updated));

    // Update in stored accounts list as well
    try {
      const accounts: StoredAccount[] = JSON.parse(localStorage.getItem("expense_accounts_v1") || "[]");
      const idx = accounts.findIndex(a => a.id === currentUser.id);
      if (idx !== -1) {
        accounts[idx].currency = newCurrency;
        localStorage.setItem("expense_accounts_v1", JSON.stringify(accounts));
      }
    } catch {
      // ignore
    }
  }

  function handleSaveBudgets(updatedBudgets: Budget[]) {
    setBudgets(updatedBudgets);
    if (currentUser) {
      try {
        localStorage.setItem(`expense_budgets_${currentUser.id}`, JSON.stringify(updatedBudgets));
      } catch {
        // ignore
      }
    }
  }

  function handleResetBudgets() {
    setBudgets(DEFAULT_BUDGETS);
    if (currentUser) {
      try {
        localStorage.removeItem(`expense_budgets_${currentUser.id}`);
      } catch {
        // ignore
      }
    }
  }

  function handleOpenBudgetModal(category: Category | null = null) {
    setEditingCategory(category);
    setShowBudgetModal(true);
  }

  function handleApplySuggestedBudgets(newBudgets: Budget[]) {
    handleSaveBudgets(newBudgets);
    setScreen("budgets");
  }

  function addTransaction(t: Omit<Transaction, "id">) {
    setTransactions(prev => [{ ...t, id: Date.now() }, ...prev]);
  }

  function deleteTransaction(id: number) {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }

  function resetToZero() {
    if (confirm("Reset your balance and transactions to 0?")) {
      setTransactions([]);
      if (currentUser) {
        localStorage.removeItem(`expense_txs_${currentUser.id}`);
      }
    }
  }

  // If not logged in, show Auth Screen
  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const bottomNav = (
    <div className="shrink-0 pb-6 pt-2" style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}>
      <div className="flex justify-around">
        {NAV_ITEMS.map(item => {
          const active = screen === item.id;
          return (
            <button key={item.id} onClick={() => setScreen(item.id)}
              className="flex flex-col items-center gap-1 px-5 py-1"
              style={{ color: active ? "var(--primary)" : "var(--muted-foreground)", transition: "color 0.15s", background: "none", border: "none", cursor: "pointer" }}>
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* ── desktop: phone frame ── */}
      <div className="hidden sm:flex min-h-screen items-center justify-center p-4"
        style={{ background: "#050507", fontFamily: "var(--font-sans)" }}>
        <div className="relative flex flex-col overflow-hidden"
          style={{
            width: "390px", height: "844px",
            background: "var(--background)", borderRadius: "44px",
            boxShadow: "0 0 0 1px #ffffff10, 0 40px 80px #00000080, inset 0 1px 0 #ffffff08",
          }}>
          {/* status bar */}
          <div className="shrink-0 flex justify-between items-center px-8 pt-3 pb-1"
            style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}>
            <span>9:41</span>
            <div className="flex gap-2 items-center">
              <button
                onClick={resetToZero}
                title="Reset balance to 0"
                style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", fontSize: "11px" }}>
                ↺ Reset
              </button>
              <button
                onClick={() => setShowProfile(true)}
                title="My Account"
                style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "11px" }}>
                Account
              </button>
            </div>
            <div className="flex gap-1.5 items-center"><span>●●●</span><span>100%</span></div>
          </div>

          <div className="flex-1 overflow-hidden">
            {screen === "home" && (
              <HomeScreen
                user={currentUser}
                transactions={transactions}
                budgets={budgets}
                onAdd={() => setShowAdd(true)}
                onDelete={deleteTransaction}
                onOpenProfile={() => setShowProfile(true)}
                onOpenBudgets={() => setScreen("budgets")}
                onOpenSuggestModal={() => setShowSuggestModal(true)}
              />
            )}
            {screen === "transactions" && (
              <TransactionsScreen
                user={currentUser}
                transactions={transactions}
                onDelete={deleteTransaction}
              />
            )}
            {screen === "budgets" && (
              <BudgetsScreen
                user={currentUser}
                transactions={transactions}
                budgets={budgets}
                onOpenBudgetModal={() => handleOpenBudgetModal(null)}
                onEditCategory={(cat) => handleOpenBudgetModal(cat)}
                onOpenSuggestModal={() => setShowSuggestModal(true)}
              />
            )}
          </div>

          {bottomNav}

          <div className="flex justify-center pb-2">
            <div className="w-32 h-1 rounded-full" style={{ background: "var(--border)" }} />
          </div>

          {/* add sheet */}
          {showAdd && (
            <AddSheet
              onClose={() => setShowAdd(false)}
              onAdd={addTransaction}
              currency={currentUser.currency || "$"}
            />
          )}

          {/* profile modal */}
          {showProfile && (
            <ProfileModal
              user={currentUser}
              onClose={() => setShowProfile(false)}
              onLogout={handleLogout}
              onUpdateCurrency={handleUpdateCurrency}
              transactionCount={transactions.length}
            />
          )}

          {/* budget modal */}
          {showBudgetModal && (
            <BudgetModal
              isOpen={showBudgetModal}
              onClose={() => {
                setShowBudgetModal(false);
                setEditingCategory(null);
              }}
              budgets={budgets}
              onSave={handleSaveBudgets}
              onReset={handleResetBudgets}
              currency={currentUser.currency || "$"}
              transactions={transactions}
              initialCategory={editingCategory}
              onOpenSuggestModal={() => setShowSuggestModal(true)}
            />
          )}

          {/* budget suggestion modal */}
          {showSuggestModal && (
            <BudgetSuggestionModal
              isOpen={showSuggestModal}
              onClose={() => setShowSuggestModal(false)}
              currency={currentUser.currency || "$"}
              transactions={transactions}
              currentBudgets={budgets}
              onApplyBudgets={handleApplySuggestedBudgets}
            />
          )}
        </div>
      </div>

      {/* ── mobile: fills viewport ── */}
      <div className="flex sm:hidden flex-col h-screen"
        style={{ background: "var(--background)", fontFamily: "var(--font-sans)", position: "relative" }}>
        <div className="shrink-0 flex justify-between items-center px-6 pt-3 pb-1"
          style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}>
          <span>9:41</span>
          <div className="flex gap-2 items-center">
            <button
              onClick={resetToZero}
              title="Reset balance to 0"
              style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", fontSize: "11px" }}>
              ↺ Reset
            </button>
            <button
              onClick={() => setShowProfile(true)}
              title="My Account"
              style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "11px" }}>
              Account
            </button>
          </div>
          <div className="flex gap-1.5 items-center"><span>●●●</span><span>100%</span></div>
        </div>

        <div className="flex-1 overflow-hidden">
          {screen === "home" && (
            <HomeScreen
              user={currentUser}
              transactions={transactions}
              budgets={budgets}
              onAdd={() => setShowAdd(true)}
              onDelete={deleteTransaction}
              onOpenProfile={() => setShowProfile(true)}
              onOpenBudgets={() => setScreen("budgets")}
              onOpenSuggestModal={() => setShowSuggestModal(true)}
            />
          )}
          {screen === "transactions" && (
            <TransactionsScreen
              user={currentUser}
              transactions={transactions}
              onDelete={deleteTransaction}
            />
          )}
          {screen === "budgets" && (
            <BudgetsScreen
              user={currentUser}
              transactions={transactions}
              budgets={budgets}
              onOpenBudgetModal={() => handleOpenBudgetModal(null)}
              onEditCategory={(cat) => handleOpenBudgetModal(cat)}
              onOpenSuggestModal={() => setShowSuggestModal(true)}
            />
          )}
        </div>

        {bottomNav}

        {showAdd && (
          <AddSheet
            onClose={() => setShowAdd(false)}
            onAdd={addTransaction}
            currency={currentUser.currency || "$"}
          />
        )}

        {showProfile && (
          <ProfileModal
            user={currentUser}
            onClose={() => setShowProfile(false)}
            onLogout={handleLogout}
            onUpdateCurrency={handleUpdateCurrency}
            transactionCount={transactions.length}
          />
        )}

        {/* budget modal */}
        {showBudgetModal && (
          <BudgetModal
            isOpen={showBudgetModal}
            onClose={() => {
              setShowBudgetModal(false);
              setEditingCategory(null);
            }}
            budgets={budgets}
            onSave={handleSaveBudgets}
            onReset={handleResetBudgets}
            currency={currentUser.currency || "$"}
            transactions={transactions}
            initialCategory={editingCategory}
            onOpenSuggestModal={() => setShowSuggestModal(true)}
          />
        )}

        {/* budget suggestion modal */}
        {showSuggestModal && (
          <BudgetSuggestionModal
            isOpen={showSuggestModal}
            onClose={() => setShowSuggestModal(false)}
            currency={currentUser.currency || "$"}
            transactions={transactions}
            currentBudgets={budgets}
            onApplyBudgets={handleApplySuggestedBudgets}
          />
        )}
      </div>
    </>
  );
}

export default function App() {
  return <AppShell />;
}
