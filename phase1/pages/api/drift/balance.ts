import { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey, Connection } from '@solana/web3.js';
import { PERPS } from '@/lib/drift';
import { fetchPythPrices } from '@/lib/pyth';
import { getUserData, getUserPda } from '@/lib/drift';
import { BN } from '@coral-xyz/anchor'

type UserBalanceRequest = {
    pubKey: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { pubKey } = req.body as UserBalanceRequest;
    const RPC_LINK = process.env.PRIVATE_SOLANA_RPC;

    // Check if Public Key has been provided
    if(!pubKey) {
        return res.status(400).json({ error: 'pubKey is required' });
    }

    // Check if Solana RPC has been set in environment
    if(!RPC_LINK) {
        return res.status(500).json({ error: 'RPC link is not set' });
    }

    // Initialize User Data
    let user;
    try {
        user = new PublicKey(pubKey);
    }catch (error) {
        return new Response(JSON.stringify({ error: "Invalid User Address" }), {
        status: 400,
        });
    }

    try {
        const connection = new Connection(RPC_LINK, "confirmed");
        
        // Get User Drift Account
        const userPda = getUserPda(user, new BN(0));
    
        // Get Drift Data
        const userData = await getUserData(connection, userPda);
        console.log("User Data:", userData);
        if (!userData) {
          return new Response(JSON.stringify({ error: "User data not found" }), {
            status: 404,
          });
        }
    
        const spotPositions = userData.spotPositions;
        const perpsPositions = userData.perpPositions;
    
        const resSpotPositions = spotPositions.map((position:any) => {
          console.log("Balance Type");
          console.log(position.balanceType);
          return {
            marketIndex: position.marketIndex,
            scaledBalance: position.scaledBalance.toNumber(),
            openBids: position.openBids.toNumber(),
            openAsks: position.openAsks.toNumber(),
            cumulativeDeposits: position.cumulativeDeposits.toNumber(),
            openOrders: position.openOrders,
            balanceType: position.balanceType,
          };
        });
    
        const perpsPythIds = perpsPositions.map((position:any) => {
            const perpsData = PERPS[position.marketIndex];
            if (!perpsData.pythFeedId) {
                throw new Error(`Pyth Feed ID not found for market index ${position.marketIndex}`);
            }
            return perpsData.pythFeedId;
        });
        const perpsPrices = await fetchPythPrices(perpsPythIds);
    
        const resPerpsData = perpsPositions.map((position:any, index: number) => {
          const perpsData = PERPS[position.marketIndex];
    
            const baseAssetValue = position.baseAssetAmount * perpsPrices[index] / 10**9;
            const quoteAssetValue = position.quoteAssetAmount / 10**6;
            const quoteBreakEvenValue = position.quoteBreakEvenAmount / 10**6;
            const quoteEntryValue = position.quoteEntryAmount / 10**6;
            const fees = quoteAssetValue - quoteEntryValue;
            const positionFee = fees < 0 ? fees*-1 : fees;
            const positionPnL = baseAssetValue + quoteEntryValue;
    
          return {
            marketIndex: position.marketIndex,
            perpsData,
            lastCumulativeFundingRate: position.lastCumulativeFundingRate.toNumber(),
            // Value based on token prices
            positionPnL: positionPnL,
            positionFee: positionFee,
            baseAssetValue: baseAssetValue,
            quoteAssetValue: quoteAssetValue,
            quoteBreakEvenValue: quoteBreakEvenValue,
            quoteEntryValue: quoteEntryValue,
            // User Position Data
            baseAssetAmount: position.baseAssetAmount.toNumber(),
            quoteAssetAmount: position.quoteAssetAmount.toNumber(),
            quoteBreakEvenAmount: position.quoteBreakEvenAmount.toNumber(),
            quoteEntryAmount: position.quoteEntryAmount.toNumber(),
            openBids: position.openBids.toNumber(),
            openAsks: position.openAsks.toNumber(),
            settledPnl: position.settledPnl.toNumber(),
            lpShares: position.lpShares.toNumber(),
            lastBaseAssetAmountPerLp: position.lastBaseAssetAmountPerLp.toNumber(),
            lastQuoteAssetAmountPerLp: position.lastQuoteAssetAmountPerLp.toNumber(),
            remainderBaseAssetAmount: position.remainderBaseAssetAmount,
            openOrders: position.openOrders,
            perLpBase: position.perLpBase,
          };
        });
    
        const res = {
          address: user.toString(),
          userPda: userPda.toString(),
          subAccountId: userData.subAccountId,
          status: userData.status,
          name: userData.name,
          // Positions
          spotPositions: resSpotPositions,
          perpsPositions: resPerpsData,
          orders: userData.orders,
          // Stats
          totalDeposits: userData.totalDeposits.toNumber(),
          totalWithdraws: userData.totalWithdraws.toNumber(),
          totalSocialLoss: userData.totalSocialLoss.toNumber(),
          settledPerpPnl: userData.settledPerpPnl.toNumber(),
          cumulativeSpotFees: userData.cumulativeSpotFees.toNumber(),
          cumulativePerpFunding: userData.cumulativePerpFunding.toNumber(),
          liquidationMarginFreed: userData.liquidationMarginFreed.toNumber(),
          lastActiveSlot: userData.lastActiveSlot.toNumber(),
          nextOrderId: userData.nextOrderId,
          nextLiquidationId: userData.nextLiquidationId,
          maxMarginRatio: userData.maxMarginRatio,
          openOrders: userData.openOrders,
          hasOpenOrder: userData.hasOpenOrder,
          openAuctions: userData.openAuctions,
          hasOpenAuction: userData.hasOpenAuction,
          marginMode: userData.marginMode,
          poolId: userData.poolId,
          lastFuelBonusUpdateTs: userData.lastFuelBonusUpdateTs,
        }
        return res.status(200).json(res);
    } catch (error: unknown) {
        console.error('API Error:', error instanceof Error ? error.message : 'Unknown error occurred');
        return res.status(500).json({ error: 'An error occurred' });
    }
}
