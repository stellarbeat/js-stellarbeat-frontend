// @flow
const QuorumSet = require('./quorum-set');
const Node = require('./node');

class GraphNode{
    _originNode:?Node;
    _x:number;
    _y:number;
    _fx:?number;
    _fy:?number;
    _publicKey: string;

    constructor(publicKey: string, originNode: Node = undefined, x:number = 0, y:number = 0)
    {
        this._originNode = originNode;
        this._x = x;
        this._y = y;
        this._publicKey = publicKey;
    }

    get publicKey(): string {
        return this._publicKey;
    }

    get originNode(): Node {
        return this._originNode;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    get fx(): number {
        return this._fx;
    }

    get fy(): number {
        return this._fy;
    }

    set fx(value: number) {
        this._fx = value;
    }

    set fy(value: number) {
        this._fy = value;
    }
}

module.exports = GraphNode;