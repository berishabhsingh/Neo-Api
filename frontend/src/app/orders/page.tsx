"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { useStore } from "../../store/useStore";

export default function OrdersPage() {
  const { isLoggedIn } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("http://localhost:8000/api/orders/");
        const data = await res.json();
        setOrders(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-950 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="mt-2 text-sm text-gray-400">View and manage your order history.</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No orders found.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-800/50 text-gray-400">
                  <tr>
                    <th className="p-4 font-medium">Order ID</th>
                    <th className="p-4 font-medium">Symbol</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Qty</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {orders.map((o: any) => (
                    <tr key={o.order_id} className="hover:bg-gray-800/30">
                      <td className="p-4 font-mono text-xs">{o.order_id}</td>
                      <td className="p-4 font-medium">{o.trading_symbol}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${o.transaction_type === 'B' ? 'bg-blue-900/40 text-blue-400' : 'bg-red-900/40 text-red-400'}`}>
                          {o.transaction_type === 'B' ? 'BUY' : 'SELL'}
                        </span>
                      </td>
                      <td className="p-4">{o.quantity}</td>
                      <td className="p-4">₹{o.price || o.trigger_price}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded-md text-xs">
                          {o.status || 'PENDING'}
                        </span>
                      </td>
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
