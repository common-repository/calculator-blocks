/**
 * Convert a HEX string to a Uint8 Typed Array
 *
 * @param  {string} hexString - HEX formatted string
 * @return {any} - Binary representation of string
 */
export const hexToUint8 = (hexString) =>
	Uint8Array.from(
		hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
	);
