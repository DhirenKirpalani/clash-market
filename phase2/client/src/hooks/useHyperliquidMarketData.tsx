import { useEffect, useRef, useState } from "react";

export interface MarketData {
  symbol: string;
  lastPrice?: number;
  lastSize?: number;
  bestBid?: number;
  bestAsk?: number;
  midPrice?: number;
  prevDayPx?: number;
  dayNtlVlm?: number;
  change24h?: number;
  orderBook?: {
    bids: [number, number][];
    asks: [number, number][];
  };
}

const ASSET_TO_MARKET_MAP: Record<string, string> = {
  BTC: "BTC",
  ETH: "ETH",
  SOL: "SOL",
  XRP: "XRP",
  DOGE: "DOGE",
  AVAX: "AVAX",
};

const TOP_5_MARKETS = Object.keys(ASSET_TO_MARKET_MAP);
const WS_URL = "wss://api.hyperliquid.xyz/ws";
const DEBUG = false;

function safeParse(input: any): number | undefined {
  const n = Number(input);
  return Number.isFinite(n) ? n : undefined;
}

export function formatNumber(n?: number, fractionDigits = 2): string {
  if (n === undefined) return "-";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function useHyperliquidMarketData() {
  const [markets, setMarkets] = useState<Record<string, MarketData>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const marketsRef = useRef(markets);

  useEffect(() => {
    marketsRef.current = markets;
  }, [markets]);

  function updateMarketData(
    symbol: string,
    lastPrice?: number,
    lastSize?: number,
    otherData?: Partial<Omit<MarketData, "symbol" | "lastPrice" | "lastSize">>
  ) {
    setMarkets((prev) => {
      const prevData = prev[symbol] || { symbol };
      return {
        ...prev,
        [symbol]: {
          ...prevData,
          lastPrice: lastPrice ?? prevData.lastPrice,
          lastSize: lastSize ?? prevData.lastSize,
          ...otherData,
        },
      };
    });
  }

  useEffect(() => {
    let isCancelled = false;

    function connect() {
      if (ws.current?.readyState === WebSocket.OPEN) return;
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        if (DEBUG) console.log("🔌 [Hyperliquid] WS connected");

        for (const asset of TOP_5_MARKETS) {
          const coin = asset;

          ws.current?.send(JSON.stringify({ method: "subscribe", subscription: { type: "trades", coin } }));
          ws.current?.send(JSON.stringify({ method: "subscribe", subscription: { type: "l2Book", coin } }));
          ws.current?.send(JSON.stringify({ method: "subscribe", subscription: { type: "activeAssetCtx", coin } }));
        }

        ws.current?.send(JSON.stringify({ method: "subscribe", subscription: { type: "allMids" } }));
      };

      ws.current.onerror = (event) => {
        console.error("❌ [Hyperliquid] WS error:", event);
        setError("WebSocket error");
        ws.current?.close();
      };

      ws.current.onclose = (event) => {
        if (!isCancelled) {
          if (DEBUG) console.log("🔌 [Hyperliquid] WS closed:", event.reason);
          reconnectTimeout.current = setTimeout(connect, 3000);
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            console.error("❌ [Hyperliquid] API error:", data.error);
            setError(`API error: ${data.error}`);
            setLoading(false);
            return;
          }

          if (data.channel === "trades") {
            const trades = data.data;
            if (Array.isArray(trades) && trades.length > 0) {
              const coin = trades[0].coin;
              const symbol = ASSET_TO_MARKET_MAP[coin];
              const lastTrade = trades[trades.length - 1];
              updateMarketData(
                symbol,
                safeParse(lastTrade.px),
                safeParse(lastTrade.sz)
              );
            }
          }

          else if (data.channel === "l2Book") {
            const { coin, levels } = data.data;
            const symbol = ASSET_TO_MARKET_MAP[coin];
            if (symbol && Array.isArray(levels) && levels.length >= 2) {
              const bidsRaw = levels[0];
              const asksRaw = levels[1];

              const bids = bidsRaw.map((entry: any) => [
                safeParse(entry.px ?? entry[0])!,
                safeParse(entry.sz ?? entry[1])!,
              ]).filter(([price, size]: [number, number]) => price && size);

              const asks = asksRaw.map((entry: any) => [
                safeParse(entry.px ?? entry[0])!,
                safeParse(entry.sz ?? entry[1])!,
              ]).filter(([price, size]: [number, number]) => price && size);

              const bestBid = bids[0]?.[0];
              const bestAsk = asks[0]?.[0];

              console.log("📊 Order Book for", symbol, { bids, asks });

              updateMarketData(symbol, undefined, undefined, {
                bestBid,
                bestAsk,
                orderBook: { bids, asks },
              });
            }
          }

          else if (data.channel === "allMids") {
            const mids = data.data.mids;
            if (mids && typeof mids === "object") {
              Object.entries(mids).forEach(([coin, midPriceStr]) => {
                const symbol = ASSET_TO_MARKET_MAP[coin];
                if (symbol) {
                  const midPrice = safeParse(midPriceStr);
                  updateMarketData(symbol, undefined, undefined, { midPrice });
                }
              });
            }
          }

          else if (data.channel === "activeAssetCtx") {
            const coin = data.data.coin;
            const symbol = ASSET_TO_MARKET_MAP[coin];
            if (!symbol) return;

            const ctx = data.data.ctx;
            if (ctx) {
              const prevDayPx = safeParse(ctx.prevDayPx);
              const dayNtlVlm = safeParse(ctx.dayNtlVlm);
              const currentMid = marketsRef.current[symbol]?.midPrice ?? safeParse(ctx.midPx);
              const change24h =
                prevDayPx && currentMid
                  ? ((currentMid - prevDayPx) / prevDayPx) * 100
                  : undefined;

              updateMarketData(symbol, undefined, undefined, {
                prevDayPx,
                dayNtlVlm,
                change24h,
              });
            }
          }

          setLoading(false);
          setError(null);
        } catch (err) {
          console.error("❌ [Hyperliquid] Failed to parse WS message:", err);
          setError("Failed to process market data");
          setLoading(false);
        }
      };
    }

    connect();

    return () => {
      isCancelled = true;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      ws.current?.close();
    };
  }, []);

  const marketList = TOP_5_MARKETS.map((asset) => {
    const symbol = ASSET_TO_MARKET_MAP[asset];
    return markets[symbol] ?? { symbol };
  });

  return { marketData: marketList, error, loading };
}





