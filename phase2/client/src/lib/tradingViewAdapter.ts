// TradingView adapter for chart integration

// Function to add CSS to block TradingView branding
export const addTradingViewBrandingBlocker = () => {
  // Check if the style already exists to avoid duplicates
  if (document.getElementById('tv-branding-blocker')) return;
  
  const style = document.createElement('style');
  style.id = 'tv-branding-blocker';
  style.textContent = `
    /* Hide TradingView branding and links */
    .tv-logo, .tv-trademark, .tv-copyright,
    iframe[title*="TradingView"],
    a[href*="tradingview.com"],
    div[class*="copyright"],
    div[class*="logo-container"],
    .chart-page .chart-controls-bar-buttons a[href*="tradingview.com"],
    .chart-controls-bar-buttons__logo,
    .header-chart-panel .header-chart-panel-content__group a[href*="tradingview.com"],
    .onchart-tv-logo,
    .tv-header__link--logo,
    .js-rootresizer__credits {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
    
    /* Add a blocker overlay to prevent navigation to TradingView */
    #tv-chart-container::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 25px; /* Adjust height as needed to cover branding */
      background-color: #0F1117;
      z-index: 999;
    }
  `;
  
  document.head.appendChild(style);
};

// Function to remove TradingView branding elements from DOM
export const removeTradingViewBranding = () => {
  // Target selectors that might contain TradingView branding
  const selectors = [
    '.tv-logo',
    '.tv-trademark',
    '.tv-copyright',
    'iframe[title*="TradingView"]',
    'a[href*="tradingview.com"]',
    'div[class*="copyright"]',
    'div[class*="logo-container"]',
    '.onchart-tv-logo',
    '.js-rootresizer__credits'
  ];
  
  // Use MutationObserver to continually remove any branded elements
  const observer = new MutationObserver((mutations) => {
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.remove();
      });
    });
  });
  
  // Start observing with configuration
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Also remove any existing elements
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.remove();
    });
  });
  
  return observer; // Return observer so it can be disconnected if needed
};

export const initTradingView = async (
  container: HTMLElement | null,
  symbol: string,
  interval: string
): Promise<any> => {
  if (!container) throw new Error('Container element is required');
  
  try {
    // Load TradingView library if not already loaded
    if (!(window as any).TradingView) {
      await loadTradingViewScript();
    }
    
    // Map interval formats to what TradingView expects
    const intervalMap: Record<string, string> = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '4h': '240',
      '1D': 'D'
    };
    
    // Create TradingView widget with minimal configuration
    const widget = new (window as any).TradingView.widget({
      container_id: container.id,
      autosize: true,
      symbol: symbol,
      interval: intervalMap[interval] || '15',
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "#1A1C25",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      save_image: false,
      studies: ["RSI@tv-basicstudies"],
      disabled_features: [
        "use_localstorage_for_settings",
        "header_symbol_search",
        "symbol_search_hot_key",
        "header_compare",
      ],
      enabled_features: ["study_templates"],
      overrides: {
        "mainSeriesProperties.style": 1,
        "symbolWatermarkProperties.color": "rgba(0, 0, 0, 0)",
        "paneProperties.background": "#0F1117",
        "paneProperties.vertGridProperties.color": "rgba(42, 44, 53, 0.5)",
        "paneProperties.horzGridProperties.color": "rgba(42, 44, 53, 0.5)",
        "scalesProperties.textColor": "#A0A0B0"
      },
    });
    
    // Store widget methods for later use
    return {
      original: widget,
      remove: () => {
        if (widget && typeof widget.remove === 'function') {
          widget.remove();
        }
      },
      // Add custom implementations that are safe to call
      setSymbol: (newSymbol: string) => {
        if (container) {
          // Reinitialize with the new symbol rather than using the API
          container.innerHTML = '';
          initTradingView(container, newSymbol, interval);
        }
      },
      setInterval: (newInterval: string) => {
        if (container) {
          // Reinitialize with the new interval rather than using the API
          container.innerHTML = '';
          initTradingView(container, symbol, newInterval);
        }
      }
    };
  } catch (error) {
    console.error("Failed to initialize TradingView chart:", error);
    throw error;
  }
};

// Load TradingView script
const loadTradingViewScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).TradingView) {
      resolve();
      return;
    }
    
    // Use the official TradingView script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    
    script.onload = () => {
      resolve();
    };
    
    script.onerror = (error) => {
      reject(error);
    };
    
    document.head.appendChild(script);
  });
};

// Set symbol for existing chart
export const setChartSymbol = (widget: any, symbol: string): void => {
  if (!widget) return;
  
  // Use our custom setSymbol implementation from the widget wrapper
  if (typeof widget.setSymbol === 'function') {
    widget.setSymbol(symbol);
  }
};

// Set interval for existing chart
export const setChartInterval = (widget: any, interval: string): void => {
  if (!widget) return;
  
  // Use our custom setInterval implementation from the widget wrapper
  if (typeof widget.setInterval === 'function') {
    widget.setInterval(interval);
  }
};
