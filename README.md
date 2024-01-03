<div align="center">
	<h1>
		@vyke/transform-to-elements
	</h1>
</div>

Helper functions to transform code into @vyke/elements

## Installation
```sh
npm i @vyke/transform-to-elements
```
or you can use the interactive [website](https://transform-to-elements.vyke.dev/)

## API
### markupToNodes
Converts markup into nodes, useful to manipulated the code
before converting it to elements

```ts
import { markupToNodes } from '@vyke/transform-to-elements'

const nodes = markupToNodes('<div><p>test</p></div>')
//      ^? Node[]
```

### markupToElements
Converts a given markup to elements

```ts
import { markupToElements } from '@vyke/transform-to-elements'

const elements = markupToElements('<div><p>test</p></div>')
//       ^? { code: string[], tags: string[] }
// where code is each line of the output
// and tags is the list of elements found
```

### nodesToElements
Converts nodes to elements to generate elements using the output of `markupToNodes`

```ts
import { markupToNodes } from '@vyke/transform-to-elements'

const nodes = markupToNodes('<div><p>test</p></div>')
//      ^? Node[]

const elements = nodesToElements(nodes) // same output as markupToElements
```

## Inspiration and Credits
- inspired by [HTML/MD Snippet to VanJS Code](https://vanjs.org/convert)
- Done using [domhandler](https://github.com/fb55/domhandler) and [html-dom-parser](https://github.com/remarkablemark/html-dom-parser)
