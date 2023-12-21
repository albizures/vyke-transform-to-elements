import type { expect } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module 'vitest' {
	// eslint-disable-next-line ts/consistent-type-definitions
	interface JestAssertion<T = any>
		extends TestingLibraryMatchers<
      ReturnType<typeof expect.stringContaining>,
      T
    > {}
}
