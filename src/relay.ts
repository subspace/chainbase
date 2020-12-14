import {EventEmitter} from 'events';
import {client, connection} from "websocket";

export interface IBitcoinBlock {
    height: number;
    hash: Uint8Array;
    merkleRoot: Uint8Array;
    bits: number;
    nonce: number;
}

export class Relay extends EventEmitter {
    /*
     * Connects to Bitcoin.com Websocket API and subscribes to new blocks.
     */
    public async connectToBTCRelay(): Promise<void> {
        const wsClient = new client();

        const connection = await new Promise(
            (
                resolve: (connection: connection) => void,
                reject: (errorDescription: Error) => void,
            ) => {
                wsClient
                    .on('connect', (connection: connection) => {
                        resolve(connection);
                    })
                    .on('connectFailed', (errorDescription: Error) => {
                        reject(errorDescription);
                    })
                    .connect('wss://ws.blockchain.info/inv');
            },
        );

        connection.sendUTF(JSON.stringify({op: 'blocks_sub'}));

        connection.on('message', (message) => {
            if (message.utf8Data) {
                try {
                    const decoded = JSON.parse(message.utf8Data);
                    switch (decoded.op) {
                        case 'block':
                            if (
                                decoded.x &&
                                typeof decoded.x.bits === 'number' &&
                                typeof decoded.x.hash === 'string' &&
                                typeof decoded.x.height === 'number' &&
                                typeof decoded.x.mrklRoot === 'string' &&
                                typeof decoded.x.nonce === 'number'
                            ) {
                                const block: IBitcoinBlock = {
                                    bits: decoded.x.bits,
                                    hash: Buffer.from(decoded.x.hash, 'hex'),
                                    height: decoded.x.height,
                                    merkleRoot: Buffer.from(decoded.x.mrklRoot, 'hex'),
                                    nonce: decoded.x.nonce,
                                };
                                console.info('New bitcoin block received', block);
                                this.emit("block", block);
                            } else {
                                console.error('Unexpected block structure from blockchain.info', decoded);
                            }
                            break;
                        default:
                            console.error('Unexpected operation from blockchain.info', decoded);
                    }
                } catch (e) {
                    console.error('Failed to decode JSON message from blockchain.info', e);
                }
            } else {
                console.error('Received unexpected binary message from blockchain.info');
            }
        });
    }
}
