import type { expect } from 'vitest'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module 'vitest' {
	// eslint-disable-next-line ts/consistent-type-definitions
	interface Assertion<T = any> extends TestingLibraryMatchers<ReturnType<typeof expect.stringContaining>, T> {
	}
}
