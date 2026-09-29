/* Copy to v8-provider-config.js in the deployment environment.
   Keep deployment credentials/config outside the V8 core.
*/
window.RUNLU_V8_PROVIDER = {
  async readCarpetRows() {
    throw new Error('Configure the deployment read provider.');
  }
};