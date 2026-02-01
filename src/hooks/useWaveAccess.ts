import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState, useMemo } from 'react';

const WAVE_MINT = '5sB53PmfbCdggGaVi1EPzvuCv4yDtYsYSYQpP34owave';
const REQUIRED_BALANCE = 100000;

export function useWaveAccess() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          mint: new PublicKey(WAVE_MINT),
        });

        if (tokenAccounts.value.length > 0) {
          const amount = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
          setBalance(amount || 0);
        } else {
          setBalance(0);
        }
      } catch (error) {
        console.error('Error fetching $WAVE balance:', error);
        setBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
    
    // Optional: Set up an interval or subscription to refresh balance
    const id = setInterval(fetchBalance, 30000); // Check every 30s
    return () => clearInterval(id);
  }, [publicKey, connection]);

  const hasAccess = useMemo(() => {
    if (!publicKey) return false;
    if (balance === null) return false;
    return balance >= REQUIRED_BALANCE;
  }, [publicKey, balance]);

  return {
    hasAccess,
    balance,
    isLoading,
    requiredBalance: REQUIRED_BALANCE
  };
}
