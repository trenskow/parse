// Created 02/05/22 by Kristian Trenskow
// See LICENSE for license.

export default (opening, closing, options) => {

	if (typeof opening !== 'string' || typeof closing !== 'string') {
		throw new TypeError('Opening and closing tokens must be strings.');
	}

	if (opening.length === 0 || closing.length === 0) {
		throw new TypeError('Opening and closing tokens cannot be zero-length.');
	}

	if (opening === closing) {
		throw new TypeError('Opening and closing tokens cannot be the same.');
	}

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

	let boundaries = options.boundaries;

	if (typeof boundaries === 'undefined') boundaries = 'exclude';

	if (!['exclude', 'include'].includes(boundaries)) {
		throw new TypeError('Boundaries must be either `\'exclude\'` (default) or `\'include\'`.');
	}

	if (maxDepth < 0) {
		throw new TypeError('Max depth must be greater than zero.');
	}

	const ignoring = [];

	return {
		do: (text) => {

			const next = (text, offset, depth) => {

				let result = [];

				let literal = '';

				let idx = offset;
				let ignoredDepths = 0;

				for (idx ; idx < text.length ; idx++) {

					if (text[idx] === '\\') literal += text[++idx];
					else {

						const matchedIgnore = ignoreInside
							.map((ignore) => [ignore, text.substring(idx, idx + ignore.length)])
							.filter(([ignore, matched]) => ignore === matched)
							.map(([_, matched]) => matched)[0];

						if (typeof matchedIgnore !== 'undefined') {
							literal += matchedIgnore;
							if (matchedIgnore === ignoring[ignoring.length - 1]) {
								ignoring.pop();
							} else {
								ignoring.push(matchedIgnore);
							}
						}
						else if (ignoring.length === 0) {
							if (text.substring(idx, idx + opening.length) === opening) {

								if (maxDepth > depth) {

									result.push(literal);

									let value;

									[idx, value] = next(text, idx + opening.length, depth + 1);

									result.push(value);

									literal = '';

								} else {
									literal += text[idx];
									ignoredDepths++;
								}

							} else if (text.substring(idx, idx + closing.length) === closing) {

								if (ignoredDepths === 0) {

									if (literal.length > 0) result.push(literal);

									if (result.length === 1 && typeof result[0] === 'string') {
										result = result[0];
									}

									if (depth > 0 && boundaries === 'include') {
										if (Array.isArray(result)) {
											if (Array.isArray(result[0])) result[0] = [opening].concat(result[0]);
											else result[0] = `${opening}${result[0]}`;
											if (Array.isArray(result[result.length - 1])) result.push(closing);
											else result[result.length - 1] = `${result[result.length - 1]}${closing}`;
										} else {
											result = `${opening}${result}${closing}`;
										}
									}

									return [idx + closing.length - 1, result];

								} else {
									literal += text[idx];
									ignoredDepths--;
								}

							} else {
								literal += text[idx];
							}
						}
						else literal += text[idx];

					}
				}

				throw new Error('Missing closing token.');

			};

			return next(text + closing, 0, 0)[1];

		}
	};

};
