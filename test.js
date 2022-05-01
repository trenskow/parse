// Created 02/05/22 by Kristian Trenskow
// See LICENSE for license.

import { expect } from 'chai';

import parse from './index.js';

console.info(JSON.stringify(parse('[', ']').do('This [is [my [nested [string]]]]'), null, 4));

describe('parser', () => {
	it ('should come back with parsed tree (with escapes).', () => {
		expect(parse('[', ']').do('This [is [my [\\[nested\\]] string]].')).to.eql([
			'This ',
			[
				'is ',
				[
					'my ',
					'[nested]',
					' string'
				]
			],
			'.'
		]);
	});
	it ('should come back with parsed tree.', () => {
		expect(parse('{', '}').do('This {is {my {nested} string}}.')).to.eql([
			'This ',
			[
				'is ',
				[
					'my ',
					'nested',
					' string'
				]
			],
			'.'
		]);
	});
	it ('should come back with parsed tree (long tokens).', () => {
		expect(parse('hello', 'goodbye').do('This hello is hello my hello nested goodbye string goodbye goodbye.')).to.eql([
			'This ',
			[
				' is ',
				[
					' my ',
					' nested ',
					' string '
				],
				' '
			],
			'.']);
	});
	it ('should throw an error if closing token is missing.', () => {
		expect(() => {
			parse('[', ']').do('[this');
		}).to.throw('Missing closing token.');
	});
	it ('should throw an error if opening or closing tokens are not a string.', () => {
		expect(() => {
			parse(0, 1).do('[this');
		}).to.throw('Opening and closing tokens must be strings.');
	});
	it ('should throw an error if opening or closing tokens are zero-length.', () => {
		expect(() => {
			parse('', '').do('[this');
		}).to.throw('Opening and closing tokens cannot be zero-length.');
	});
	it ('should throw an error if opening or closing are the same.', () => {
		expect(() => {
			parse('123', '123').do('[this');
		}).to.throw('Opening and closing tokens cannot be the same.');
	});
});
