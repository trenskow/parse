// Created 02/05/22 by Kristian Trenskow
// See LICENSE for license.

export default (...args) => {

	let boundaries;
	let options;

	if (typeof args[0] === 'string') {
		boundaries = args.slice(0, 2);
		options = args[2];
	} else {
		[ boundaries, options ] = args;
	}

	if (!Array.isArray(boundaries)) {
		throw new TypeError('Boundaries must be an array.');
	}

	if (boundaries.every((boundary) => typeof boundary === 'string')) {
		boundaries = [boundaries];
	}

	boundaries
		.forEach((boundaries) => {
			if (boundaries.length !== 2) {
				throw new TypeError('Boundaries must be an array containing the opening and closing boundary.');
			}
			if (!boundaries.every((boundary) => typeof boundary === 'string')) {
				throw new TypeError('Boundaries must be strings.');
			}
			if (!boundaries.every((boundary) => boundary.length > 0)) {
				throw new TypeError('Boundaries cannot be zero-length.');
			}
			if (boundaries.every((boundary) => boundary === boundaries[0])) {
				throw new TypeError('Boundary tokens cannot be the same.');
			}
		});

	if (typeof options === 'undefined') options = {};
	if (typeof options !== 'object' || options === null) {
		throw new TypeError('Options must be an object.');
	}

	let ignoreInside = options.ignoreInside;

	if (typeof ignoreInside === 'undefined') ignoreInside = [];
	if (!Array.isArray(ignoreInside)) ignoreInside = [ignoreInside];

	if (ignoreInside.filter((ignore) => typeof ignore !== 'string').length) {
		throw new TypeError('Ignore inside must be a string.');
	}

	let maxDepth = options.maxDepth;

	if (typeof maxDepth === 'undefined') maxDepth = Infinity;

	if (typeof maxDepth !== 'number') {
		throw new TypeError('Max depth must be a number.');
	}

	if (typeof options.boundaries === 'undefined') options.boundaries = 'exclude';

	if (!['exclude', 'include'].includes(options.boundaries)) {
		throw new TypeError('Boundaries must be either `\'exclude\'` (default) or `\'include\'`.');
	}

	if (maxDepth < 0) {
		throw new TypeError('Max depth must be greater than zero.');
	}

	const ignoring = [];

	return {
		do: (text) => {

			let foundBoundaries = [];

			const next = (text, offset, depth) => {

				let result = [''];

				let idx = offset;
				let ignoredDepths = 0;

				const appendResult = (text) => {
					result[result.length - 1] += text;
				};

				for (idx ; idx < text.length ; idx++) {

					const nextBoundary = foundBoundaries[foundBoundaries.length - 1];

					if (text[idx] === '\\') appendResult(text[++idx]);
					else {

						const matchedIgnore = ignoreInside
							.map((ignore) => [ignore, text.substring(idx, idx + ignore.length)])
							.filter(([ignore, matched]) => ignore === matched)
							.map(([_, matched]) => matched)[0];

						if (typeof matchedIgnore !== 'undefined') {
							appendResult(matchedIgnore);
							if (matchedIgnore === ignoring[ignoring.length - 1]) {
								ignoring.pop();
							} else {
								ignoring.push(matchedIgnore);
							}
						}
						else if (ignoring.length === 0) {

							const boundary = boundaries.find((boundaries) => text.substring(idx, idx + boundaries[0].length) === boundaries[0]);

							if (typeof boundary !== 'undefined') {

								foundBoundaries.push(boundary);

								if (maxDepth > depth) {

									let value;

									[idx, value] = next(text, idx + boundary[0].length, depth + 1);

									result.push(value);

									result.push('');

								} else {
									appendResult(text[idx]);
									ignoredDepths++;
								}

							} else if (typeof nextBoundary !== 'undefined' && text.substring(idx, idx + nextBoundary[1].length) === nextBoundary[1]) {

								foundBoundaries.pop();

								if (ignoredDepths === 0) {

									if (depth > 0 && options.boundaries === 'include') {
										if (Array.isArray(result[0])) result[0] = [nextBoundary[0]].concat(result[0]);
										else result[0] = `${nextBoundary[0]}${result[0]}`;
										if (Array.isArray(result[result.length - 1])) result.push(nextBoundary[1]);
										else result[result.length - 1] = `${result[result.length - 1]}${nextBoundary[1]}`;
									}

									idx += nextBoundary[1].length - 1;

									break;

								} else {
									appendResult(text[idx]);
									ignoredDepths--;
								}

							} else {
								appendResult(text[idx]);
							}
						}
						else appendResult(text[idx]);

					}
				}

				if (Array.isArray(result)) {
					result = result.filter((value) => value.length > 0);
				}

				if (result.length === 1 && typeof result[0] === 'string') {
					result = result[0];
				}

				return [idx, result];

			};

			return next(text, 0, 0)[1];

		}
	};

};
