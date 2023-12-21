import { expect, it } from 'vitest'
import { markupToElements } from './markup'

it('should convert to elements', () => {
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
