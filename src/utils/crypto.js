import { hexToUint8 } from './typedArrays';

const { crypto } = window;
const PREFIX = 'utils: crypto:';

/**
 * Factory to create cyphers that can encrypt
 * messages using a key & init vector
 *
 * @param  {string} hexSecret - HEX formatted portion of secret
 * @param  {string} hexIv - Initialization Vector portion of secret
 * @return {Object} cypher - crypto.subtle.CryptoKey
 */
export const createCypher = async (hexSecret, hexIv) => {
	const rawSecret = hexToUint8(hexSecret);
	const rawIv = hexToUint8(hexIv);
	let cryptoKey = null;

	// Create ABS-CBC 256 key
	try {
		cryptoKey = await crypto.subtle.importKey(
			'raw',
			rawSecret,
			'AES-CBC',
			true,
			['encrypt', 'decrypt']
		);
	} catch (err) {
		throw Error(`${PREFIX} createCypher: failed to import key: ${err}`);
	}

	return {
		/**
		 * Encrypt a message with AES-CBC 256
		 *
		 * @param  {string} srcMsg - raw/non-encoded string to encode
		 * @return {Promise<any>} - Binary representation of cypher text
		 */
		async encrypt(srcMsg) {
			const message = new TextEncoder().encode(srcMsg);

			let arrBuffCipherTxt = null;
			try {
				arrBuffCipherTxt = await crypto.subtle.encrypt(
					{
						name: 'AES-CBC',
						iv: rawIv,
					},
					cryptoKey,
					message
				);
			} catch (err) {
				throw Error(
					`${PREFIX} cypher: encrypt: subtle encryption failed: ${err}`
				);
			}

			return new Uint8Array(arrBuffCipherTxt);
		},
	};
};
