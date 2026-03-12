"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { useStore } from "../../store/useStore";

export default function LogsPage() {
  const { isLoggedIn } = useStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("http://localhost:8000/api/orders/logs");
        const data = await res.json();
        setLogs(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-950 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Audit Trail</h1>
            <p className="mt-2 text-sm text-gray-400">View real-time system logs, signal generation, and order execution results.</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading logs...</div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No logs found.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-800/50 text-gray-400">
                  <tr>
                    <th className="p-4 font-medium">Timestamp</th>
                    <th className="p-4 font-medium">Symbol</th>
                    <th className="p-4 font-medium">Action</th>
                    <th className="p-4 font-medium">Price/Qty</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-800/30">
                      <td className="p-4 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-4 font-medium">{log.instrument_token}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${log.transaction_type === 'B' ? 'bg-blue-900/40 text-blue-400' : 'bg-red-900/40 text-red-400'}`}>
                          {log.transaction_type === 'B' ? 'BUY' : 'SELL'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300">₹{log.price} x {log.quantity}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          log.status === 'PLACED' ? 'bg-emerald-900/40 text-emerald-400' :
                          log.status === 'SIGNAL_GENERATED' ? 'bg-blue-900/40 text-blue-400' :
                          'bg-red-900/40 text-red-400'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-xs">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
