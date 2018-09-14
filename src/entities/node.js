// @flow
const QuorumSet = require('./quorum-set');

class Node { //todo activeCounter needs to be refactored to harvester/statistics storage.
    //todo use node class from connector
    _ip:string;
    _port:number;
    _publicKey:?string;
    _ledgerVersion:?string;
    _overlayVersion:?string;
    _overlayMinVersion:?string;
    _networkId:?string;
    _versionStr:?string;
    _active: Boolean;
    _countryCode:?string;
    _countryName:?string;
    _regionCode:?string;
    _regionName:?string;
    _city:?string;
    _zipCode:?string;
    _timeZone:?string;
    _latitude:?number;
    _longitude:?number;
    _metroCode:?string;
    _name:?string;
    _host:?string;
    _verified:boolean;
    _dateDiscovered:Date;
    _dateUpdated:Date;
    _quorumSet: ?QuorumSet;

    constructor(ip:?string, port:?number, publicKey:?string = undefined, ledgerVersion:?string = undefined,
                overlayVersion:?string = undefined, overlayMinVersion:?string = undefined,
                networkId:?string = undefined, versionStr:?string = undefined, active:boolean = false, countryCode:?string = undefined,
                countryName:?string = undefined, regionCode:?string = undefined, regionName:?string = undefined, city:?string = undefined,
                zipCode:?string = undefined, timeZone:?string = undefined, latitude:?number = undefined, longitude:?number = undefined, metroCode:?string = undefined,
                name:?string = undefined, host:?string = undefined, verified:boolean = false, dateDiscovered:Date = new Date(), dateUpdated:Date = new Date(),
                quorumSet:?QuorumSet = new QuorumSet()
    ) {
        this._active = active;
        this._ip = ip;
        this._port = port;
        this._publicKey = publicKey;
        this._ledgerVersion = ledgerVersion;
        this._overlayVersion = overlayVersion;
        this._overlayMinVersion = overlayMinVersion;
        this._networkId = networkId;
        this._versionStr = versionStr;
        this._countryCode = countryCode;
        this._countryName = countryName;
        this._regionCode = regionCode;
        this._regionName = regionName;
        this._city = city;
        this._zipCode = zipCode;
        this._timeZone = timeZone;
        this._latitude = latitude;
        this._longitude = longitude;
        this._metroCode = metroCode;
        this._name = name;
        this._host = host;
        this._verified = verified;
        this._dateDiscovered = dateDiscovered;
        this._dateUpdated = dateUpdated;
        this._quorumSet = quorumSet;
    }

    get displayName() {
        if(this.name) {
            return this.name;
        }

        return this.publicKey;
    }

    get activeRating() {
        let divider = Node.MAX_ACTIVE_COUNTER / 5; // 5 star ratings
        let rating = this.activeCounter/divider;

        return Math.ceil(rating);
    }

    get dateUpdated() {
        return this._dateUpdated;
    }

    set dateUpdated(value:Date) {
        this._dateUpdated = value;
    }

    get dateDiscovered() {
        return this._dateDiscovered;
    }

    set dateDiscovered(value:Date) {
        this._dateDiscovered = value;
    }

    get verified() {
        return this._verified;
    }

    set verified(value:boolean) {
        this._verified = value;
    }

    get name() {
        return this._name;
    }

    set name(value:string) {
        this._name = value;
    }

    get host() {
        return this._host;
    }

    set host(value:string) {
        this._host = value;
    }

    get countryCode() {
        return this._countryCode;
    }

    set countryCode(value:string) {
        this._countryCode = value;
    }

    get countryName() {
        return this._countryName;
    }

    set countryName(value:string) {
        this._countryName = value;
    }

    get regionCode() {
        return this._regionCode;
    }

    set regionCode(value:string) {
        this._regionCode = value;
    }

    get regionName() {
        return this._regionName;
    }

    set regionName(value:string) {
        this._regionName = value;
    }

    get city() {
        return this._city;
    }

