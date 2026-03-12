"use client";

import React, { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";
import { useStore } from "../store/useStore";

interface LiveChartProps {
  instrumentToken: string;
}

export function LiveChart({ instrumentToken }: LiveChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const { prices, updatePrice } = useStore();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "#111827" }, // tailwind gray-900
          textColor: "#9CA3AF", // tailwind gray-400
        },
        grid: {
          vertLines: { color: "#1F2937" }, // tailwind gray-800
          horzLines: { color: "#1F2937" },
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: "#10B981", // tailwind emerald-500
        downColor: "#EF4444", // tailwind red-500
        borderVisible: false,
        wickUpColor: "#10B981",
        wickDownColor: "#EF4444",
      });

      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

      // Init historical data
      const initialData = [
        { time: (Date.now() - 86400000 * 2) / 1000 as any, open: 100, high: 102, low: 99, close: 101 },
        { time: (Date.now() - 86400000 * 1) / 1000 as any, open: 101, high: 105, low: 100, close: 104 },
      ];
      candlestickSeries.setData(initialData);

      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.remove();
      };
    }
  }, []);

  useEffect(() => {
    let reconnectTimeout: any;

    const connectWebSocket = () => {
      wsRef.current = new WebSocket("ws://localhost:8000/ws/market");

      wsRef.current.onopen = () => {
        console.log("WS Connected");
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            action: "subscribe",
            tokens: [{ instrument_token: instrumentToken, exchange_segment: "nse_cm" }]
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type !== "error" && msg.type !== "close" && msg.type !== "open") {
            const data = msg[0];
            if (data && data.instrument_token === instrumentToken && seriesRef.current) {
               const newBar = {
                  time: (Date.now() / 1000) as any,
                  open: data.ohlc?.open || data.ltp,
                  high: data.ohlc?.high || data.ltp,
                  low: data.ohlc?.low || data.ltp,
                  close: data.ltp
               };
               seriesRef.current.update(newBar);
               updatePrice(instrumentToken, newBar);
            }
          }
        } catch (e) {
          console.error("Failed to parse WS message", e);
        }
      };

      wsRef.current.onclose = () => {
        console.log("WS Disconnected. Attempting to reconnect in 3s...");
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error("WS Error:", error);
      };
    };

    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          action: "unsubscribe",
          tokens: [{ instrument_token: instrumentToken, exchange_segment: "nse_cm" }]
        }));
        wsRef.current.close();
      }
    };
  }, [instrumentToken, updatePrice]);

  return (
    <div className="w-full rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
         <h3 className="text-lg font-semibold text-white">Live Chart - {instrumentToken}</h3>
         <div className="flex items-center gap-2">
           <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
           <span className="text-sm text-gray-400">Live</span>
         </div>
      </div>
      <div ref={chartContainerRef} className="h-[400px] w-full" />
    </div>
  );
}
