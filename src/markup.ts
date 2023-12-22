import parse from 'html-dom-parser'
import type { ChildNode } from 'domhandler'

export function transform(html: string) {
	return parse(html, {
		lowerCaseTags: true,
	})
}

const quoteIfNeeded = (key: string) => /^[a-zA-Z_][a-zA-Z_0-9]+$/.test(key) ? key : `"${key}"`

export type Tag = {
	children: Array<Node>
	name: string
	attribs: Record<string, string>
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

export type MarkupToElementsOptions = {
	indent?: number
	spacing?: boolean
	htmlTagPred?: (name: string) => boolean
}

export function markupToNodes(html: string) {
	return filterDoms((parse(html, { lowerCaseTags: false, lowerCaseAttributeNames: false })))
}

export function markupToElements(html: string, options?: MarkupToElementsOptions) {
	const {
		indent = 1,
		spacing = false,
	} = options ?? {}

	const nodes = markupToNodes(html)

	const tagsUsed = new Set<string>()
	const code = nodesToElements({
		nodes,
		prefix: '',
		tagsUsed,
		indent,
		spacing,
	})

	return {
		code,
		tags: [...tagsUsed].sort(),
	}
}

function attrsToProps(attrs: Record<string, string>, hasChildren: boolean, spacing = false) {
	const space = spacing ? ' ' : ''
	return Object.keys(attrs).length === 0
		? ''
		: `{${space}${Object.entries(attrs)
			.flatMap(([k, v]) => `${quoteIfNeeded(k)}: ${JSON.stringify(v)}`)
			.join(', ')}${space}}${hasChildren ? ',' : ''}`
}

type DomsToCodeArgs = {
	nodes: ReadonlyArray<Node>
	prefix: string
	tagsUsed: Set<string>
	spacing: boolean
	indent: number
}

export function nodesToElements(args: DomsToCodeArgs) {
	const { nodes, prefix, tagsUsed, spacing, indent } = args
	return nodes.flatMap((node): string | Array<string> => {
		const suffix = !prefix && nodes.length <= 1 ? '' : ','
		if (node.type === 'text') {
			return `${prefix}${JSON.stringify(node.data)}${suffix}`
		}

		tagsUsed.add(node.name)

		const { children } = node
		const hasChildren = children.length > 0

		if (hasChildren) {
			return [
				`${prefix}${node.name}(${attrsToProps(node.attribs, hasChildren, spacing)}`,
				...nodesToElements({
					nodes: children,
					prefix: prefix + '\t'.repeat(indent),
					tagsUsed,
					spacing,
					indent,
				}),
				`${prefix})${suffix}`,
			]
		}

		return `${prefix}${node.name}(${attrsToProps(node.attribs, hasChildren, spacing)})${suffix}`
	})
}
