import { useState, useEffect, useCallback } from '@wordpress/element';
import { getSharedWidgets } from '../services/excelkits';
import { flattenDocument } from '../utils/jsonApi';

const cache = {
	data: [],
	isLoading: false,
	hash: '',
};
const PREFIX = 'hooks: useSharedWidgets:';

export default ({ canLoad = false }) => {
	const [data, setData] = useState(cache.data);
	const [isLoading, setIsLoading] = useState(cache.isLoading);
	const [hash, setHash] = useState(cache.hash);
	const [error, setError] = useState(null);

	/**
	 * Request all shared widgets
	 *
	 * @return {Promise<any[]>} - resolves shared widget snippets
	 */
	const download = useCallback(async () => {
		setAllLoading(true);
		setError(null);
		setData([]); // clear
		setAllHash([]);

		let payload = null;
		try {
			payload = await getSharedWidgets();
			if (!payload || !Array.isArray(payload.data)) {
				throw Error('unexpected payload');
			}
		} catch (err) {
			const wrappedErr = Error(
				`${PREFIX} download: shared widgets request failed: ${err}`
			);
			setError(wrappedErr);
			setAllLoading(false);
			throw wrappedErr;
		}

		setAllLoading(false);

		const result = [...payload.data.map(flattenDocument)];
		setData(result);
		cache.data.length = 0; // clear
		cache.data.push(...result);
		setAllHash(result);
		return result;
	}, []);

	// Sync side effects from cache
	// TODO: fix bug falling out of sync
	//		 once initially focused block
	//		 sends request and a new focused block
	//		 is not updated with fresh data
	useEffect(() => {
		if (isLoading !== cache.isLoading) {
			setIsLoading(cache.isLoading);
		}

		if (hash !== cache.hash) {
			setHash(cache.hash);
			setData([...cache.data]);
			setError(null);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cache.isLoading, cache.hash]);

	// Automatically request all shared
	// widgets once on inital render
	// or apply previously requested widgets
	useEffect(() => {
		if (!canLoad || cache.isLoading || cache.data.length) return;
		try {
			download();
		} catch (err) {}
	}, [canLoad, download]);

	/**
	 * Set cache for immediate loading
	 * and loading ref state together
	 *
	 * @param  {boolean} state
	 * @return {void}
	 */
	function setAllLoading(state) {
		cache.isLoading = state;
		setIsLoading(state);
	}

	/**
	 * Create a hash from data
	 * and set within the cache
	 *
	 * @param  {any[]} cacheData
	 * @return {void}
	 */
	function setAllHash(cacheData) {
		const result = cacheData.map(({ id }) => id).join(',');
		cache.hash = result;
		setHash(result);
	}

	return {
		data,
		selectOptions: data.map(({ id, title }) => ({
			value: id,
			label: title,
		})),
		error,
		isLoading,
		download,
	};
};
