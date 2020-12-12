import { EventEmitter } from 'events';
import { IBitcoinBlock } from './relay';
import { ArrayMap } from "array-map-set";
import { randomBytes, randomWait, randomNumber } from './utils';

/**
 * A simple block for the mock chain 
 */
export interface ISubspaceBlock {
    /* 32 bytes hash of previous block */
    previousBlock: Uint8Array;
    /* Height of current block */
    blockHeight: number;
    /* Nonce used for proof-of-space */
    nonce: number;
    /* Public key used for proof-of-space */
    publicKey: Uint8Array;
    /* MMR root of all accounts */
    stateRoot: Uint8Array;
}

/**
 * A simple transaction for the mock chain 
 */
export interface ISubspaceTx {
    /* Sender public key */
    sender: Uint8Array;
    /* Receiver public key */
    receiver: Uint8Array;
    /* Value of subspace credits */
    amount: number;
    /* Arbitrary data for contract state update */
    data: any;
    /* Nonce for this tx, to prevent replay attacks */
    nonce: number;
    /* Signature of tx body with sender private key */
    signature: Uint8Array;
}

/**
 * A simple account for the mock chain 
 */
interface IAccount {
    /* Current contract or account balance */
    balance: number;
    /* Current contract state */
    state: any;
}

export class Subspace extends EventEmitter {

    private blockTime: number;

    /* Basic chain does not support forks */
    private chain: ISubspaceBlock[] = [];

    /* Basic accounts with credit balance or any state */
    private accounts = ArrayMap<Uint8Array, IAccount>();

    constructor(blockTime: number, relayerAddress: Uint8Array, relayContractAddress: Uint8Array) {
        super();
        this.blockTime = blockTime;

        // init the relayer account
        let relayerAccount: IAccount = {
            balance: 1000,
            state: {},
        }
        this.accounts.set(relayerAddress, relayerAccount);

        // init the relay (bitcoin storage) contract
        let relayStorageAccount: IAccount = {
            balance: 0,
            state: {},
        }

        this.accounts.set(relayContractAddress, relayStorageAccount);
    }

    /**
     * Starts a block production loop with a random block time
     */
    public init() {
        while (true) {
            randomWait(this.blockTime);
            const block = this.createBlock();
            this.chain.push(block);
            this.emit("block", block);
        }
    }

    /**
     * Creates a new block with random inputs
     */
    private createBlock(): ISubspaceBlock {
        let blockHeight = 0;
        if (this.chain.length > 0) {
            blockHeight = this.chain.length + 1;
        }

        // TODO: get hash of last block instead of random bytes
        // TODO: get MMR root of state instead of random bytes

        const block: ISubspaceBlock = {
            previousBlock: randomBytes(32),
            blockHeight,
            nonce: randomNumber(),
            publicKey: randomBytes(32),
            stateRoot: randomBytes(32),
        };

        return block;
    }

    /**
     * Create a new transaction (for storage update)
     */
    public createTx(sender: Uint8Array, receiver: Uint8Array, amount: number, data: IBitcoinBlock): ISubspaceTx {

        const tx: ISubspaceTx = {
            sender,
            receiver,
            amount,
            data,
            nonce: randomNumber(),
            signature: randomBytes(32),
        };

        return tx;
    }

    /**
     * Post the update to the chain
     */
    public submitTx(tx: ISubspaceTx) {

        let senderAccount = this.accounts.get(tx.sender);
        senderAccount.balance -= tx.amount;

        let receiverAccount = this.accounts.get(tx.receiver);
        receiverAccount.balance += tx.amount;
        receiverAccount.state = tx.data;

        // TODO: pay the tx fee
    };

}


