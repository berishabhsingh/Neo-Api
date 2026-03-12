"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { useStore } from "../../store/useStore";
import { Shield, AlertTriangle } from "lucide-react";

export default function RiskPage() {
  const { isLoggedIn } = useStore();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/risk/");
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleKillSwitch = async (currentState: boolean) => {
    try {
      await fetch(`http://localhost:8000/api/risk/kill_switch?state=${!currentState}`, {
        method: "POST"
      });
      fetchConfig();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-950 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Risk Management
            </h1>
            <p className="mt-2 text-sm text-gray-400">Configure global risk guards and kill switch.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                 <Shield className="h-6 w-6 text-blue-400"/> Security Controls
              </h3>

              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700">
                    <div>
                      <h4 className="font-semibold text-lg flex items-center gap-2 text-red-400">
                         <AlertTriangle className="h-5 w-5"/> Global Kill Switch
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Instantly halt all automated trading strategies and cancel pending orders.
                      </p>
                    </div>

                    <button
                      onClick={() => toggleKillSwitch(config?.global_kill_switch || false)}
                      className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                        config?.global_kill_switch
                          ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {config?.global_kill_switch ? "DEACTIVATE KILL SWITCH" : "ACTIVATE KILL SWITCH"}
                    </button>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
                    <h4 className="font-semibold text-lg text-white">Risk Parameters</h4>
                    <div>
                      <label className="text-sm text-gray-400">Max Daily Loss (₹)</label>
                      <input
                        type="number"
                        defaultValue={config?.max_daily_loss}
                        className="w-full mt-1 bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Mode</label>
                      <select
                        defaultValue={config?.paper_trading_mode ? "paper" : "live"}
                        className="w-full mt-1 bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white"
                      >
                        <option value="paper">Paper Trading (Simulated)</option>
                        <option value="live">Live Trading</option>
                      </select>
                    </div>
                    <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium">Save Risk Config</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
