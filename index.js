// Created 02/05/22 by Kristian Trenskow
// See LICENSE for license.

export default (opening, closing) => {

	if (typeof opening !== 'string' || typeof closing !== 'string') {
		throw new TypeError('Opening and closing tokens must be strings.');
	}

	if (opening.length === 0 || closing.length === 0) {
		throw new TypeError('Opening and closing tokens cannot be zero-length.');
	}

	if (opening === closing) {
		throw new TypeError('Opening and closing tokens cannot be the same.');
	}

	return {
		do: (text) => {

			const next = (text, offset = 0) => {

				let result = [];

				let literal = '';

				let idx = offset;

				for (idx ; idx < text.length ; idx++) {
					if (text[idx] === '\\') {
						literal += text[++idx];
					} else if (text.substring(idx, idx + opening.length) === opening) {
						result.push(literal);
						let value;
						[idx, value] = next(text, idx + opening.length);
						result.push(value);
						literal = '';
					} else if (text.substring(idx, idx + closing.length) === closing) {

						if (literal.length > 0) result.push(literal);

						if (result.length === 1 && typeof result[0] === 'string') {
							result = result[0];
						}

						return [idx + closing.length - 1, result];

					} else {
						literal += text[idx];
					}
				}

				throw new Error('Missing closing token.');

			};

			return next(text + closing)[1];

		}
	};

};
