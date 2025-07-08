// src/hooks/useBinanceCandlestickData.ts
import { useEffect, useState } from "react";

type CandlestickData = {
  e: string;
  E: number;
  s: string;
  k: {
    t: number; // start time
    T: number; // close time
    s: string; // symbol
    i: string; // interval
    f: number;
    L: number;
    o: string; // open
    c: string; // close
    h: string; // high
    l: string; // low
    v: string; // volume
    n: number;
    x: boolean; // is this kline closed?
    q: string;
    V: string;
    Q: string;
    B: string;
  };
};

export const useBinanceCandlestickData = (
  symbol: string = "btcusdt",
  interval: string = "1m"
) => {
  const [candlestickData, setCandlestickData] = useState<CandlestickData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lowerSymbol = symbol.toLowerCase();
    const socket = new WebSocket(
      `wss://stream.binance.com:9443/ws/${lowerSymbol}@kline_${interval}`
    );

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setCandlestickData(data);
      } catch (err) {
        setError("Failed to parse candlestick data.");
        console.error(err);
      }
    };

    socket.onerror = (err) => {
      setError("WebSocket error for candlestick data.");
      console.error(err);
    };

    return () => {
      socket.close();
    };
  }, [symbol, interval]);

  return { candlestickData, error };
};
