import { useState, useEffect } from 'react';
import { useProgram } from "../utils/useProgram";
import { InfoStaking, openNotification } from "../utils/constants";
import { PublicKey } from "@solana/web3.js";


export default function AdminPage(){
	const {getPoolData, initPool, transferOwnership, updatePoolProperties, redeemToken} = useProgram()

    const [newPool, setNewPool] = useState('')
    
    const [curPool, setCurPool] = useState('5LqZxJ9EEY5GAFyquXvzWh6Y7TJmySnddwQyiWRfyPcy')
    const [poolData, setPoolData] = useState<any>(null)
    const [owner, setOwner] = useState('')
    const [redeemAmount, setRedeemAmount] = useState('')
    const [rewardPeriod, setRewardPeriod] = useState('')
    const [rewardAmount, setRewardAmount] = useState('')
    const [rewardAmountForLock, setRewardAmountForLock] = useState('')
    const [lockDuration, setLockDuration] = useState('')
    const [collection, setCollection] = useState('')

    useEffect(()=>{
        getStakingPoolData()
	},[curPool])

    const getStakingPoolData = async() => {
        try{
            const pool = new PublicKey(curPool)
            setPoolData(await getPoolData(pool))
        }catch(err){
            setPoolData(null)
        }
    }

    return <div className='row m-3'>
        <div className='col-lg-6'>
            <div className='row container-fluid'>
                <button type="button" className='btn btn-success' onClick={async()=>{
                    try{
                        let poolAddress = await initPool()
                        setNewPool(poolAddress.toBase58())
                        openNotification('success', 'initPool success')
                    }catch(err){
                        openNotification('error', 'initPool failed')
                    }
                }}>Create Pool</button>
            </div>
            <p className='p-3'>{newPool}</p>
        </div>
        <div className='col-lg-6'>
            <div className="input-group">
		        <span className="input-group-text">Current Pool</span>
		        <input name="curPool"  type="text" className="form-control" onChange={(event)=>{setCurPool(event.target.value)}} value={curPool}/>
		    </div>
            {
                poolData!=null && <>
                    <p>{`Owner: ${poolData.owner.toBase58()}`}</p>
                    <p>{`Reward Mint: ${poolData.rewardMint.toBase58()}`}</p>
                    <p>{`Reward Period: ${poolData.rewardPeriod}s`}</p>
                    <p>{`Reward Amount: ${poolData.rewardAmount/(10**InfoStaking.rewardDecimals)}`}</p>
                    <p>{`Reward Amound for Lock: ${poolData.rewardAmountForLock/(10**InfoStaking.rewardDecimals)}`}</p>
                    <p>{`Lock Duration: ${poolData.lockDuration}s`}</p>
                    <p>{`Collection: ${poolData.collection.toBase58()}`}</p>
                    <p>{`Total Staked: ${poolData.totalNumber}`}</p>
                    <p>{`Total Locked: ${poolData.lockedNumber}`}</p>
                    <div className="input-group">
                        <input name="owner address"  type="text" className="form-control" onChange={(event)=>{setOwner(event.target.value)}} value={owner}/>
                        <button type="button" className='btn btn-success' onClick={async()=>{
                            try{
                                const poolAddress = new PublicKey(curPool)
                                const ownerAddress = new PublicKey(owner)
                                await transferOwnership(poolAddress, ownerAddress)
                                openNotification('success', 'transferOwnership success')
                            }catch(err){
                                openNotification('error', 'transferOwnership failed')
                            }
                        }}>Transfer Ownership</button>
                    </div>
                    <div className="input-group mt-3 mb-3">
                        <input name="redeem amount"  type="text" className="form-control" onChange={(event)=>{setRedeemAmount(event.target.value)}} value={redeemAmount}/>
                        <button type="button" className='btn btn-success' onClick={async()=>{
                            try{
                                const poolAddress = new PublicKey(curPool)
                                const amount = Number(redeemAmount)
                                await redeemToken(poolAddress, amount)
                                openNotification('success', 'redeemToken success')
                            }catch(err){
                                openNotification('error', 'redeemToken failed')
                            }
                        }}>Redeem Token</button>
                    </div>
                    <div className="input-group">
                        <span className="input-group-text">Reward Period</span>
                        <input name="reward period"  type="text" className="form-control" onChange={(event)=>{setRewardPeriod(event.target.value)}} value={rewardPeriod}/>
                    </div>
                    <div className="input-group">
                        <span className="input-group-text">Reward Amount</span>
                        <input name="reward amount"  type="text" className="form-control" onChange={(event)=>{setRewardAmount(event.target.value)}} value={rewardAmount}/>
                    </div>
                    <div className="input-group">
                        <span className="input-group-text">Reward Amount for Lock</span>
                        <input name="reward amount for lock"  type="text" className="form-control" onChange={(event)=>{setRewardAmountForLock(event.target.value)}} value={rewardAmountForLock}/>
                    </div>
                    <div className="input-group">
                        <span className="input-group-text">Lock Duration</span>
                        <input name="lock duration"  type="text" className="form-control" onChange={(event)=>{setLockDuration(event.target.value)}} value={lockDuration}/>
                    </div>
                    <div className="input-group">
                        <span className="input-group-text">Collection</span>
                        <input name="collection"  type="text" className="form-control" onChange={(event)=>{setCollection(event.target.value)}} value={collection}/>
                    </div>
                    <div className='row m-3'>
                        <button type="button" className='btn btn-success' onClick={async()=>{
                            try{
                                const poolAddress = new PublicKey(curPool)
                                const collectionAddress = new PublicKey(collection)
                                await updatePoolProperties(poolAddress, Number(rewardPeriod), Number(rewardAmount), Number(rewardAmountForLock), Number(lockDuration), collectionAddress)
                                openNotification('success', 'updatePoolProperties success')
                                await getStakingPoolData()
                            }catch(err){
                                openNotification('error', 'updatePoolProperties failed')
                            }
                        }}>Set Pool Properties</button>
                    </div>
                </>
            }
        </div>
    </div>
}