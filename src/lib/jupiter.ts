import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

export async function executeJupiterSwap(
  rpcUrl: string,
  privateKeyBase58: string,
  inputMint: string,
  outputMint: string,
  amountLamports: string,
  slippageBps: number = 50,
  jupiterApiKey?: string
) {
  const connection = new Connection(rpcUrl, 'confirmed');
  const wallet = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));
  
  const baseUrl = jupiterApiKey ? 'https://api.jup.ag/ultra' : 'https://quote-api.jup.ag/v6';

  try {
    // 1. Get Quote
    const quoteUrl = `${baseUrl}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=${slippageBps}`;
    const quoteRes = await fetch(quoteUrl, {
      headers: jupiterApiKey ? { 'x-api-key': jupiterApiKey } : {}
    });
    
    if (!quoteRes.ok) {
      const errorText = await quoteRes.text();
      throw new Error(`Jupiter Quote Error: ${errorText}`);
    }
    
    const quoteResponse = await quoteRes.json();

    // 2. Get Swap Transaction
    const swapRes = await fetch(`${baseUrl}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jupiterApiKey ? { 'x-api-key': jupiterApiKey } : {})
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey: wallet.publicKey.toBase58(),
        wrapAndUnwrapSol: true,
        prioritizationFeeLamports: 'auto',
        dynamicComputeUnitLimit: true,
      }),
    });

    if (!swapRes.ok) {
      const errorText = await swapRes.text();
      throw new Error(`Jupiter Swap Build Error: ${errorText}`);
    }

    const swapResult = await swapRes.json();

    if (!swapResult || !swapResult.swapTransaction) {
      throw new Error('Jupiter: Failed to build swap transaction');
    }

    // 3. Sign and Send Transaction
    const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(new Uint8Array(swapTransactionBuf));
    
    transaction.sign([wallet]);
    
    const signature = await connection.sendTransaction(transaction, {
      skipPreflight: true,
      maxRetries: 3,
    });

    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    }, 'confirmed');

    return {
      signature,
      inputAmount: quoteResponse.inAmount,
      outputAmount: quoteResponse.outAmount,
    };
  } catch (err: any) {
    console.error('Jupiter Execution Error:', err);
    throw new Error(err.message || 'Jupiter execution failed');
  }
}
