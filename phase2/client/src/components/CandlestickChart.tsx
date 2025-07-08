import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, CandlestickData, Time } from "lightweight-charts";
import { useBinanceCandlestickChart } from "@/hooks/useBinanceCandlestickChart";

interface Props {
  symbol: string;
  interval: string;  // interval is now passed dynamically
}

export default function CandlestickChart({ symbol, interval }: Props) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [hoveredPrice, setHoveredPrice] = useState<string | null>(null);
  const candles = useBinanceCandlestickChart(symbol, interval);

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;
    
    // Clear any existing chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    // Create a new chart with styling that matches the screenshot
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 230,
      layout: {
        background: { color: '#000C28' },
        textColor: '#FFFFFF',
        fontSize: 10,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
    });
    
    chartRef.current = chart;
    
    // IMPORTANT: Create series as candlestick type - this is what makes it display as candlesticks
    const mainSeries = chart.addCandlestickSeries({
      upColor: '#4AFA9A',
      downColor: '#FA4A4A',
      borderUpColor: '#4AFA9A',
      borderDownColor: '#FA4A4A',
      wickUpColor: '#4AFA9A',
      wickDownColor: '#FA4A4A',
    });
    
    // Format data for candlestick chart
    const formattedData = candles.map(candle => ({
      time: (candle.time / 1000) as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));
    
    // Set the data to display candlesticks
    mainSeries.setData(formattedData);
    
    // Add volume display at bottom
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });
    
    // Position volume at bottom
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
      borderVisible: false,
    });
    
    // Create volume data with colors matching candles
    const volumeData = candles.map(candle => ({
      time: (candle.time / 1000) as Time,
      value: candle.volume || Math.random() * 50,
      color: candle.close >= candle.open ? '#4AFA9A40' : '#FA4A4A40'
    }));
    
    volumeSeries.setData(volumeData);
    
    // Add price line
    const lastPrice = candles.length > 0 ? candles[candles.length - 1].close : 0;
    mainSeries.createPriceLine({
      price: lastPrice,
      color: '#FF0000',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: '',
    });

    // Handle chart container resizing
    const resizeObserver = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [candles, interval]);

  return <div ref={chartContainerRef} className="w-full h-[400px]" style={{ backgroundColor: "#001236" }} />;
}

