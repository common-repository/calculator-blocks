import { useState, useEffect } from '@wordpress/element';
import { fromByteArray } from 'base64-js';
import { createCypher } from '../utils/crypto';

const PREFIX = 'hooks: useExcelkitsCredentials:';

// Singleton to preserve
// credentials across multiple
// block invocations
const cache = {
	apiKey: '',
	secret: '',
	cypher: null,
	isLoading: false,
	error: null,
};

export default ({ apiKey = '', secret = '' }) => {
	const [hasLoaded, setHasLoaded] = useState(false);
	const [hasCredentials, setHasCredentials] = useState(false);
	const [error, setError] = useState(cache.error);

	// Create the Authorization header
	// used to make permissioned requests
	// to the Excelkits API
	const createAuthorization = async () => {
		if (!cache.apiKey || !cache.cypher) {
			throw Error('Excelkit API Key credentials not discovered yet');
		}

		// Create UNIX timestamp message
		const message = JSON.stringify({
			createdAt: Math.ceil(Date.now() / 1000),
		});

		// Create Uint8 Typed Array
		// encryption of the message
		let byteArrCypherText = null;
		try {
			byteArrCypherText = await cache.cypher.encrypt(message);
		} catch (err) {
			const wrappedErr = Error(
				`${PREFIX} createAuthorization: failed to create byte array of cypher text: ${err}`
			);
			setError(wrappedErr);
			throw wrappedErr;
		}

		// Format the cypher text into
		// base64 for inclusion in header
		let base64CypherText = '';
		try {
			base64CypherText = fromByteArray(byteArrCypherText);
		} catch (err) {
			const wrappedErr = Error(
				`${PREFIX} createAuthorization: failed to create base64 of cypher text: ${err}`
			);
			setError(wrappedErr);
			throw wrappedErr;
		}

		// Create the Authorization header payload
		return `${cache.apiKey}~${base64CypherText}`;
	};

	// Setup credentials on inital
	// invocation of this hook
	// NOTE: this is the only place
	//       the cache is updated
	useEffect(() => {
		// No API Keys provided set
		// to unauthorized
		if (!apiKey || !secret) {
			cache.apiKey = '';
			cache.secret = '';
			cache.cypher = null;
			cache.error = null;
			setHasLoaded(true);
			setHasCredentials(false);
			setError(null);
			return;
		}

		// Credentials are already
		// being processed by another
		// invocation, do nothing
		if (cache.isLoading) return;

		// Cypher already up-to-date
		if (
			Boolean(cache.apiKey && cache.secret && cache.cypher) &&
			cache.apiKey === apiKey &&
			cache.secret === secret
		) {
			return;
		}

		// Create new cypher
		cache.isLoading = true;
		cache.error = null;

		generateCypher(secret)
			.then((cypher) => {
				// Save credentials in memory
				cache.apiKey = `${apiKey}`;
				cache.secret = `${secret}`;
				cache.cypher = cypher;
				setHasCredentials(true);
			})
			.catch((err) => {
				const wrappedErr = Error(
					`${PREFIX} failed to create cypher: ${err}`
				);
				setError(wrappedErr);
				cache.error = wrappedErr;
				cache.apiKey = '';
				cache.secret = '';
				cache.cypher = null;
				setHasCredentials(false);
			})
			.finally(() => {
				cache.isLoading = false;
				setHasLoaded(true);
			});
	}, [apiKey, secret]);

	// Side Effects: update from cache changes
	useEffect(() => {
		// Credentials are already
		// being processed by another
		// invocation, do nothing
		if (cache.isLoading) {
			return;
		}

		// Set unauthenticed
		if (!cache.apiKey || !cache.secret) {
			setHasLoaded(true);
			setHasCredentials(false);
			setError(cache.error);
			return;
		}

		// Set athenticated
		if (Boolean(cache.apiKey && cache.secret)) {
			setHasLoaded(true);
			setHasCredentials(true);
			setError(null);
			return;
		}

		// Use latest auth error
		setError(cache.error);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cache.apiKey, cache.secret, cache.isLoading, cache.error]);

	return { hasLoaded, hasCredentials, error, createAuthorization };
};

// Create cypher for credentials
const generateCypher = async (secret) => {
	// Check secret is valid
	const [hexIv, hexSecret] = `${secret || ''}`.split('~');
	if (!hexIv || !hexSecret) {
		throw Error(`${PREFIX} generateCypher: secret is not correct`);
	}

	// Setup cypher and mark credentials
	// as ready ready for consumption
	let cypher = null;
	try {
		cypher = await createCypher(hexSecret, hexIv);
	} catch (err) {
		throw Error(
			`${PREFIX} generateCypher: secret was not accepted as a cypher: ${err}`
		);
	}

	return cypher;
};
