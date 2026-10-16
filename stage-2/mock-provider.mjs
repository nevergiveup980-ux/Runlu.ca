// Deterministic zero-cost provider for workflow tests. No actual video is generated.
export class MockVideoProvider {
 constructor({failFirst=false, billedCad=0}={}) {this.failFirst=failFirst;this.billedCad=billedCad;}
 async generate(brief,{id,attempt,budgetRemainingCad}) {
  if(this.failFirst && attempt===1) return {ok:false,billedCad:this.billedCad};
  if(this.billedCad>budgetRemainingCad) return {ok:false,billedCad:this.billedCad};
  return {ok:true,billedCad:this.billedCad,artifact:{kind:"mock-video",verified:false,simulated:true,jobId:id,description:"Simulated output; not a playable MP4",durationSeconds:brief.durationSeconds}};
 }
}
