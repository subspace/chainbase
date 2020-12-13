import { EventEmitter } from 'events';
import { ISubspaceBlock } from './subspace';

// should already be an interface for Ethereum Tx provided by Web3 TS bindings
export interface IEthereumTx { }

// should create an interface for the block data structure that maps to the contract storage, which will be placed inside the date field of the tx
// interface IBridgeContractState { }

export class Bridge extends EventEmitter {

    constructor() {
        super();

        // create Ethereum account and initially fund with some testnet ETH
        // create Bridge-SC and pass in the address (hardcoded constant)
    }

    /**
     * Connects to Ethereum test network over Web3.js
     */
    public async connectToEthereumTestNetwork() {

    }

    /**
     * Create a bridger public and private key
     */
    public async createBridgerAccount() {
        // generate a public, private key from seed
        // output the address to the console
        // first time, transfer test ETH
    }

    /**
     * Forms a new valid Ethereum tx for the bridge smart contract that includes the new Subspace block header
     */
    public createContractUpdate(block: ISubspaceBlock): IEthereumTx {

        console.log(block);

        // bridger address will be the sender
        // bridge-sc address will the receiver
        // subspace block will be the data field of the Eth transaction
        // should be a way to calculate and automate the gas cost

        return {};
    }

    /**
     * Submits the transaction to the Ethereum network and fires an event once the state change occurs
     */
    public async submitContractUpdate(tx: IEthereumTx) {
        console.log(tx);

        // send the tx to the Ethereum test network

        // subscribe to smart contract event emitter and fire event on bridger when state change occurs
        this.emit("bridge-updated");
    }
}