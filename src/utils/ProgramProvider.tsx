import {FC, useCallback, useMemo, ReactNode, useState, useEffect } from 'react';
import { ProgramContext } from './useProgram'
import { InfoStaking, confirmOptions } from './constants'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import * as anchor from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'
import { sendTransactionWithRetry } from './utility';
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token'

export interface ProgramProviderProps{
    children : ReactNode
}

export const ProgramProvider: FC<ProgramProviderProps> = ({children}) => {
    const wallet = useWallet()
    const {publicKey}= useWallet()
    const {connection: conn} = useConnection()
    
    const [program] = useMemo(()=>{
        const provider = new anchor.AnchorProvider(conn, wallet as any, confirmOptions)
        const program =  new anchor.Program(InfoStaking.idl, InfoStaking.programId, provider)
        return [program]
    },[conn, wallet])

    const getPoolData = async(pool: PublicKey) => {
        try{
            let poolData = await program.account.pool.fetch(pool) as any
            return {
                ...poolData,
                rewardPeriod: Number(poolData.rewardPeriod),
                rewardAmount: Number(poolData.rewardAmount),
                rewardAmountForLock: Number(poolData.rewardAmountForLock),
                lockDuration: Number(poolData.lockDuration),
                totalNumber: Number(poolData.totalNumber),
                lockedNumber: Number(poolData.lockedNumber)
            }
        }catch(err){
            return null
        }
    }
    
    const initPool = useCallback(async() => {
        let address = publicKey!;
        const rand = Keypair.generate().publicKey;
        const [pool,] = PublicKey.findProgramAddressSync([rand.toBuffer()], InfoStaking.programId)
        const rewardAccount = getAssociatedTokenAddressSync(InfoStaking.rewardMint, pool, true)
        let instructions : TransactionInstruction[] = []
        instructions.push(createAssociatedTokenAccountInstruction(address, rewardAccount, pool, InfoStaking.rewardMint))
        instructions.push(program.instruction.initPool({
            accounts:{
                owner: address,
                pool: pool,
                rand: rand,
                rewardMint: InfoStaking.rewardMint,
                rewardAccount: rewardAccount,
                systemProgram: SystemProgram.programId
            }
        }))
        await sendTransactionWithRetry(conn, wallet, instructions, [], 'confirmed')
        return pool
    }, [wallet])

    const transferOwnership = useCallback(async(pool: PublicKey, owner: PublicKey) => {
        let address = publicKey!;
        let instructions : TransactionInstruction[] = []
        instructions.push(program.instruction.transferOwnership(owner, {
            accounts:{
                owner: address,
                pool: pool,
            }
        }))
        await sendTransactionWithRetry(conn, wallet, instructions, [])
    }, [wallet])

    const updatePoolProperties = useCallback(async(pool: PublicKey,  rewardPeriod: number, rewardAmount: number, rewardAmountForLock: number, lockDuration: number, collection: PublicKey) => {
        let address = publicKey!;
    
        let instructions : TransactionInstruction[] = []
        instructions.push(program.instruction.updatePoolProperties(new anchor.BN(rewardPeriod), new anchor.BN(rewardAmount * (10**InfoStaking.rewardDecimals)), new anchor.BN(rewardAmountForLock * (10**InfoStaking.rewardDecimals)), new anchor.BN(lockDuration), collection, {
            accounts:{
                owner: address,
                pool: pool,
            }
        }))
        await sendTransactionWithRetry(conn, wallet, instructions, [])
    }, [wallet])

    const redeemToken = useCallback(async(pool: PublicKey, amount: number) => {
        let address = publicKey!;
        let redeemAmount = amount * (10**InfoStaking.rewardDecimals)
        let poolData = await getPoolData(pool)
        const tokenTo = getAssociatedTokenAddressSync(poolData.rewardMint, address)
        let instructions : TransactionInstruction[] = []
        if(await conn.getAccountInfo(tokenTo) == null)
            instructions.push(createAssociatedTokenAccountInstruction(address, tokenTo, address, poolData.rewardMint))
        instructions.push(program.instruction.redeemToken(new anchor.BN(redeemAmount), {
            accounts:{
                owner: address,
                pool: pool,
                tokenFrom: poolData.rewardAccount,
                tokenTo: tokenTo,
                tokenProgram: TOKEN_PROGRAM_ID
            }
        }))
        await sendTransactionWithRetry(conn, wallet, instructions, [])
    }, [wallet])

    return <ProgramContext.Provider value={{
        getPoolData,
        initPool,
        transferOwnership,
        updatePoolProperties,
        redeemToken
    }}>{children}</ProgramContext.Provider>
}