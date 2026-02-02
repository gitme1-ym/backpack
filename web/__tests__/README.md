# Web Package Tests

This directory contains comprehensive tests for the `@coral-xyz/backpack-web` package.

## Test Files

### `package.test.ts`

Comprehensive test suite for validating the `web/package.json` configuration file. This test suite ensures:

- **Structure and Validity**: Validates JSON structure, required fields, and package metadata
- **Scripts**: Verifies all npm scripts are properly defined
- **Dependencies**: Ensures all production dependencies are present and correctly versioned
- **Security**: Validates that Next.js version ≥15.5.10 to fix vulnerability SNYK-JS-NEXT-15104645
- **Version Consistency**: Checks that React and React DOM versions match
- **Workspace Compatibility**: Ensures package works within the monorepo structure
- **Edge Cases**: Tests boundary conditions and negative cases
- **Regression Tests**: Ensures backward compatibility and no breaking changes

## Running Tests

### With Jest (when dependencies are installed)

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run with coverage
yarn test --coverage
```

### Without Jest (validation only)

If Jest dependencies are not yet installed, you can run the validation script:

```bash
# Run package.json validation
yarn test:validate

# Or directly
node validate-package.js
```

The validation script (`validate-package.js`) runs the same checks as the Jest tests but doesn't require Jest to be installed. It's useful for CI/CD pipelines or environments where dependencies haven't been installed yet.

## Test Coverage

The test suite includes **28+ test cases** covering:

1. **JSON Structure Validation** (5 tests)
   - Valid JSON format
   - Required fields presence
   - Package name format
   - Version format
   - Private flag

2. **Scripts Validation** (4 tests)
   - All required scripts defined
   - Next.js commands
   - Lint commands
   - No empty scripts

3. **Dependencies Validation** (4 tests)
   - Required production dependencies
   - Next.js version ≥15.5.10 (security fix)
   - React version pinning
   - No duplicate dependencies

4. **DevDependencies Validation** (4 tests)
   - TypeScript and type definitions
   - Jest test framework
   - Tailwind CSS stack
   - Code quality tools (ESLint, Prettier)

5. **Security Tests** (2 tests)
   - No vulnerable Next.js versions
   - Proper version range for security patches

6. **Version Consistency** (1 test)
   - React and React DOM version matching

7. **Workspace Compatibility** (2 tests)
   - Scoped package naming
   - Monorepo compatibility

8. **Edge Cases** (3 tests)
   - No nullish dependencies
   - Valid package name format
   - No test dependencies in production

9. **Regression Tests** (4 tests)
   - Backward compatibility
   - Next.js major version
   - Tailwind plugins preserved
   - UI library dependencies maintained

## Configuration

### `jest.config.js`

Jest configuration for the web package:

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  collectCoverageFrom: [
    "**/*.{ts,tsx,js,jsx}",
    "!**/*.config.js",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
  ],
};
```

## Test Strategy

### Why Test package.json?

While `package.json` is typically a configuration file, testing it is crucial for:

1. **Security**: Ensuring vulnerability fixes are maintained (e.g., Next.js ≥15.5.10)
2. **Consistency**: Preventing version mismatches between related packages
3. **Regression Prevention**: Catching accidental downgrades or removals
4. **CI/CD Validation**: Ensuring packages build correctly in automated pipelines
5. **Documentation**: Tests serve as living documentation of package requirements

### Test Philosophy

- **Comprehensive Coverage**: Test all aspects of the package configuration
- **Security First**: Prioritize tests that validate security fixes
- **Maintainability**: Clear test names that explain what's being validated
- **Fast Execution**: Tests run in milliseconds without external dependencies
- **Self-Documenting**: Test descriptions explain the "why" behind each validation

## Adding New Tests

When adding new tests, follow this structure:

```typescript
describe("Category Name", () => {
  it("should describe what is being tested", () => {
    // Arrange
    const value = packageJson.someField;

    // Assert
    expect(value).toBe(expectedValue);
  });
});
```

### Test Categories

Use these categories to organize tests:

- **Structure and Validity**: Basic JSON and package structure
- **Scripts**: npm/yarn script definitions
- **Dependencies**: Production dependencies
- **DevDependencies**: Development dependencies
- **Security**: Vulnerability fixes and security-related checks
- **Version Consistency**: Cross-package version matching
- **Workspace Compatibility**: Monorepo-specific validations
- **Edge Cases**: Boundary conditions and negative tests
- **Regression Tests**: Prevent known issues from reoccurring

## Continuous Integration

These tests should run on:

- Pre-commit hooks (via husky)
- Pull request validation
- CI/CD pipelines (GitHub Actions, etc.)
- Before releases

Example CI configuration:

```yaml
- name: Test web package
  run: |
    cd web
    yarn test --passWithNoTests
```

## Troubleshooting

### Jest Not Found

If Jest is not installed, use the validation script:

```bash
node validate-package.js
```

### Tests Failing After Dependency Update

1. Check if the new versions break any validation rules
2. Update tests if the changes are intentional
3. Ensure version consistency across related packages
4. Verify security fixes are maintained

### Adding New Dependencies

When adding new dependencies, ensure:

1. No duplicates between dependencies and devDependencies
2. Version ranges are appropriate (^, ~, or exact)
3. TypeScript types are included in devDependencies when needed
4. Dependencies don't conflict with workspace resolutions

## Related Files

- `/web/package.json` - The package configuration being tested
- `/web/jest.config.js` - Jest configuration
- `/web/validate-package.js` - Standalone validation script
- `/.github/workflows/` - CI/CD configurations (if applicable)