    set city(value:string) {
        this._city = value;
    }

    get zipCode() {
        return this._zipCode;
    }

    set zipCode(value:string) {
        this._zipCode = value;
    }

    get timeZone() {
        return this._timeZone;
    }

    set timeZone(value:string) {
        this._timeZone = value;
    }

    get latitude() {
        return this._latitude;
    }

    set latitude(value:number) {
        this._latitude = value;
    }

    get longitude() {
        return this._longitude;
    }

    set longitude(value:number) {
        this._longitude = value;
    }

    get metroCode() {
        return this._metroCode;
    }

    set metroCode(value:string) {
        this._metroCode = value;
    }

    get key() {
        return this._ip + ":" + this._port;
    }

    get active():boolean {
        return this._active;
    }

    set active(value:boolean) {
        this._active = value;
    }

    get ip() {
        return this._ip;
    }

    set ip(value:string) {
        this._ip = value;
    }

    get port() {
        return this._port;
    }

    set port(value:number) {
        this._port = value;
    }

    get publicKey() {
        return this._publicKey;
    }

    set publicKey(value:string) {
        this._publicKey = value;
    }

    get ledgerVersion() {
        return this._ledgerVersion;
    }

    set ledgerVersion(value:string) {
        this._ledgerVersion = value;
    }

    get overlayVersion() {
        return this._overlayVersion;
    }

    set overlayVersion(value:string) {
        this._overlayVersion = value;
    }

    get overlayMinVersion() {
        return this._overlayMinVersion;
    }

    set overlayMinVersion(value:string) {
        this._overlayMinVersion = value;
    }

    get networkId() {
        return this._networkId;
    }

    set networkId(value:string) {
        this._networkId = value;
    }

    get versionStr() {
        return this._versionStr;
    }

    set versionStr(value:string) {
        this._versionStr = value;
    }

    get quorumSet(){
        return this._quorumSet;
    }

    set quorumSet(value:QuorumSet) {
        this._quorumSet = value;
    }


    toJSON():Object {
        return {
            ip: this.ip,
            port: this.port,
            publicKey: this.publicKey,
            ledgerVersion: this.ledgerVersion,
            overlayVersion: this.overlayVersion,
            overlayMinVersion: this.overlayMinVersion,
            networkId: this.networkId,
            versionStr: this.versionStr,
            active: this.active,
            countryCode: this.countryCode,
            countryName: this.countryName,
            regionCode: this.regionCode,
            regionName: this.regionName,
            city: this.city,
            zipCode: this.zipCode,
            timeZone: this.timeZone,
            latitude: this.latitude,
            longitude: this.longitude,
            metroCode: this.metroCode,
            name: this.name,
            host: this.host,
            verified: this.verified,
            activeCounter: this.activeCounter,
            activeRating: this.activeRating,
            dateDiscovered: this.dateDiscovered,
            dateUpdated: this.dateUpdated,
            quorumSet: this.quorumSet
        };
    };

    static fromJSON(node:string|Object):Node {
        let nodeObject;
        if((typeof node) === 'string') {
            nodeObject = JSON.parse(node);
        } else
            nodeObject = node;

        return new Node(
            nodeObject.ip, nodeObject.port, nodeObject.publicKey,
            nodeObject.ledgerVersion, nodeObject.overlayVersion,
            nodeObject.overlayMinVersion, nodeObject.networkId, nodeObject.versionStr,
            nodeObject.active, nodeObject.countryCode, nodeObject.countryName,
            nodeObject.regionCode, nodeObject.regionName, nodeObject.city,
            nodeObject.zipCode, nodeObject.timeZone, nodeObject.latitude,
            nodeObject.longitude, nodeObject.metroCode, nodeObject.name, nodeObject.host, nodeObject.verified,
            nodeObject.dateDiscovered, nodeObject.dateLastSeen, QuorumSet.fromJSON(nodeObject.quorumSet)
        );
    }
}

module.exports = Node;