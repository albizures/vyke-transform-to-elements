import { expect, it } from 'vitest'
import { markupToElements, markupToNodes, nodesToElements } from './markup'

it('should transform to elements', () => {
	expect(true).toBe(true)

	expect(markupToElements('<p>test</p> <Test/>')).toMatchObject(expect.objectContaining(
		{
			code: ['p(', '\t"test",', '),', 'Test(),'],
			tags: ['Test', 'p'],
		},
	))
	expect(markupToElements('<div class="container"> <p data-test="1"> test</p></div>')).toMatchObject(expect.objectContaining(
		{
			code: [
				'div({class: "container"},',
				'\tp({"data-test": "1"},',
				'\t\t" test",',
				'\t),',
				')',
			],
			tags: ['div', 'p'],
		},
	))
})

it('should transform from markup to nodes', () => {
	expect(markupToNodes(`<div class="container">text</div>`)).toMatchObject([
		{
			name: 'div',
			type: 'tag',
			attribs: {
				class: { type: 'value', value: 'container' },
			},
			children: [{
				type: 'text',
				data: 'text',
			}],
		},
	])
})

it('should transform from nodes to elements', () => {
	expect(nodesToElements([
		{
			name: 'div',
			type: 'tag',
			attribs: {
				class: { type: 'var', name: 'classNames' },
			},
			children: [],
		},
	])).toMatchObject({
		code: ['div({class: classNames})'],
		tags: ['div'],
	})
})
