"use strict";
module.exports = validate20;
module.exports.default = validate20;
const schema22 = {"definitions":{"quorumSet":{"title":"Quorumset","type":"object","required":["threshold","validators","innerQuorumSets"],"properties":{"threshold":{"$id":"#quorumSet/threshold","title":"Threshold","type":"integer","examples":[3],"default":1},"validators":{"$id":"#quorumSet/validators","title":"Validators","type":"array","examples":["GCGB2S2KGYARPVIA37HYZXVRM2YZUEXA6S33ZU5BUDC6THSB62LZSTYH","GCM6QMP3DLRPTAZW2UZPCPX2LF3SXWXKPMP3GKFZBDSF3QZGV2G5QSTK","GABMKJM6I25XI4K7U6XWMULOUQIQ27BCTMLS6BYYSOWKTBUXVRJSXHYQ"],"default":[]},"innerQuorumSets":{"$id":"#quorumSet/innerQuorumSets","title":"Innerquorumsets","type":"array","items":{"$ref":"#/definitions/quorumSet"},"default":[]}}},"node":{"title":"Node","$id":"#node","type":"object","required":["publicKey","quorumSet"],"properties":{"publicKey":{"$id":"#node/publicKey","title":"Publickey","type":"string","default":"","examples":["GCGB2S2KGYARPVIA37HYZXVRM2YZUEXA6S33ZU5BUDC6THSB62LZSTYH"],"pattern":"^.*$"},"quorumSet":{"$ref":"#/definitions/quorumSet"},"geoData":{"$id":"#node/geoData","title":"geoData","type":"object","required":[],"properties":{"countryCode":{"$id":"#node/geoData/countryCode","title":"countryCode","type":"string","default":"","examples":["US"]},"countryName":{"$id":"#node/geoData/countryName","title":"countryName","type":"string","default":"","examples":["United States"]},"longitude":{"$id":"#node/geoData/longitude","title":"longitude","type":"number","default":"","examples":[52.309051513671875]},"latitude":{"$id":"#node/geoData/latitude","title":"latitude","type":"number","default":"","examples":[52.309051513671875]}}},"isp":{"$id":"#node/isp","title":"Isp","type":"string","default":"","examples":["Digitalocean LLC"],"pattern":"^.*$"}}},"organization":{"title":"Organization","$id":"#organization","type":"object","required":["id","name","validators"],"properties":{"id":{"$id":"#organization/id","title":"Id","type":"string","default":"","examples":["266107f8966d45eedce41fee2581326d"],"pattern":"^.*$"},"name":{"$id":"#organization/name","title":"Name","type":"string","default":"","examples":["SDF"],"pattern":"^.*$"},"validators":{"$id":"#organization/validators","title":"Validators","type":"array","default":[],"items":{"$id":"#organization/validators/items","title":"Items","type":"string","default":"","examples":["GCGB2S2KGYARPVIA37HYZXVR…S33ZU5BUDC6THSB62LZSTYH","GABMKJM6I25XI4K7U6XWMULO…MLS6BYYSOWKTBUXVRJSXHYQ","GCM6QMP3DLRPTAZW2UZPCPX2…MP3GKFZBDSF3QZGV2G5QSTK"],"pattern":"^.*$"}}}}},"$schema":"http://json-schema.org/draft-07/schema#","$id":"https://stellarbeat.io/schemas/network-basic.json","title":"Network","type":"object","required":["nodes","organizations"],"properties":{"nodes":{"title":"Nodes","type":"array","default":[],"items":{"$ref":"#/definitions/node"}},"organizations":{"title":"Organizations","type":"array","default":[],"items":{"$ref":"#/definitions/organization"}}}};
const schema25 = {"title":"Organization","$id":"#organization","type":"object","required":["id","name","validators"],"properties":{"id":{"$id":"#organization/id","title":"Id","type":"string","default":"","examples":["266107f8966d45eedce41fee2581326d"],"pattern":"^.*$"},"name":{"$id":"#organization/name","title":"Name","type":"string","default":"","examples":["SDF"],"pattern":"^.*$"},"validators":{"$id":"#organization/validators","title":"Validators","type":"array","default":[],"items":{"$id":"#organization/validators/items","title":"Items","type":"string","default":"","examples":["GCGB2S2KGYARPVIA37HYZXVR…S33ZU5BUDC6THSB62LZSTYH","GABMKJM6I25XI4K7U6XWMULO…MLS6BYYSOWKTBUXVRJSXHYQ","GCM6QMP3DLRPTAZW2UZPCPX2…MP3GKFZBDSF3QZGV2G5QSTK"],"pattern":"^.*$"}}}};
const schema23 = {"title":"Node","$id":"#node","type":"object","required":["publicKey","quorumSet"],"properties":{"publicKey":{"$id":"#node/publicKey","title":"Publickey","type":"string","default":"","examples":["GCGB2S2KGYARPVIA37HYZXVRM2YZUEXA6S33ZU5BUDC6THSB62LZSTYH"],"pattern":"^.*$"},"quorumSet":{"$ref":"#/definitions/quorumSet"},"geoData":{"$id":"#node/geoData","title":"geoData","type":"object","required":[],"properties":{"countryCode":{"$id":"#node/geoData/countryCode","title":"countryCode","type":"string","default":"","examples":["US"]},"countryName":{"$id":"#node/geoData/countryName","title":"countryName","type":"string","default":"","examples":["United States"]},"longitude":{"$id":"#node/geoData/longitude","title":"longitude","type":"number","default":"","examples":[52.309051513671875]},"latitude":{"$id":"#node/geoData/latitude","title":"latitude","type":"number","default":"","examples":[52.309051513671875]}}},"isp":{"$id":"#node/isp","title":"Isp","type":"string","default":"","examples":["Digitalocean LLC"],"pattern":"^.*$"}}};
const pattern0 = new RegExp("^.*$", "u");
const schema24 = {"title":"Quorumset","type":"object","required":["threshold","validators","innerQuorumSets"],"properties":{"threshold":{"$id":"#quorumSet/threshold","title":"Threshold","type":"integer","examples":[3],"default":1},"validators":{"$id":"#quorumSet/validators","title":"Validators","type":"array","examples":["GCGB2S2KGYARPVIA37HYZXVRM2YZUEXA6S33ZU5BUDC6THSB62LZSTYH","GCM6QMP3DLRPTAZW2UZPCPX2LF3SXWXKPMP3GKFZBDSF3QZGV2G5QSTK","GABMKJM6I25XI4K7U6XWMULOUQIQ27BCTMLS6BYYSOWKTBUXVRJSXHYQ"],"default":[]},"innerQuorumSets":{"$id":"#quorumSet/innerQuorumSets","title":"Innerquorumsets","type":"array","items":{"$ref":"#/definitions/quorumSet"},"default":[]}}};
const wrapper0 = {validate: validate22};

