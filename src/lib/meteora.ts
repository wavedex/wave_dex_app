import { PublicKey } from '@solana/web3.js';
import DLMM from '@meteora-ag/dlmm';
import { connection, DLMM_PROGRAM_ID } from './solana';

export interface MeteoraPosition {
  poolAddress: string;
  liquidity: string;
  totalFees: string;
  isLocked: boolean;
}

export async function getUserMeteoraPositions(walletAddress: string): Promise<MeteoraPosition[]> {
  try {
    const userPubkey = new PublicKey(walletAddress);
    
    // Using the SDK to get all positions
    const userPositionsMap = await DLMM.getAllLbPairPositionsByUser(
      connection,
      userPubkey,
      { programId: DLMM_PROGRAM_ID }
    );
    
    const positions: MeteoraPosition[] = [];
    
    userPositionsMap.forEach((posInfo, poolAddr) => {
      // Aggregate positions per pool
      let totalLiquidity = BigInt(0);
      let totalFees = BigInt(0);
      
      posInfo.positions.forEach(pos => {
        // Simplified liquidity calculation for the summary
        // In a real app, you'd calculate USD value
        totalLiquidity += pos.positionData.liquiditySharesX + pos.positionData.liquiditySharesY;
        totalFees += pos.positionData.feeX + pos.positionData.feeY;
      });
      
      positions.push({
        poolAddress: poolAddr,
        liquidity: totalLiquidity.toString(),
        totalFees: totalFees.toString(),
        isLocked: false, // Defaulting to false, logic for locking would be more complex
      });
    });
    
    return positions;
  } catch (error) {
    console.error('Error fetching Meteora positions:', error);
    return [];
  }
}

export async function getPoolLiquidity(poolAddress: string) {
  try {
    const poolPubkey = new PublicKey(poolAddress);
    const dlmmPool = await DLMM.create(connection, poolPubkey);
    return dlmmPool;
  } catch (error) {
    console.error('Error fetching Meteora pool:', error);
    return null;
  }
}
