import {notification} from 'antd'
import { ConfirmOptions, PublicKey, Keypair } from '@solana/web3.js'

export const InfoStaking = {
    programId: new PublicKey("ratnSpwdsporDA6rBDCnZzi5BvuoGhQy6hqzeHc66QE"),
    rewardMint: new PublicKey('6YTEx36MonaAwcaMciu7KAzx1zdUkQBmHrxLTkKMq98C'),
    rewardDecimals: 9,
    idl: require('./staking.json'),
}

export const confirmOptions: ConfirmOptions = {commitment : 'finalized',preflightCommitment : 'finalized',skipPreflight : false}

export const openNotification = (type : 'success' | 'error' | 'info' | 'warning', title : string, description? : string) => {
    notification[type]({
        message : title, description : description, placement : 'topLeft'
    })
}

export const getCurrentTime = (date : Date) => {
    let month = (date.getMonth()+1) >= 10 ? (date.getMonth()+1) :"0"+(date.getMonth()+1)
    let day = date.getDate() >= 10 ? date.getDate() : "0"+date.getDate()
    let hours = date.getHours() >= 10 ? date.getHours() : "0"+date.getHours()
    let minutes = date.getMinutes() >= 10 ? date.getMinutes() : "0"+date.getMinutes()
    return date.getFullYear()+"-"+month+"-"+day+"  "+hours+":"+minutes
}