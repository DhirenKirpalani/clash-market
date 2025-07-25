/* Return the list of Token Prices in USD given a list of Pyth Feed IDs. */
export async function fetchPythPrices(ids: string[]) {
    const baseUrl = 'https://hermes.pyth.network/v2/updates/price/latest';
    const params = new URLSearchParams();
  
    for (const id of ids) {
      params.append('ids[]', id);
    }
  
    // Optional query params
    params.append('parsed', 'true');
  
    const url = `${baseUrl}?${params.toString()}`;
  
    const res = await fetch(url);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
  
    const data: any = await res.json();
    const parsedData = data.parsed;
    // Turn price data based on token decimals
    const prices = parsedData.map((data:any) => data.price.price * 10 ** data.price.expo);
    return prices;
  }