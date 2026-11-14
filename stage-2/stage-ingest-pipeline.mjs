import {processRunwayIngest} from './runway-ingest-orchestrator.mjs';
import {createPrivateVideoDownloader} from './private-video-downloader.mjs';
import {createVerifiedVideoMedia} from './ffprobe-media-service.mjs';
import {createPrivateMp4Storage} from './private-mp4-storage.mjs';

// Compose existing STAGE components without provider credentials or paid calls.
// Queue and provider are injected by a privileged server worker.
export function createStageIngestPipeline({queue,provider,fetchImpl,allowedHosts,probe,putObject,bucket,workerId}) {
 const downloader=createPrivateVideoDownloader({fetchImpl,allowedHosts});
 const media=createVerifiedVideoMedia({downloader,probe});
 const storage=createPrivateMp4Storage({putObject,bucket});
 return ()=>processRunwayIngest({queue,provider,media,storage,workerId});
}
