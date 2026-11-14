// RUNLU STAGE — server-side Runway SDK adapter.
// Supply an authenticated official SDK instance from the backend only.
// No API key, billing approval, or SDK package is bundled here.
export function createRunwaySdkAdapter(sdk) {
 if (typeof sdk?.imageToVideo?.create !== 'function' || typeof sdk?.tasks?.retrieve !== 'function') {
  throw new Error('Runway SDK imageToVideo.create and tasks.retrieve required');
 }
 return {
  async createTask(request) {
   if (!request || typeof request !== 'object' || Array.isArray(request)) throw new Error('Invalid request');
   const {model,promptImage,promptText,ratio,duration}=request;
   if (typeof model!=='string'||!model.trim()||typeof promptImage!=='string'||!promptImage.startsWith('https://')||
       typeof promptText!=='string'||!promptText.trim()||!['1280:720','720:1280'].includes(ratio)||
       !Number.isInteger(duration)||duration<2||duration>10) throw new Error('Invalid image-to-video request');
   // Explicit field allowlist: never pass frontend-owned keys or arbitrary SDK parameters.
   const result=await sdk.imageToVideo.create({model,promptImage,promptText,ratio,duration});
   if(typeof result?.id!=='string'||!result.id.trim()) throw new Error('Runway did not return task ID');
   return {id:result.id};
  },
  async getTask(taskId) {
   if(typeof taskId!=='string'||!taskId.trim()) throw new Error('Task ID required');
   return sdk.tasks.retrieve(taskId);
  }
 };
}
