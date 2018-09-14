// 
const QuorumSet = require('./quorum-set');

class Node {

    constructor(ip, port, publicKey = undefined, ledgerVersion = undefined,
                overlayVersion = undefined, overlayMinVersion = undefined,
                networkId = undefined, versionStr = undefined, activeCounter = 0, countryCode = undefined,
                countryName = undefined, regionCode = undefined, regionName = undefined, city = undefined,
                zipCode = undefined, timeZone = undefined, latitude = undefined, longitude = undefined, metroCode = undefined,
                name = undefined, host = undefined, verified = false, dateDiscovered = new Date(), dateUpdated = new Date(),
                quorumSet = new QuorumSet()
    ) {
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
        if(!activeCounter) {
            activeCounter = 0;
        }
        this._activeCounter = activeCounter;
        this._dateDiscovered = dateDiscovered;
        this._dateUpdated = dateUpdated;
        this._quorumSet = quorumSet;

    }

    static get MAX_ACTIVE_COUNTER() {
        return 300;
    }

    get activeRating() {
        let divider = Node.MAX_ACTIVE_COUNTER / 5; // 5 star ratings
        let rating = this.activeCounter/divider;

        return Math.ceil(rating);
    }

    get activeCounter() {
        return this._activeCounter;
    }

    set activeCounter(value) {
        this._activeCounter = value;
    }

    get dateUpdated() {
        return this._dateUpdated;
    }

    set dateUpdated(value) {
        this._dateUpdated = value;
    }

    get dateDiscovered() {
        return this._dateDiscovered;
    }

    set dateDiscovered(value) {
        this._dateDiscovered = value;
    }

    incrementActiveCounter() {
        if(this._activeCounter < Node.MAX_ACTIVE_COUNTER) { //if crawler runs every 15 minutes, it takes about 3 days to become non active
            this._activeCounter ++;
        }
    }

    decrementActiveCounter() {
        if(this._activeCounter > 0) {
            this._activeCounter --;
        }
    }

    get verified() {
        return this._verified;
    }

    set verified(value) {
        this._verified = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get host() {
        return this._host;
    }

    set host(value) {
        this._host = value;
    }

    get countryCode() {
        return this._countryCode;
    }

    set countryCode(value) {
        this._countryCode = value;
    }

    get countryName() {
        return this._countryName;
    }

    set countryName(value) {
        this._countryName = value;
    }

    get regionCode() {
        return this._regionCode;
    }

    set regionCode(value) {
        this._regionCode = value;
    }

    get regionName() {
        return this._regionName;
    }

    set regionName(value) {
        this._regionName = value;
    }

    get city() {
        return this._city;
    }

    set city(value) {
        this._city = value;
    }

    get zipCode() {
        return this._zipCode;
    }

    set zipCode(value) {
        this._zipCode = value;
    }

    get timeZone() {
        return this._timeZone;
    }

    set timeZone(value) {
        this._timeZone = value;
    }

    get latitude() {
        return this._latitude;
    }

    set latitude(value) {
        this._latitude = value;
    }

    get longitude() {
        return this._longitude;
    }

    set longitude(value) {
        this._longitude = value;
    }

    get metroCode() {
        return this._metroCode;
    }

    set metroCode(value) {
        this._metroCode = value;
    }

    get key() {
        return this._ip + ":" + this._port;
    }

    get active() {
        return this._activeCounter > 0;
    }

    /*set active(value:boolean) {
        return this._active = value;
    }*/

    get ip() {
        return this._ip;
    }

    set ip(value) {
        this._ip = value;
    }

    get port() {
        return this._port;
    }

    set port(value) {
        this._port = value;
    }

    get publicKey() {
        return this._publicKey;
    }

    set publicKey(value) {
        this._publicKey = value;
    }

    get ledgerVersion() {
        return this._ledgerVersion;
    }

    set ledgerVersion(value) {
        this._ledgerVersion = value;
    }

    get overlayVersion() {
        return this._overlayVersion;
    }

    set overlayVersion(value) {
        this._overlayVersion = value;
    }

    get overlayMinVersion() {
        return this._overlayMinVersion;
    }

    set overlayMinVersion(value) {
        this._overlayMinVersion = value;
    }

    get networkId() {
        return this._networkId;
    }

    set networkId(value) {
        this._networkId = value;
    }

    get versionStr() {
        return this._versionStr;
    }

    set versionStr(value) {
        this._versionStr = value;
    }

    get quorumSet(){
        return this._quorumSet;
    }

    set quorumSet(value) {
        this._quorumSet = value;
    }


    toJSON() {
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

    static fromJSON(node) {
        let nodeObject;
        if((typeof node) === 'string') {
            nodeObject = JSON.parse(node);
        } else
            nodeObject = node;

        return new Node(
            nodeObject.ip, nodeObject.port, nodeObject.publicKey,
            nodeObject.ledgerVersion, nodeObject.overlayVersion,
            nodeObject.overlayMinVersion, nodeObject.networkId, nodeObject.versionStr,
            nodeObject.activeCounter, nodeObject.countryCode, nodeObject.countryName,
            nodeObject.regionCode, nodeObject.regionName, nodeObject.city,
            nodeObject.zipCode, nodeObject.timeZone, nodeObject.latitude,
            nodeObject.longitude, nodeObject.metroCode, nodeObject.name, nodeObject.host, nodeObject.verified,
            nodeObject.dateDiscovered, nodeObject.dateLastSeen, QuorumSet.fromJSON(nodeObject.quorumSet)
        );
    }
}

module.exports = Node;