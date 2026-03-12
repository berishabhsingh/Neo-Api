"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { LiveChart } from "../../components/LiveChart";
import { ArrowUpRight, Wallet, Briefcase, IndianRupee } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "../../store/useStore";

export default function DashboardPage() {
  const router = useRouter();
  const { isLoggedIn } = useStore();
  const [limits, setLimits] = useState<any>(null);
  const [positions, setPositions] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [limitsRes, positionsRes] = await Promise.all([
          fetch("http://localhost:8000/api/orders/limits"),
          fetch("http://localhost:8000/api/orders/positions")
        ]);

        const limitsData = await limitsRes.json();
        const positionsData = await positionsRes.json();

        setLimits(limitsData.data || { available_margin: 0, used_margin: 0 });
        setPositions(positionsData.data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-950 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-400">Overview of your account, limits, and live market data.</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Available Margin</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    ₹{limits?.available_margin?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="rounded-full bg-blue-900/50 p-3 text-blue-400">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Used Margin</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    ₹{limits?.used_margin?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="rounded-full bg-orange-900/50 p-3 text-orange-400">
                  <IndianRupee className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Active Positions</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {positions.length}
                  </p>
                </div>
                <div className="rounded-full bg-emerald-900/50 p-3 text-emerald-400">
                  <Briefcase className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <LiveChart instrumentToken="NIFTY" />
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Trade</h3>
                <form className="space-y-4">
                  <div>
                     <label className="text-sm text-gray-400">Symbol</label>
                     <input type="text" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white text-sm" placeholder="NIFTY 50" defaultValue="NIFTY"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-sm text-gray-400">Qty</label>
                       <input type="number" className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white text-sm" defaultValue={1}/>
                     </div>
                     <div>
                       <label className="text-sm text-gray-400">Order Type</label>
                       <select className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white text-sm">
                         <option>MKT</option>
                         <option>LMT</option>
                       </select>
                     </div>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button type="button" className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md">BUY</button>
                    <button type="button" className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md">SELL</button>
                  </div>
                </form>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-white mb-4">Watchlist</h3>
                <div className="space-y-3">
                  {["RELIANCE", "TCS", "HDFCBANK"].map((symbol) => (
                    <div key={symbol} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                      <span className="text-sm font-medium text-gray-200">{symbol}</span>
                      <span className="text-sm text-emerald-400 flex items-center">
                        +1.2% <ArrowUpRight className="h-3 w-3 ml-1" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
