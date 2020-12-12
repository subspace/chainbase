import * as crypto from 'crypto';

const MAX = Math.pow(2, 32);

/**
 * Returns a binary sequence of random bytes, using native Node JS crypto.
 */
export function randomBytes(length: number): Uint8Array {
    return new Uint8Array(crypto.randomBytes(length));
}

/**
 * Returns a random positive integer up to 2^32.
 */
export function randomNumber() {
    return Math.floor(Math.random() * Math.floor(MAX));
}

/**
 * Returns the binary hash of a binary value. Hash function and output length are configurable.
 */
export function hash(data: Uint8Array, outputLength = 32, type = 'sha256'): Uint8Array {
    const hasher = crypto.createHash(type);
    hasher.update(data);
    let hash = new Uint8Array(hasher.digest());
    hash = hash.subarray(0, outputLength);
    return hash;
}

/**
 * Generates exponentially distributed numbers that can be used for intervals between arrivals in Poisson process
 */
export function sample(mean: number): number {
    return -Math.log(Math.random()) * mean;
}

/**
 * Pauses execution synchronously for a random time, exponentially distributed around a mean wait time.
 */
export function randomWait(meanWaitTime: number): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), sample(meanWaitTime)));
}