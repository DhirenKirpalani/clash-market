import { useEffect, useState } from "react";

export interface Candle {
  time: number;  // time in milliseconds (UTC)
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number; // Adding volume for the chart
}

export const useBinanceCandlestickChart = (symbol: string, interval: string) => {
  const [candles, setCandles] = useState<Candle[]>([]);

  useEffect(() => {
    let socket: WebSocket;

    const fetchHistorical = async () => {
      const res = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=100`
      );
      const data = await res.json();
      const formatted = data.map((d: any) => {
        const timeInMs = d[0]; // Binance returns time in milliseconds UTC
        console.log("Raw Time (ms):", timeInMs);  // Log raw time for debug
        return {
          time: timeInMs,  // Keep time in ms UTC
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
          volume: parseFloat(d[5]), // Add volume data from Binance
        };
      });
      setCandles(formatted);
    };

    const subscribeToWebSocket = () => {
      socket = new WebSocket(
        `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`
      );

      socket.onmessage = (event) => {
        const json = JSON.parse(event.data);
        const k = json.k;
        const newCandle: Candle = {
          time: k.t,  // time in milliseconds UTC
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v), // Add volume from WebSocket data
        };

        console.log("WebSocket Raw Time (ms):", newCandle.time);

        setCandles((prev) => {
          const last = prev[prev.length - 1];
          if (last?.time === newCandle.time) {
            // Update last candle if timestamp matches
            return [...prev.slice(0, -1), newCandle];
          } else {
            // Append new candle
            return [...prev, newCandle];
          }
        });
      };
    };

    fetchHistorical().then(subscribeToWebSocket);

    return () => {
      if (socket) socket.close();
    };
  }, [symbol, interval]);

  // Convert UTC timestamp to local time string for logging/display
  const formatTime = (time: number) => {
    const date = new Date(time); // Create Date object from UTC ms timestamp
    return date.toLocaleString(); // Automatically converts to local timezone
  };

  // Add formatted time for display/debugging only
  const formattedCandles = candles.map((candle) => ({
    ...candle,
    formattedTime: formatTime(candle.time),
  }));

  console.log("Formatted Candles:", formattedCandles);

  return formattedCandles;
};

