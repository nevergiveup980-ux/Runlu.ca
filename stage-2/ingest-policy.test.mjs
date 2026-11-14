import test from "node:test";
import assert from "node:assert/strict";
import {validateIngestMetadata,buildPrivateObjectKey,digestBuffer,customerAssetView,verifyDeliveryMp4} from "./ingest-policy.mjs";
const hash="a".repeat(64);
const valid={bytes:1024,durationSeconds:5,width:1280,height:720,mime:"video/mp4",codec:"h264",sha256:hash};
test("valid media metadata passes",()=>assert.equal(validateIngestMetadata(valid).codec,"h264"));
test("oversize rejected",()=>assert.throws(()=>validateIngestMetadata({...valid,bytes:500_000_001})));
test("missing hash rejected",()=>assert.throws(()=>validateIngestMetadata({...valid,sha256:"abc"})));
test("invalid codec rejected",()=>assert.throws(()=>validateIngestMetadata({...valid,codec:"unknown"})));
test("private storage key is deterministic",()=>assert.equal(buildPrivateObjectKey({jobId:"STAGE-00001",sha256:hash}),"stage/private/STAGE-00001/"+hash+".mp4"));
test("path traversal rejected",()=>assert.throws(()=>buildPrivateObjectKey({jobId:"../escape",sha256:hash})));
test("digest is reproducible",()=>assert.equal(digestBuffer(Buffer.from("abc")),"ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"));
test("customer sees no private path",()=>assert.deepEqual(customerAssetView({state:"VERIFIED",assetId:"asset_12345",storageKey:"stage/private/secret",providerUrl:"https://example.org/private"}),{assetId:"asset_12345",status:"READY"}));
test("unverified asset cannot be released",()=>assert.throws(()=>customerAssetView({state:"INGESTING",assetId:"asset_12345"})));

test("H264 MP4 delivery metadata accepted",()=>assert.equal(verifyDeliveryMp4(valid).deliveryFormat,"mp4-h264"));
test("MOV is not a delivery MP4",()=>assert.throws(()=>verifyDeliveryMp4({...valid,mime:"video/quicktime"})));
test("HEVC requires transcoding before H264 delivery",()=>assert.throws(()=>verifyDeliveryMp4({...valid,codec:"hevc"})));
test("odd dimensions rejected for delivery",()=>assert.throws(()=>verifyDeliveryMp4({...valid,width:1279})));
