const PREFIX = 'services: api:';
const SHARED_WIDGET_URL =
	'https://us-central1-excelkits.cloudfunctions.net/api/v0/integrations/shared-widget-snippets';
const PRIVATE_WIDGET_URL =
	'https://us-central1-excelkits.cloudfunctions.net/api/v0/integrations/team-widget-snippets';

/**
 * Get shared widget JSON from API
 *
 * @return {Promise<any>} - resolves JSON payload
 */
export const getSharedWidgets = async () => {
	let result = null;
	let req = null;

	try {
		req = await fetch(SHARED_WIDGET_URL);
	} catch (err) {
		throw Error(`${PREFIX} getSharedWidgets: failed to download: ${err}`);
	}

	try {
		result = await req.json();
	} catch (err) {
		throw Error(
			`${PREFIX} getSharedWidgets: failed to parse payload: ${err}`
		);
	}

	return result;
};

/**
 * Request a team's private widgets
 *
 * @param  {string} authorization
 * @return {Promise<any>} - JSON-API formatted payload
 */
export const getPrivateWidgets = async (authorization) => {
	let result = null;
	let req = null;

	if (!authorization || typeof authorization !== 'string') {
		throw Error(
			`${PREFIX} getPrivateWidgets: provided authorization invalid`
		);
	}

	try {
		req = await fetch(PRIVATE_WIDGET_URL, {
			headers: {
				'Content-Type': 'application/vnd.api+json',
				Authorization: `api-key ${authorization}`,
			},
		});
	} catch (err) {
		throw Error(`${PREFIX} getPrivateWidgets: failed to download: ${err}`);
	}

	try {
		result = await req.json();
	} catch (err) {
		throw Error(
			`${PREFIX} getPrivateWidgets: failed to parse payload: ${err}`
		);
	}

	return result;
};
