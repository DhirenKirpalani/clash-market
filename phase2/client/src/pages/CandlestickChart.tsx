import { useState, useEffect } from "react";
import { useParams } from "wouter";
import CandlestickChart from "@/components/CandlestickChart";

export default function CandlestickChartPage() {
  const { symbol } = useParams();
  const [interval, setInterval] = useState<string>("1m");

  // Retrieve the saved interval from localStorage if available
  useEffect(() => {
    const savedInterval = localStorage.getItem("candlestickInterval");
    if (savedInterval) {
      setInterval(savedInterval);
    }
  }, []);

  // Save the interval to localStorage whenever it changes
  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedInterval = e.target.value;
    setInterval(selectedInterval);
    localStorage.setItem("candlestickInterval", selectedInterval); // Save to localStorage
  };

  if (!symbol) {
    return <div className="p-4">Invalid symbol</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Candlestick Chart: {symbol.toUpperCase()}</h2>
      
      {/* Interval Selector */}
      <select
        value={interval}
        onChange={handleIntervalChange}
        className="bg-black text-white mb-4"
      >
        <option value="1m">1 Minute</option>
        <option value="5m">5 Minutes</option>
        <option value="15m">15 Minutes</option>
        <option value="1h">1 Hour</option>
        <option value="1d">1 Day</option>
      </select>

      <CandlestickChart symbol={symbol} interval={interval} />
    </div>
  );
}