function validate22(data, {dataPath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if(((data.threshold === undefined && (missing0 = "threshold")) || (data.validators === undefined && (missing0 = "validators"))) || (data.innerQuorumSets === undefined && (missing0 = "innerQuorumSets"))){
validate22.errors = [{keyword:"required",dataPath,schemaPath:"#/required",params:{missingProperty: missing0},message:"should have required property '"+missing0+"'"}];
return false;
}
else {
if(data.threshold !== undefined){
let data0 = data.threshold;
const _errs1 = errors;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
validate22.errors = [{keyword:"type",dataPath:dataPath+"/threshold",schemaPath:"#/properties/threshold/type",params:{type: "integer"},message:"should be integer"}];
return false;
}
var valid0 = _errs1 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.validators !== undefined){
const _errs3 = errors;
if(!(Array.isArray(data.validators))){
validate22.errors = [{keyword:"type",dataPath:dataPath+"/validators",schemaPath:"#/properties/validators/type",params:{type: "array"},message:"should be array"}];
return false;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.innerQuorumSets !== undefined){
let data2 = data.innerQuorumSets;
const _errs5 = errors;
if(errors === _errs5){
if(Array.isArray(data2)){
var valid1 = true;
const len0 = data2.length;
for(let i0=0; i0<len0; i0++){
const _errs7 = errors;
if(!(wrapper0.validate(data2[i0], {dataPath:dataPath+"/innerQuorumSets/" + i0,parentData:data2,parentDataProperty:i0,rootData}))){
vErrors = vErrors === null ? wrapper0.validate.errors : vErrors.concat(wrapper0.validate.errors);
errors = vErrors.length;
}
var valid1 = _errs7 === errors;
if(!valid1){
break;
}
}
}
else {
validate22.errors = [{keyword:"type",dataPath:dataPath+"/innerQuorumSets",schemaPath:"#/properties/innerQuorumSets/type",params:{type: "array"},message:"should be array"}];
return false;
}
}
var valid0 = _errs5 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
else {
validate22.errors = [{keyword:"type",dataPath,schemaPath:"#/type",params:{type: "object"},message:"should be object"}];
return false;
}
}
validate22.errors = vErrors;
return errors === 0;
}


function validate21(data, {dataPath="", parentData, parentDataProperty, rootData=data}={}){
/*# sourceURL="#node" */;
let vErrors = null;
let errors = 0;
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((data.publicKey === undefined && (missing0 = "publicKey")) || (data.quorumSet === undefined && (missing0 = "quorumSet"))){
validate21.errors = [{keyword:"required",dataPath,schemaPath:"#/required",params:{missingProperty: missing0},message:"should have required property '"+missing0+"'"}];
return false;
}
else {
if(data.publicKey !== undefined){
let data0 = data.publicKey;
const _errs1 = errors;
if(errors === _errs1){
if(typeof data0 === "string"){
if(!pattern0.test(data0)){
validate21.errors = [{keyword:"pattern",dataPath:dataPath+"/publicKey",schemaPath:"#/properties/publicKey/pattern",params:{pattern: "^.*$"},message:"should match pattern \""+"^.*$"+"\""}];
return false;
}
}
else {
validate21.errors = [{keyword:"type",dataPath:dataPath+"/publicKey",schemaPath:"#/properties/publicKey/type",params:{type: "string"},message:"should be string"}];
return false;
}
}
var valid0 = _errs1 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.quorumSet !== undefined){
const _errs3 = errors;
if(!(validate22(data.quorumSet, {dataPath:dataPath+"/quorumSet",parentData:data,parentDataProperty:"quorumSet",rootData}))){
vErrors = vErrors === null ? validate22.errors : vErrors.concat(validate22.errors);
errors = vErrors.length;
}
var valid0 = _errs3 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.geoData !== undefined){
let data2 = data.geoData;
const _errs4 = errors;
if(errors === _errs4){
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
if(data2.countryCode !== undefined){
const _errs6 = errors;
if(typeof data2.countryCode !== "string"){
validate21.errors = [{keyword:"type",dataPath:dataPath+"/geoData/countryCode",schemaPath:"#/properties/geoData/properties/countryCode/type",params:{type: "string"},message:"should be string"}];
return false;
}
var valid1 = _errs6 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data2.countryName !== undefined){
const _errs8 = errors;
if(typeof data2.countryName !== "string"){
validate21.errors = [{keyword:"type",dataPath:dataPath+"/geoData/countryName",schemaPath:"#/properties/geoData/properties/countryName/type",params:{type: "string"},message:"should be string"}];
return false;
}
var valid1 = _errs8 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data2.longitude !== undefined){
let data5 = data2.longitude;
const _errs10 = errors;
if(!((typeof data5 == "number") && (isFinite(data5)))){
validate21.errors = [{keyword:"type",dataPath:dataPath+"/geoData/longitude",schemaPath:"#/properties/geoData/properties/longitude/type",params:{type: "number"},message:"should be number"}];
return false;
}
var valid1 = _errs10 === errors;
}
else {
var valid1 = true;
}
if(valid1){
if(data2.latitude !== undefined){
let data6 = data2.latitude;
const _errs12 = errors;
if(!((typeof data6 == "number") && (isFinite(data6)))){
validate21.errors = [{keyword:"type",dataPath:dataPath+"/geoData/latitude",schemaPath:"#/properties/geoData/properties/latitude/type",params:{type: "number"},message:"should be number"}];
return false;
}
var valid1 = _errs12 === errors;
}
else {
var valid1 = true;
}
}
}
}
}
else {
validate21.errors = [{keyword:"type",dataPath:dataPath+"/geoData",schemaPath:"#/properties/geoData/type",params:{type: "object"},message:"should be object"}];
return false;
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.isp !== undefined){
let data7 = data.isp;
const _errs14 = errors;
if(errors === _errs14){
if(typeof data7 === "string"){
if(!pattern0.test(data7)){
validate21.errors = [{keyword:"pattern",dataPath:dataPath+"/isp",schemaPath:"#/properties/isp/pattern",params:{pattern: "^.*$"},message:"should match pattern \""+"^.*$"+"\""}];
return false;
}
}
else {
validate21.errors = [{keyword:"type",dataPath:dataPath+"/isp",schemaPath:"#/properties/isp/type",params:{type: "string"},message:"should be string"}];
return false;
}
}
var valid0 = _errs14 === errors;
}
else {
var valid0 = true;
}
}
}
}
}
}
else {
validate21.errors = [{keyword:"type",dataPath,schemaPath:"#/type",params:{type: "object"},message:"should be object"}];
return false;
}
}
validate21.errors = vErrors;
return errors === 0;
}


