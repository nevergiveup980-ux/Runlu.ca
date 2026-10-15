// Policy-only ingestion boundary: no HTTP downloads or cloud credentials.
// All provider URLs are untrusted. Resolve and enforce network egress policy
// on EVERY redirect and DNS connection in the eventual worker.
import { createHash } from "node:crypto";
export function validateIngestMetadata(meta,{maxBytes=500_000_000,maxSeconds=3600}={}){
 if(!meta||typeof meta!=="object")throw Error("Missing media metadata");
 if(!Number.isSafeInteger(meta.bytes)||meta.bytes<=0||meta.bytes>maxBytes)throw Error("Invalid file size");
 if(!Number.isFinite(meta.durationSeconds)||meta.durationSeconds<=0||meta.durationSeconds>maxSeconds)throw Error("Invalid duration");
 if(!Number.isInteger(meta.width)||!Number.isInteger(meta.height)||meta.width<320||meta.height<240||meta.width>8192||meta.height>8192)throw Error("Invalid dimensions");
 if(!["video/mp4","video/quicktime"].includes(meta.mime))throw Error("Unsupported media MIME");
 if(!["h264","hevc","prores"].includes(meta.codec))throw Error("Unsupported video codec");
 if(typeof meta.sha256!=="string"||!/^[a-f0-9]{64}$/.test(meta.sha256))throw Error("Missing SHA256");
 return {bytes:meta.bytes,durationSeconds:meta.durationSeconds,width:meta.width,height:meta.height,mime:meta.mime,codec:meta.codec,sha256:meta.sha256};
}
export function buildPrivateObjectKey({jobId,sha256,extension="mp4"}){
 if(typeof jobId!=="string"||!/^ST[A-Z0-9-]{1,48}$/.test(jobId))throw Error("Invalid job ID");
 if(typeof sha256!=="string"||!/^[a-f0-9]{64}$/.test(sha256))throw Error("Invalid hash");
 if(!["mp4","mov"].includes(extension))throw Error("Invalid extension");
 return "stage/private/"+jobId+"/"+sha256+"."+extension;
}
export function digestBuffer(buffer){
 if(!Buffer.isBuffer(buffer)||buffer.length===0)throw Error("Nonempty Buffer required");
 return createHash("sha256").update(buffer).digest("hex");
}
export function customerAssetView(record){
 if(record?.state!=="VERIFIED"||typeof record?.assetId!=="string"||!/^asset_[a-zA-Z0-9_-]{4,80}$/.test(record.assetId))throw Error("Asset not ready");
 return {assetId:record.assetId,status:"READY"};
}
