import { useBinanceLatestPrice } from "@/hooks/useBinanceLatestPrice";

interface CryptoCardProps {
  symbol: string;
}

const CryptoCard = ({ symbol }: CryptoCardProps) => {
  const { price, error } = useBinanceLatestPrice(symbol);

  return (
    <div className="max-w-xs p-4 bg-black shadow-md rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-center mb-2">{symbol}</h3>

      {error ? (
        <p className="text-red-500 text-center">Error fetching data</p>
      ) : (
        <>
          <p className="text-xl font-semibold text-center mb-4">
            Price: {price ? `$${parseFloat(price).toFixed(2)}` : "Loading..."}
          </p>
          
          {/* Optionally add more details such as 24h price change */}
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">24h Change</span>
            <span className="text-sm text-gray-800">+2.4%</span>
          </div>
        </>
      )}
    </div>
  );
};

export default CryptoCard;
