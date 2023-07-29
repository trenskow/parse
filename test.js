// Created 02/05/22 by Kristian Trenskow
// See LICENSE for license.

import { expect } from 'chai';

import parse from './index.js';

describe('parser', () => {
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
	it ('should come back with parsed tree (with escapes and boundaries).', () => {
		expect(parse('[', ']', { boundaries: 'include' }).do('This [is [my [\\[nested\\]] string]].')).to.eql([
			'This ',
			[
				'[is ',
				[
					'[my ',
					'[[nested]]',
					' string]'
				],
				']'
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
	it ('should come back with parsed tree (with ignore).', () => {
		expect(parse('[', ']', { ignoreInside: ['"', '\''] }).do('This [is "my [\'nested\']" [string]]')).to.eql([
			'This ',
			[
				'is "my [\'nested\']" ',
				'string'
			]
		]);
	});
	it ('should come back with parsed tree (max depth = 1).', () => {
		expect(parse('[', ']', { maxDepth: 1 }).do('This [is [my nested string]].')).to.eql([
			'This ',
			'is [my nested string]',
			'.'
		]);
	});
	it ('should come back with parsed tree (max depth = 0).', () => {
		expect(parse('[', ']', { maxDepth: 0 }).do('This [is [my nested string]].')).to.eql(
			'This [is [my nested string]].'
		);
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
	it ('should throw an error if options is not an object.', () => {
		expect(() => {
			parse('[', ']', '123');
		}).to.throw('Options must be an object');
	});
	it ('should throw an error if ignoreInside is not a string.', () => {
		expect(() => {
			parse('[', ']', { ignoreInside: null });
		}).to.throw('Ignore inside must be a string.');
	});
	it ('should throw an error if maxDepth is not a number.', () => {
		expect(() => {
			parse('[', ']', { maxDepth: true });
		}).to.throw('Max depth must be a number.');
	});
	it ('should throw an error if max depth is less that zero.', () => {
		expect(() => {
			parse('[', ']', { maxDepth: -1 });
		}).to.throw('Max depth must be greater than zero.');
	});
	it ('should throw an error if boundaries is unknown value.', () => {
		expect(() => {
			parse('[', ']', { boundaries: 'wrong' });
		}).to.throw('Boundaries must be either `\'exclude\'` (default) or `\'include\'`.');
	});
});
