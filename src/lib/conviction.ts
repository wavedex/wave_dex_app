import { supabase } from './supabase';
import { connection } from './solana';
import { PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { getUserMeteoraPositions } from './meteora';

export async function updateParticipantScore(participantId: string) {
  try {
    // 1. Fetch participant and contest info
    const { data: participant, error: pError } = await supabase
      .from('participants')
      .select('*, contests(*)')
      .eq('id', participantId)
      .single();

    if (pError || !participant) return;
    if (participant.is_disqualified) return;

    const contest = participant.contests;
    const walletAddress = participant.wallet_address;
    const tokenAddress = contest.token_address;

    // 2. Check current token balance
    const tokenMint = new PublicKey(tokenAddress);
    const userPubkey = new PublicKey(walletAddress);
    const ata = await getAssociatedTokenAddress(tokenMint, userPubkey);
    
    let currentBalance = 0;
    try {
      const account = await getAccount(connection, ata);
      currentBalance = Number(account.amount) / Math.pow(10, 9);
    } catch (e) {
      // If account doesn't exist, balance is 0
      currentBalance = 0;
    }

    // 3. Check for disqualification (selling)
    // If current balance is less than initial balance, they sold (simplified rule)
    // In a more complex version, we'd check if they ever sold using transaction history
    if (currentBalance < participant.initial_balance) {
      await supabase
        .from('participants')
        .update({
          is_disqualified: true,
          disqualification_reason: 'Balance decreased (Sell detected)'
        })
        .eq('id', participantId);
      return;
    }

    // 4. Calculate Conviction Score
    // Formula: (Current Balance * Hours Held) + (Liquidity Bonus)
    const joinedAt = new Date(participant.joined_at);
    const now = new Date();
    const hoursHeld = Math.max(1, (now.getTime() - joinedAt.getTime()) / (1000 * 60 * 60));
    
    // Check Meteora positions for liquidity bonus
    const meteoraPositions = await getUserMeteoraPositions(walletAddress);
    const hasLiquidity = meteoraPositions.some(p => p.poolAddress.toLowerCase().includes(tokenAddress.toLowerCase().slice(0, 10)));
    const liquidityMultiplier = hasLiquidity ? 1.5 : 1.0;

    const newScore = currentBalance * hoursHeld * liquidityMultiplier;

    // 5. Update participant in DB
    await supabase
      .from('participants')
      .update({
        current_balance: currentBalance,
        conviction_score: newScore,
        last_checked_at: now.toISOString()
      })
      .eq('id', participantId);

    // 6. Record snapshot
    await supabase
      .from('balance_snapshots')
      .insert({
        participant_id: participantId,
        balance: currentBalance
      });

  } catch (error) {
    console.error(`Error updating score for participant ${participantId}:`, error);
  }
}

export async function runConvictionUpdateCycle() {
  // Fetch all active participants
  const { data: participants } = await supabase
    .from('participants')
    .select('id')
    .eq('is_disqualified', false);

  if (!participants) return;

  // Update each one
  for (const p of participants) {
    await updateParticipantScore(p.id);
  }
}
