import { NextApiRequest, NextApiResponse } from 'next';

// Example data - replace with your actual data model
type DriftData = {
  id: string;
  name: string;
  timestamp: number;
};

// Mock database - replace with your actual database implementation
const mockData: DriftData[] = [
  { id: '1', name: 'Position 1', timestamp: Date.now() },
  { id: '2', name: 'Position 2', timestamp: Date.now() },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract query parameters similar to searchParams in App Router
    const { pubKey, tokenMint } = req.query;

    // Check required parameters
    if (!pubKey) {
      return res.status(400).json({ error: 'pubKey is required' });
    }

    if (!process.env.NEXT_PUBLIC_RPC_LINK) {
      return res.status(500).json({ error: 'RPC link is not set' });
    }

    if (!tokenMint) {
      return res.status(400).json({ error: 'tokenMint is required' });
    }

    // Handle SOL balance
    if (tokenMint === 'So11111111111111111111111111111111111111112') {
      const response = await fetch(process.env.NEXT_PUBLIC_RPC_LINK, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [pubKey],
        }),
      });
      
      const json = await response.json();
      if (json.error) {
        console.error('RPC Error:', json.error);
        return res.status(500).json({ error: json.error.message });
      }
      
      const lamports = json.result?.value ?? 0;

      return res.status(200).json({
        isNative: true,
        mint: 'So11111111111111111111111111111111111111112',
        owner: pubKey,
        state: 'initialized',
        tokenAmount: {
          amount: lamports.toString(),
          decimals: 9,
          uiAmount: lamports / 1e9,
          uiAmountString: (lamports / 1e9).toFixed(9),
        },
      });
    } else {
      // Handle SPL tokens
      const response = await fetch(process.env.NEXT_PUBLIC_RPC_LINK, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            pubKey,
            {
              mint: tokenMint,
            },
            {
              encoding: 'jsonParsed',
            },
          ],
        }),
      });
      
      const json = await response.json();
      if (json.error) {
        console.error('RPC Error:', json.error);
        return res.status(500).json({ error: json.error.message });
      }
      
      const data = json.result?.value;
      console.log('Data:', data);

      // If no token account exists, return zero balance
      if (!data || data.length === 0) {
        return res.status(200).json({
          isNative: false,
          mint: tokenMint,
          owner: pubKey,
          state: 'initialized',
          tokenAmount: {
            amount: '0',
            decimals: 9,
            uiAmount: 0,
            uiAmountString: '0',
          },
        });
      }

      const tokenAccountData = data[0].account.data;
      console.log('Token Account Data:', tokenAccountData);

      const parsedData = tokenAccountData.parsed.info;
      console.log('Parsed Data:', parsedData);

      // Return token data
      return res.status(200).json({
        isNative: false,
        mint: tokenMint,
        owner: pubKey,
        state: parsedData.state,
        tokenAmount: parsedData.tokenAmount,
      });
    }
  } catch (error: unknown) {
    console.error(
      'API Error:',
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}
