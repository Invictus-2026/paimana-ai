class PaimanaPCM extends AudioWorkletProcessor {
  constructor(){super();this.samples=[];}
  process(inputs){
    const mono=inputs[0]?.[0];if(!mono)return true;
    for(const value of mono)this.samples.push(value);
    if(this.samples.length>=2048){
      const count=Math.floor(this.samples.length*16000/sampleRate);
      const buffer=new ArrayBuffer(count*2);const view=new DataView(buffer);
      for(let i=0;i<count;i++){
        const start=Math.floor(i*sampleRate/16000),end=Math.min(this.samples.length,Math.floor((i+1)*sampleRate/16000));
        let sum=0;for(let j=start;j<end;j++)sum+=this.samples[j];
        const value=Math.max(-1,Math.min(1,sum/Math.max(1,end-start)));
        view.setInt16(i*2,Math.round(value*(value<0?32768:32767)),true);
      }
      this.samples=this.samples.slice(Math.floor(count*sampleRate/16000));this.port.postMessage(buffer,[buffer]);
    }
    return true;
  }
}
registerProcessor('paimana-pcm',PaimanaPCM);
