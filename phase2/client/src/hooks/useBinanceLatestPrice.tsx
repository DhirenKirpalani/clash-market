import { useEffect, useState } from "react";

export const useBinanceLatestPrice = (symbol: string) => {
  const [price, setPrice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`
        );
        const data = await response.json();
        setPrice(data.price);
      } catch (err) {
        setError("Error fetching the price.");
        console.error(err);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 10000); // Fetch price every 10 seconds

    return () => {
      clearInterval(interval);
    };
  }, [symbol]);

  return { price, error };
};
