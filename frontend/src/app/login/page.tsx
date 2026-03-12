"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../../store/useStore";
import { ShieldAlert, Loader2, Info } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setLoginDetails, setLoggedIn } = useStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mobileNumber, setMobileNumber] = useState("");
  const [ucc, setUcc] = useState("");
  const [totp, setTotp] = useState("");
  const [mpin, setMpin] = useState("");

  const handleTotpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number: mobileNumber, ucc, totp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "TOTP Login failed");

      setLoginDetails("HIDDEN_IN_BACKEND", mobileNumber, ucc);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMpinVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mpin }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "MPIN Verification failed");

      setLoggedIn(true);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-gray-900 p-8 shadow-2xl border border-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Kotak Neo Auto Trader</h2>
          <p className="mt-2 text-sm text-gray-400">
            {step === 1 ? "Sign in using TOTP" : "Verify MPIN to continue"}
          </p>
        </div>

        <div className="rounded-lg bg-blue-900/20 p-4 border border-blue-900 flex gap-3 text-sm text-blue-300 items-start">
            <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p><strong>Disclaimer:</strong> This application executes automated trading rules. Use Paper Trading mode first to verify your logic. Financial risk is assumed entirely by the user.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-900/50 p-4 text-sm text-red-200 border border-red-800">
            <ShieldAlert className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleTotpLogin}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="+91..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Client Code (UCC)</label>
                <input
                  type="text"
                  required
                  value={ucc}
                  onChange={(e) => setUcc(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Authenticator TOTP</label>
                <input
                  type="text"
                  required
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify TOTP"}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleMpinVerify}>
            <div>
              <label className="text-sm font-medium text-gray-300">Enter MPIN</label>
              <input
                type="password"
                required
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="****"
                maxLength={4}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex w-full justify-center rounded-md border border-gray-600 bg-transparent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
