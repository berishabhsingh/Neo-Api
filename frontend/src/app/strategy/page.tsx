"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { useStore } from "../../store/useStore";
import { Play, Square, Settings, Plus, Trash2, AlertTriangle } from "lucide-react";

export default function StrategyPage() {
  const { isLoggedIn } = useStore();
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [instrumentToken, setInstrumentToken] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [productType, setProductType] = useState("MIS");
  const [orderType, setOrderType] = useState("MKT");
  const [buyAbove, setBuyAbove] = useState("");
  const [sellBelow, setSellBelow] = useState("");
  const [stopLossPct, setStopLossPct] = useState("");
  const [takeProfitPct, setTakeProfitPct] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/strategies/");
      const data = await res.json();
      setStrategies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      user_id: 1,
      name,
      instrument_token: instrumentToken,
      exchange_segment: "nse_cm",
      quantity,
      product_type: productType,
      order_type: orderType,
      buy_above: buyAbove ? parseFloat(buyAbove) : null,
      sell_below: sellBelow ? parseFloat(sellBelow) : null,
      stop_loss_pct: stopLossPct ? parseFloat(stopLossPct) : null,
      take_profit_pct: takeProfitPct ? parseFloat(takeProfitPct) : null,
    };

    try {
      await fetch("http://localhost:8000/api/strategies/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      fetchStrategies();
      // Reset form
      setName(""); setInstrumentToken(""); setBuyAbove(""); setSellBelow("");
      setStopLossPct(""); setTakeProfitPct("");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStrategy = async (id: number, isActive: boolean) => {
    const endpoint = isActive ? "stop" : "start";
    setErrorMsg("");
    try {
      const res = await fetch(`http://localhost:8000/api/strategies/${id}/${endpoint}`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || "Failed to toggle strategy.");
      }
      fetchStrategies();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to toggle strategy.");
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-950 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Strategy Builder</h1>
            <p className="mt-2 text-sm text-gray-400">Configure and manage automated trading rules.</p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-200 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1 rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-400"/> New Strategy
              </h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Strategy Name</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} type="text" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white text-sm" placeholder="e.g. NIFTY Breakout"/>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Instrument Token</label>
                  <input required value={instrumentToken} onChange={(e) => setInstrumentToken(e.target.value)} type="text" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white text-sm" placeholder="Token ID"/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Quantity</label>
                    <input required value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} type="number" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white text-sm"/>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Product</label>
                    <select value={productType} onChange={(e) => setProductType(e.target.value)} className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white text-sm">
                      <option>MIS</option>
                      <option>NRML</option>
                      <option>CNC</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Buy Above ₹</label>
                    <input value={buyAbove} onChange={(e) => setBuyAbove(e.target.value)} type="number" step="0.05" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white text-sm"/>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Sell Below ₹</label>
                    <input value={sellBelow} onChange={(e) => setSellBelow(e.target.value)} type="number" step="0.05" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white text-sm"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Stop Loss (%)</label>
                    <input value={stopLossPct} onChange={(e) => setStopLossPct(e.target.value)} type="number" step="0.1" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white text-sm"/>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Take Profit (%)</label>
                    <input value={takeProfitPct} onChange={(e) => setTakeProfitPct(e.target.value)} type="number" step="0.1" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white text-sm"/>
                  </div>
                </div>

                <button type="submit" className="w-full mt-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow flex justify-center items-center">
                  Save Rule
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-400"/> Active Strategies
              </h3>

              {strategies.length === 0 && !loading && (
                <div className="rounded-xl border border-dashed border-gray-700 p-12 text-center">
                  <p className="text-gray-400">No strategies found. Create one to get started.</p>
                </div>
              )}

              {strategies.map((s) => (
                <div key={s.id} className={`rounded-xl border p-6 shadow-sm transition-all ${s.is_active ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-gray-800 bg-gray-900 opacity-70'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold flex items-center gap-3 text-white">
                        {s.name}
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${s.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-300'}`}>
                          {s.is_active ? 'RUNNING' : 'DISABLED'}
                        </span>
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Token: {s.instrument_token} | Qty: {s.quantity} | Type: {s.product_type} {s.order_type}
                      </p>
                      <div className="mt-4 flex gap-4 text-sm text-gray-300">
                        {s.buy_above && <span>Buy &gt; ₹{s.buy_above}</span>}
                        {s.sell_below && <span>Sell &lt; ₹{s.sell_below}</span>}
                        {s.stop_loss_pct && <span className="text-red-400">SL: {s.stop_loss_pct}%</span>}
                        {s.take_profit_pct && <span className="text-emerald-400">TP: {s.take_profit_pct}%</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => toggleStrategy(s.id, s.is_active)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                          s.is_active
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                        }`}
                      >
                        {s.is_active ? <><Square className="w-4 h-4"/> Stop</> : <><Play className="w-4 h-4"/> Start</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
