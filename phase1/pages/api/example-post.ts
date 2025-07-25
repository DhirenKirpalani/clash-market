import { NextApiRequest, NextApiResponse } from 'next';

type TransactionRequest = {
  transaction: string;
  pubKey: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract data from request body
    const { transaction, pubKey } = req.body as TransactionRequest;

    // Check required parameters
    if (!transaction) {
      return res.status(400).json({ error: 'transaction is required' });
    }

    if (!pubKey) {
      return res.status(400).json({ error: 'pubKey is required' });
    }

    if (!process.env.NEXT_PUBLIC_RPC_LINK) {
      return res.status(500).json({ error: 'RPC link is not set' });
    }

    // Simulate sending transaction to the network
    try {
      // Here you would typically send the transaction to the Solana network
      // This is a simplified example
      const response = await fetch(process.env.NEXT_PUBLIC_RPC_LINK, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'sendTransaction',
          params: [
            transaction,
            { encoding: 'base64' }
          ],
        }),
      });

      const json = await response.json();
      if (json.error) {
        console.error('RPC Error:', json.error);
        return res.status(500).json({ error: json.error.message });
      }

      // Return transaction signature
      return res.status(200).json({
        success: true,
        signature: json.result,
        message: 'Transaction submitted successfully',
      });
    } catch (error: unknown) {
      console.error('Transaction Error:', 
        error instanceof Error ? error.message : 'Unknown transaction error'
      );
      return res.status(500).json({ 
        error: 'Failed to process transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error: unknown) {
    console.error(
      'API Error:',
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
