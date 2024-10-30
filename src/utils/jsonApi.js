/**
 * Return ID and attributes of a JSON-API
 * document as a flat object
 *
 * @param  {any} doc - JSON-API document
 * @return {any} flattened document
 */
export const flattenDocument = (doc) => {
	if (!doc || typeof doc !== 'object' || !doc.id) {
		throw Error('utils: jsonApi: flattenDocument: invalid document');
	}

	return {
		...(doc.attributes || {}),
		id: doc.id,
	};
};
