import parse from 'html-dom-parser'
import type { ChildNode, Element, Text } from 'domhandler'

export function transform(html: string) {
	return parse(html, {
		lowerCaseTags: true,
	})
}

const quoteIfNeeded = (key: string) => /^[a-zA-Z_][a-zA-Z_0-9]+$/.test(key) ? key : `"${key}"`

type Dom = Element | Text

function filterDoms(doms: Array<ChildNode>, skipEmptyText = true) {
	return doms.filter((c) => {
		return (c.type === 'tag')
			|| (c.type === 'text' && (!skipEmptyText || /\S/.test(c.data)))
			|| c.type === 'script'
	}) as Array<Dom>
}

export type MarkupToCodeOptions = {
	indent?: number
	spacing?: boolean
	htmlTagPred?: (name: string) => boolean
}

export function markupToElements(html: string, options?: MarkupToCodeOptions) {
	const {
		indent = 1,
		spacing = false,
	} = options ?? {}

	const nodes = parse(html, { lowerCaseTags: false, lowerCaseAttributeNames: false })

	const tagsUsed = new Set<string>()
	const code = nodesToElements({
		nodes: filterDoms(nodes),
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
	nodes: ReadonlyArray<Dom>
	prefix: string
	skipEmptyText?: boolean
	tagsUsed: Set<string>
	spacing: boolean
	indent: number
}

function nodesToElements(args: DomsToCodeArgs) {
	const { nodes, prefix, skipEmptyText = true, tagsUsed, spacing, indent } = args
	return nodes.flatMap((node): string | Array<string> => {
		const suffix = !prefix && nodes.length <= 1 ? '' : ','
		if (node.type === 'text') {
			return `${prefix}${JSON.stringify(node.data)}${suffix}`
		}
		tagsUsed.add(node.name)

		const localSkipEmptyText = skipEmptyText && node.name !== 'pre'

		const children = filterDoms(node.children, localSkipEmptyText)
		const hasChildren = children.length > 0

		if (hasChildren) {
			return [
				`${prefix}${node.name}(${attrsToProps(node.attribs, hasChildren, spacing)}`,
				...nodesToElements({
					nodes: children,
					prefix: prefix + '\t'.repeat(indent),
					skipEmptyText: localSkipEmptyText,
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
