"use client";
import { useCallback, useEffect, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { PublicRoom, RoomAction, RoomOptions } from './room-types';
class RequestError extends Error { constructor(message:string,public status:number){super(message);} }
async function request(url:string,body?:unknown):Promise<PublicRoom> {
  await auth.authStateReady();
  if (!auth.currentUser) {
    try { await signInAnonymously(auth); }
    catch { throw new RequestError('Guest play is unavailable. Sign in to your account to play online.',401); }
  }
  const token=await auth.currentUser!.getIdToken();
  const response=await fetch(url,{method:body ? 'POST':'GET',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    ...(body ? {body:JSON.stringify(body)}:{}),cache:'no-store'});
  const data=await response.json();
  if(!response.ok)throw new RequestError(data.error || 'Unable to connect to room.',response.status);
  return data;
}
export function useOnlineRoom(kind:'spades'|'tonk') {
  const [room,setRoom]=useState<PublicRoom|null>(null);
  const [message,setMessage]=useState('');
  const [sending,setSending]=useState(false);
  const [connected,setConnected]=useState(false);
  const key=`xnx_online_${kind}_v1`;
  const commit=useCallback((data:PublicRoom)=>{setRoom(current=>current && current.code===data.code && current.version>data.version ? current : data);setConnected(true);setMessage('');localStorage.setItem(key,data.code);},[key]);
  const join=useCallback(async(code:string,name:string)=>{
    setSending(true);setMessage('');
    try{const data=await request(`/api/games/rooms/${code.trim().toUpperCase()}`,{op:'join',name,kind});commit(data);}
    catch(e){setMessage(e instanceof Error ? e.message:'Unable to join room.');}
    finally{setSending(false);}
  },[kind,commit]);
  useEffect(()=>{
    const saved=localStorage.getItem(key);
    if(saved)Promise.resolve().then(()=>join(saved,auth.currentUser?.displayName || 'Player'));
  },[key,join]);
  const roomCode=room?.code;
  const roomStatus=room?.status;
  useEffect(()=>{
    if(!roomCode || roomStatus==='closed')return;
    let stopped=false,running=false;
    async function poll(){
      if(running)return;running=true;
      try {
        let data=await request(`/api/games/rooms/${roomCode}`);
        if(data.game && (data.game.players[data.game.turn].bot || data.game.kind==='spades' && data.game.phase==='trick')) {
          data=await request(`/api/games/rooms/${roomCode}`,{op:'sync'});
        }
        if(!stopped)commit(data);
      }catch(e){if(!stopped){setConnected(false);setMessage(e instanceof Error ? e.message:'Connection interrupted. Reconnecting…');
        if(e instanceof RequestError && e.status===410){setRoom(current=>current ? {...current,status:'closed'} : current);localStorage.removeItem(key);}
      }}
      finally{running=false;}
    }
    const interval=setInterval(poll,1000);
    return()=>{stopped=true;clearInterval(interval);};
  },[roomCode,roomStatus,commit,key]);
  async function create(options:RoomOptions,name:string,fillBots:boolean){
    setSending(true);setMessage('');
    try{commit(await request('/api/games/rooms',{kind,options,name,fillBots}));}
    catch(e){setMessage(e instanceof Error ? e.message:'Unable to create room.');}
    finally{setSending(false);}
  }
  async function operate(op:string,action?:RoomAction){
    if(!room)return;
    setSending(true);setMessage('');
    try{commit(await request(`/api/games/rooms/${room.code}`,{op,action,version:room.version}));}
    catch(e){setMessage(e instanceof Error ? e.message:'Unable to send move.');}
    finally{setSending(false);}
  }
  function disconnect(){setRoom(null);setConnected(false);setMessage('');localStorage.removeItem(key);}
  return{room,message,sending,connected,join,create,send:(action:RoomAction)=>operate('action',action),start:()=>operate('start'),close:()=>operate('close'),disconnect};
}
