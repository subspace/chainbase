import { Bridge } from './bridge';
import { Subspace, ISubspaceBlock } from './subspace';
import { Relay, IBitcoinBlock } from './relay';
import { randomBytes } from './utils';

/* 
 * A bare-bones demo for Chainbase  
 * Relays live Bitcoin blocks from trusted API to Relay-SC on mock Subspace Chain
 * New Subspace blocks are then sent to Bridge-SC on Ethereum test network
 * BTC -> Relayer -> SSC -> Bridger -> Ethereum
 * 
 * Requires Bridge-SC deployed to Ethereum test network and bridger account with testnet ETH
 */

function main() {
    return new Promise(async () => {
        runDemo();
    });
}

async function runDemo() {

    // setup relayer and relay-sc accounts on Subspace blockchain
    let relayerAddress = randomBytes(32);
    let relayContractAddress = randomBytes(32);

    // connect to Ethereum network over bridge
    let bridger = new Bridge();
    await bridger.connectToEthereumTestNetwork();
    console.log("Connected to Ethereum network!");

    // start the subspace mock blockchain 
    let subspace = new Subspace(5, relayerAddress, relayContractAddress);
    subspace.init();
    console.log("Subspace mockchain is running!");

    // for each new Subspace block, update Bridge-SC on Ethereum
    subspace.on("block", (block: ISubspaceBlock) => {
        console.log("Created new subspace block");
        let tx = bridger.createContractUpdate(block);
        bridger.submitContractUpdate(tx);
        console.log("Submitted update to bridge smart contract on Ethereum");
    });

    // setup the relayer for Bitcoin blockchain
    let relayer = new Relay();
    await relayer.connectToBTCRelay();
    console.log("Connected to Bitcoin blockchain");

    // for each new Bitcoin block, update Relay-SC on Subspace 
    relayer.on("block", (block: IBitcoinBlock) => {
        console.log("Received a new Bitcoin block");
        let tx = subspace.createTx(relayerAddress, relayContractAddress, 1, block);
        subspace.submitTx(tx);
    });

    bridger.on("bridge-updated", () => {
        console.log("New subspace block registered on Ethereum bridge contract");
    })
}


