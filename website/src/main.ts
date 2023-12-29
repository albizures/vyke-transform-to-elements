import './style.css'
import debounce from 'debounce'
import { FaSolidAdd } from '@vyke/elements-fa-solid'
import { markupToElements } from '../../src/markup'

const input = document.getElementById('input')! as HTMLTextAreaElement
const output = document.getElementById('output')!as HTMLTextAreaElement

const onInputChange = debounce((inputValue: string) => {
	output.value = markupToElements(inputValue).code.join('\n')
})

input.addEventListener('change', () => {
	onInputChange(input.value)
})
input.addEventListener('keyup', () => {
	onInputChange(input.value)
})

onInputChange(input.value)
