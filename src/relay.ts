import { EventEmitter } from 'events';
// import chosen websocket library

export interface IBitcoinBlock {
    height: number;
    hash: Uint8Array;
    merkleRoot: Uint8Array;
    bits: number;
    nonce: number;
}

export class Relay extends EventEmitter {

    constructor() {
        super()
    }

    /* 
     * Connects to Bitcoin.com Websocket API and subscribes to new blocks.
     */
    public async connectToBTCRelay() {
        // connect over WS using public endpoint 
        // let connection;

        // // subscribe to new block events

        // // register event handler for new blocks
        // connection.on("block", (block: any) => {

        //     // parse the json into IBitcoinBlock

        //     this.emit("block", block);
        // })
    }
}