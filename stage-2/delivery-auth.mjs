// Authorization policy for private STAGE assets; no cloud SDK or public URL.
export function authorizeAssetDelivery({asset,requesterId,job}){
 if(!asset||!job||typeof requesterId!=="string"||!requesterId.trim())throw Error("Missing delivery identity");
 if(typeof asset.id!=="string"||!/^asset_[A-Za-z0-9_-]{4,80}$/.test(asset.id))throw Error("Invalid asset ID");
 if(asset.jobId!==job.id||asset.ownerId!==job.ownerId||requesterId!==job.ownerId)throw Error("Asset access denied");
 if(job.status!=="COMPLETED"||asset.state!=="VERIFIED")throw Error("Asset not ready");
 if(typeof asset.storageKey!=="string"||!/^stage\/private\/ST[A-Z0-9-]{1,48}\/[a-f0-9]{64}\.mp4$/.test(asset.storageKey))throw Error("Invalid private storage key");
 if(typeof asset.sha256!=="string"||!new RegExp("^[a-f0-9]{64}$").test(asset.sha256)||!asset.storageKey.endsWith("/"+asset.sha256+".mp4"))throw Error("Asset hash mismatch");
 return Object.freeze({assetId:asset.id,storageKey:asset.storageKey,ownerId:requesterId,authorized:true});
}
