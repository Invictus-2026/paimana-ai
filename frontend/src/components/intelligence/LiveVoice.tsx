import { useEffect, useRef, useState } from 'react';
import { intelligenceBase } from '../../api/intelligence';
export function LiveVoice({projectId,language,configured}:{projectId:number;language:string;configured:boolean}) {
  const [active,setActive]=useState(false);const [message,setMessage]=useState('');const [transcript,setTranscript]=useState('');
  const socket=useRef<WebSocket|null>(null);const mic=useRef<MediaStream|null>(null);const context=useRef<AudioContext|null>(null);
  const worklet=useRef<AudioWorkletNode|null>(null);const playing=useRef<AudioBufferSourceNode[]>([]);const nextTime=useRef(0);
  const generation=useRef(0);
  const stop=()=>{generation.current++;socket.current?.close();socket.current=null;mic.current?.getTracks().forEach(t=>t.stop());mic.current=null;worklet.current?.disconnect();worklet.current=null;playing.current.forEach(s=>{try{s.stop();}catch{}});playing.current=[];context.current?.close().catch(()=>{});context.current=null;setActive(false);};
  useEffect(()=>()=>stop(),[projectId,language]);
  const start=async()=>{
    setMessage('Connecting…');setTranscript('');setActive(true);const attempt=++generation.current;
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('Microphone requires HTTPS or localhost.');
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
      if(generation.current!==attempt){stream.getTracks().forEach(t=>t.stop());return;}
      mic.current=stream;
      const audio=new AudioContext();context.current=audio;await audio.resume();await audio.audioWorklet.addModule('/pcm-worklet.js');
      if(generation.current!==attempt)return;
      const liveUrl=new URL(intelligenceBase+'/live',window.location.origin);liveUrl.protocol=liveUrl.protocol==='https:'?'wss:':'ws:';const ws=new WebSocket(liveUrl);socket.current=ws;
      ws.onopen=()=>ws.send(JSON.stringify({project_id:projectId,language,operator_key:sessionStorage.getItem('operator-key')||''}));
      ws.onmessage=event=>{
        const data=JSON.parse(event.data);
        if(data.error){setMessage(data.error);stop();return;}
        if(data.ready){
          setMessage('Live · microphone audio is being sent to Gemini.');
          const node=new AudioWorkletNode(audio,'paimana-pcm');worklet.current=node;
          audio.createMediaStreamSource(stream).connect(node);
          const mute=audio.createGain();mute.gain.value=0;node.connect(mute).connect(audio.destination);
          node.port.onmessage=e=>{if(ws.readyState!==WebSocket.OPEN||ws.bufferedAmount>1000000)return;let raw='';for(const b of new Uint8Array(e.data))raw+=String.fromCharCode(b);ws.send(JSON.stringify({audio:btoa(raw)}));};
        }
        const content=data.serverContent;
        if(content?.interrupted){playing.current.forEach(s=>{try{s.stop();}catch{}});playing.current=[];nextTime.current=audio.currentTime;}
        if(content?.inputTranscription?.text)setTranscript(t=>(t+'\nYou: '+content.inputTranscription.text).slice(-12000));
        if(content?.outputTranscription?.text)setTranscript(t=>(t+' '+content.outputTranscription.text).slice(-12000));
        for(const part of content?.modelTurn?.parts||[]){
          const inline=part.inlineData;if(!inline?.mimeType?.startsWith('audio/pcm'))continue;
          const bytes=Uint8Array.from(atob(inline.data),(c:string)=>c.charCodeAt(0));
          const view=new DataView(bytes.buffer);const rate=Number(/rate=(\d+)/.exec(inline.mimeType)?.[1]||24000);
          const buffer=audio.createBuffer(1,Math.floor(bytes.length/2),rate);const channel=buffer.getChannelData(0);
          for(let i=0;i<channel.length;i++)channel[i]=view.getInt16(i*2,true)/32768;
          const source=audio.createBufferSource();source.buffer=buffer;source.connect(audio.destination);
          const when=Math.max(audio.currentTime,nextTime.current);source.start(when);nextTime.current=when+buffer.duration;playing.current.push(source);
          source.onended=()=>{playing.current=playing.current.filter(s=>s!==source);};
        }
      };
      ws.onerror=()=>{setMessage('Live provider connection failed.');stop();};
      ws.onclose=()=>{if(socket.current===ws){setMessage('Live session ended.');stop();}};
    }catch(e){setMessage((e as Error).message);stop();}
  };
  return <div className="space-y-3 rounded-xl border border-blue-200 p-4"><h3 className="font-semibold">Gemini Live voice briefing</h3><p className="text-xs text-slate-500">Starting sends microphone audio and this project's evidence to Gemini. Sessions stop after ten minutes. Use Stop to release the microphone.</p><button className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50" disabled={!configured||!projectId} onClick={()=>active?stop():start()}>{active?'Stop live session':'Start live voice'}</button><p role="status" className="text-sm">{configured?message:'Configure GEMINI_API_KEY and GEMINI_LIVE_MODEL to enable.'}</p>{transcript&&<p className="whitespace-pre-wrap text-sm leading-6">{transcript}</p>}</div>;
}
