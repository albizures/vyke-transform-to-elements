import parse from 'html-dom-parser'
import type { ChildNode } from 'domhandler'

export function transform(html: string) {
	return parse(html, {
		lowerCaseTags: true,
	})
}

const DEFAULT_PREFIX = ''
const DEFAULT_INDENT = 1
const DEFAULT_SPACING = false

const quoteIfNeeded = (key: string) => /^[a-zA-Z_][a-zA-Z_0-9]+$/.test(key) ? key : `"${key}"`

export type Attribs = Record<string, { type: 'var', name: string } | { type: 'value', value: unknown }>

export type Tag = {
	children: Array<Node>
	name: string
	attribs: Attribs
	type: 'tag' | 'script'
}
export type Text = { data: string, type: 'text' }
export type Node = Tag | Text

function filterDoms(origin: Array<ChildNode>, skipEmptyText = true) {
	const nodes: Array<Node> = []

	for (const node of origin) {
		if (node.type === 'tag' || node.type === 'script') {
			const localSkipEmptyText = skipEmptyText && node.name !== 'pre'

			nodes.push({
				...node,
				type: node.type === 'tag' ? 'tag' : 'script',
				children: filterDoms(node.children, localSkipEmptyText),
				attribs: Object.fromEntries(Object.entries(node.attribs).map(([key, value]) => {
					return [key, {
						type: 'value',
						value,
					}]
				})),
			})
		}
		if (node.type === 'text') {
			if (!skipEmptyText || /\S/.test(node.data)) {
				nodes.push({
					...node,
					type: 'text',
				})
			}
		}
	}

	return nodes
}

export function markupToNodes(html: string) {
	return filterDoms((parse(html, { lowerCaseTags: false, lowerCaseAttributeNames: false })))
}

export type MarkupToElementsOptions = {
	indent?: number
	spacing?: boolean
	htmlTagPred?: (name: string) => boolean
}

export function markupToElements(html: string, options?: MarkupToElementsOptions) {
	const {
		indent = DEFAULT_INDENT,
		spacing = DEFAULT_SPACING,
	} = options ?? {}

	const nodes = markupToNodes(html)

	const tagsUsed = new Set<string>()
	const result = nodesToElements(nodes, {
		indent,
		spacing,
	})

	return {
		code: result.code,
		tags: [...tagsUsed, ...result.tags].sort(),
	}
}

function attrsToProps(attrs: Attribs, hasChildren: boolean, spacing = false) {
	const space = spacing ? ' ' : ''
	return Object.keys(attrs).length === 0
		? ''
		: `{${space}${Object.entries(attrs)
			.flatMap(([key, attrib]) => {
				const name = quoteIfNeeded(key)
				const value = attrib.type === 'var'
					? attrib.name
					: JSON.stringify(attrib.value)

					return `${name}: ${value}`
			})
			.join(', ')}${space}}${hasChildren ? ',' : ''}`
}

type NodesToElementOptions = {
	prefix?: string
	spacing?: boolean
	indent?: number
}

export function nodesToElements(nodes: Array<Node>, options?: NodesToElementOptions) {
	const {
		prefix = DEFAULT_PREFIX,
		spacing = DEFAULT_SPACING,
		indent = DEFAULT_INDENT,
	} = options ?? {}

	const tagsUsed = new Set<string>()

	const code = nodes.flatMap((node): string | Array<string> => {
		const suffix = !prefix && nodes.length <= 1 ? '' : ','
		if (node.type === 'text') {
			return `${prefix}${JSON.stringify(node.data)}${suffix}`
		}

		tagsUsed.add(node.name)

		const { children } = node
		const hasChildren = children.length > 0

		if (hasChildren) {
			const result = nodesToElements(children, {
				prefix: prefix + '\t'.repeat(indent),
				spacing,
				indent,
			})

			for (const tag of result.tags) {
				tagsUsed.add(tag)
			}

			return [
				`${prefix}${node.name}(${attrsToProps(node.attribs, hasChildren, spacing)}`,
				...result.code,
				`${prefix})${suffix}`,
			]
		}

		return `${prefix}${node.name}(${attrsToProps(node.attribs, hasChildren, spacing)})${suffix}`
	})

	return {
		code,
		tags: [...tagsUsed].sort(),
	}
}
