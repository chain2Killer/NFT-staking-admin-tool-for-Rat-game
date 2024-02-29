import { createContext, useContext } from "react";
import { PublicKey } from '@solana/web3.js';

export interface ProgramContextState{
    getPoolData(pool: PublicKey): Promise<any>;
    initPool() : Promise<PublicKey>;
    transferOwnership(pool: PublicKey, owner: PublicKey) : Promise<void>;
    updatePoolProperties(pool: PublicKey, rewardPeriod: number, rewardAmount: number, rewardAmountForLock: number, lockDuration: number, collection: PublicKey) : Promise<void>;
    redeemToken(pool: PublicKey, amount: number) : Promise<void>;
}

export const ProgramContext = createContext<ProgramContextState>({
} as ProgramContextState)

export function useProgram() : ProgramContextState{
    return useContext(ProgramContext)
}