function validate20(data, {dataPath="", parentData, parentDataProperty, rootData=data}={}){
/*# sourceURL="https://stellarbeat.io/schemas/network-basic.json" */;
let vErrors = null;
let errors = 0;
if(errors === 0){
if(data && typeof data == "object" && !Array.isArray(data)){
let missing0;
if((data.nodes === undefined && (missing0 = "nodes")) || (data.organizations === undefined && (missing0 = "organizations"))){
validate20.errors = [{keyword:"required",dataPath,schemaPath:"#/required",params:{missingProperty: missing0},message:"should have required property '"+missing0+"'"}];
return false;
}
else {
if(data.nodes !== undefined){
let data0 = data.nodes;
const _errs1 = errors;
if(errors === _errs1){
if(Array.isArray(data0)){
var valid1 = true;
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
const _errs3 = errors;
if(!(validate21(data0[i0], {dataPath:dataPath+"/nodes/" + i0,parentData:data0,parentDataProperty:i0,rootData}))){
vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
errors = vErrors.length;
}
var valid1 = _errs3 === errors;
if(!valid1){
break;
}
}
}
else {
validate20.errors = [{keyword:"type",dataPath:dataPath+"/nodes",schemaPath:"#/properties/nodes/type",params:{type: "array"},message:"should be array"}];
return false;
}
}
var valid0 = _errs1 === errors;
}
else {
var valid0 = true;
}
if(valid0){
if(data.organizations !== undefined){
let data2 = data.organizations;
const _errs4 = errors;
if(errors === _errs4){
if(Array.isArray(data2)){
var valid2 = true;
const len1 = data2.length;
for(let i1=0; i1<len1; i1++){
let data3 = data2[i1];
const _errs6 = errors;
const _errs7 = errors;
if(errors === _errs7){
if(data3 && typeof data3 == "object" && !Array.isArray(data3)){
let missing1;
if(((data3.id === undefined && (missing1 = "id")) || (data3.name === undefined && (missing1 = "name"))) || (data3.validators === undefined && (missing1 = "validators"))){
validate20.errors = [{keyword:"required",dataPath:dataPath+"/organizations/" + i1,schemaPath:"#/definitions/organization/required",params:{missingProperty: missing1},message:"should have required property '"+missing1+"'"}];
return false;
}
else {
if(data3.id !== undefined){
let data4 = data3.id;
const _errs9 = errors;
if(errors === _errs9){
if(typeof data4 === "string"){
if(!pattern0.test(data4)){
validate20.errors = [{keyword:"pattern",dataPath:dataPath+"/organizations/" + i1+"/id",schemaPath:"#/definitions/organization/properties/id/pattern",params:{pattern: "^.*$"},message:"should match pattern \""+"^.*$"+"\""}];
return false;
}
}
else {
validate20.errors = [{keyword:"type",dataPath:dataPath+"/organizations/" + i1+"/id",schemaPath:"#/definitions/organization/properties/id/type",params:{type: "string"},message:"should be string"}];
return false;
}
}
var valid4 = _errs9 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data3.name !== undefined){
let data5 = data3.name;
const _errs11 = errors;
if(errors === _errs11){
if(typeof data5 === "string"){
if(!pattern0.test(data5)){
validate20.errors = [{keyword:"pattern",dataPath:dataPath+"/organizations/" + i1+"/name",schemaPath:"#/definitions/organization/properties/name/pattern",params:{pattern: "^.*$"},message:"should match pattern \""+"^.*$"+"\""}];
return false;
}
}
else {
validate20.errors = [{keyword:"type",dataPath:dataPath+"/organizations/" + i1+"/name",schemaPath:"#/definitions/organization/properties/name/type",params:{type: "string"},message:"should be string"}];
return false;
}
}
var valid4 = _errs11 === errors;
}
else {
var valid4 = true;
}
if(valid4){
if(data3.validators !== undefined){
let data6 = data3.validators;
const _errs13 = errors;
if(errors === _errs13){
if(Array.isArray(data6)){
var valid5 = true;
const len2 = data6.length;
for(let i2=0; i2<len2; i2++){
let data7 = data6[i2];
const _errs15 = errors;
if(errors === _errs15){
if(typeof data7 === "string"){
if(!pattern0.test(data7)){
validate20.errors = [{keyword:"pattern",dataPath:dataPath+"/organizations/" + i1+"/validators/" + i2,schemaPath:"#/definitions/organization/properties/validators/items/pattern",params:{pattern: "^.*$"},message:"should match pattern \""+"^.*$"+"\""}];
return false;
}
}
else {
validate20.errors = [{keyword:"type",dataPath:dataPath+"/organizations/" + i1+"/validators/" + i2,schemaPath:"#/definitions/organization/properties/validators/items/type",params:{type: "string"},message:"should be string"}];
return false;
}
}
var valid5 = _errs15 === errors;
if(!valid5){
break;
}
}
}
else {
validate20.errors = [{keyword:"type",dataPath:dataPath+"/organizations/" + i1+"/validators",schemaPath:"#/definitions/organization/properties/validators/type",params:{type: "array"},message:"should be array"}];
return false;
}
}
var valid4 = _errs13 === errors;
}
else {
var valid4 = true;
}
}
}
}
}
else {
validate20.errors = [{keyword:"type",dataPath:dataPath+"/organizations/" + i1,schemaPath:"#/definitions/organization/type",params:{type: "object"},message:"should be object"}];
return false;
}
}
var valid2 = _errs6 === errors;
if(!valid2){
break;
}
}
}
else {
validate20.errors = [{keyword:"type",dataPath:dataPath+"/organizations",schemaPath:"#/properties/organizations/type",params:{type: "array"},message:"should be array"}];
return false;
}
}
var valid0 = _errs4 === errors;
}
else {
var valid0 = true;
}
}
}
}
else {
validate20.errors = [{keyword:"type",dataPath,schemaPath:"#/type",params:{type: "object"},message:"should be object"}];
return false;
}
}
validate20.errors = vErrors;
return errors === 0;
}
