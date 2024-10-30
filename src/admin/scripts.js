(function () {
	const formEl = document.getElementById('api-credentials-form');
	const apiKeyEl = document.getElementById('excelkits-api-key');
	const apiSecretEl = document.getElementById('excelkits-secret');
	const baseUrl = formEl.dataset.pageUrl;

	function submitApiCredentials(evt) {
		const apiKey = apiKeyEl.value;
		const secret = apiSecretEl.value;
		window.location.href = `${baseUrl}&api_key=${apiKey}&secret=${secret}`;
		evt.preventDefault();
		evt.stopPropagation();
		return false;
	}

	formEl.addEventListener('submit', submitApiCredentials);

	// Clear previously saved query params
	if (typeof URLSearchParams !== 'undefined') {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.delete('api_key');
		searchParams.delete('secret');
		searchParams.delete('action');
		searchParams.delete('_wpnonce');

		if (window.history.replaceState) {
			const searchString =
				searchParams.toString().length > 0
					? '?' + searchParams.toString()
					: '';
			const newUrl =
				window.location.protocol +
				'//' +
				window.location.host +
				window.location.pathname +
				searchString +
				window.location.hash;
			window.history.replaceState(null, '', newUrl);
		}
	}
})();
