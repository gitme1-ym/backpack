#!/usr/bin/env node

/**
 * This script validates the package.json without requiring Jest to be installed.
 * It runs the same validations as the Jest tests would perform.
 */

const fs = require('fs');
const path = require('path');

let passCount = 0;
let failCount = 0;
const failures = [];

function test(description, testFn) {
  try {
    testFn();
    passCount++;
    console.log(`✓ ${description}`);
  } catch (error) {
    failCount++;
    failures.push({ description, error: error.message });
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    },
    toMatch(pattern) {
      if (!pattern.test(actual)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to match ${pattern}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toHaveProperty(prop) {
      if (!actual || !(prop in actual)) {
        throw new Error(`Expected object to have property ${prop}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    },
    not: {
      toThrow() {
        try {
          actual();
        } catch (e) {
          throw new Error(`Expected function not to throw, but it threw: ${e.message}`);
        }
      },
      toMatch(pattern) {
        if (pattern.test(actual)) {
          throw new Error(`Expected ${JSON.stringify(actual)} not to match ${pattern}`);
        }
      },
      toBeNull() {
        if (actual === null) {
          throw new Error('Expected value not to be null');
        }
      },
      toBeUndefined() {
        if (actual === undefined) {
          throw new Error('Expected value not to be undefined');
        }
      },
      toBe(expected) {
        if (actual === expected) {
          throw new Error(`Expected not to be ${JSON.stringify(expected)}`);
        }
      },
      toContain(item) {
        if (actual && actual.includes(item)) {
          throw new Error(`Expected array not to contain ${item}`);
        }
      }
    }
  };
}

// Load package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
const packageJson = JSON.parse(packageJsonContent);

console.log('\n=== Running web/package.json validation tests ===\n');

// Structure and Validity tests
console.log('Structure and Validity:');
test('should be valid JSON', () => {
  expect(() => JSON.parse(packageJsonContent)).not.toThrow();
});

test('should have a valid name field', () => {
  expect(packageJson.name).toBe('@coral-xyz/backpack-web');
  expect(packageJson.name).toMatch(/^@[a-z0-9-~][a-z0-9-._~]*\/[a-z0-9-~][a-z0-9-._~]*$/);
});

test('should have a valid version field', () => {
  expect(packageJson.version).toBe('1.0.0');
  expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
});

test('should be marked as private', () => {
  expect(packageJson.private).toBe(true);
});

test('should have all required top-level fields', () => {
  expect(packageJson).toHaveProperty('name');
  expect(packageJson).toHaveProperty('version');
  expect(packageJson).toHaveProperty('scripts');
  expect(packageJson).toHaveProperty('dependencies');
  expect(packageJson).toHaveProperty('devDependencies');
});

// Scripts tests
console.log('\nScripts:');
test('should define all necessary npm scripts', () => {
  expect(packageJson.scripts).toBeDefined();
  expect(packageJson.scripts).toHaveProperty('dev');
  expect(packageJson.scripts).toHaveProperty('build');
  expect(packageJson.scripts).toHaveProperty('start');
  expect(packageJson.scripts).toHaveProperty('lint');
  expect(packageJson.scripts).toHaveProperty('lint:fix');
  expect(packageJson.scripts).toHaveProperty('test');
});

test('should have valid Next.js script commands', () => {
  expect(packageJson.scripts.dev).toBe('next dev');
  expect(packageJson.scripts.build).toBe('next build');
  expect(packageJson.scripts.start).toBe('next start');
});

test('should have valid lint script commands', () => {
  expect(packageJson.scripts.lint).toBe('next lint');
  expect(packageJson.scripts['lint:fix']).toBe('next lint --fix');
});

// Dependencies tests
console.log('\nDependencies:');
test('should have required production dependencies', () => {
  expect(packageJson.dependencies).toHaveProperty('next');
  expect(packageJson.dependencies).toHaveProperty('react');
  expect(packageJson.dependencies).toHaveProperty('react-dom');
});

test('should use Next.js 15.5.10 or higher to fix vulnerability', () => {
  const nextVersion = packageJson.dependencies.next;
  const cleanVersion = nextVersion.replace(/^[\^~]/, '');
  const [major, minor, patch] = cleanVersion.split('.').map(Number);

  expect(major).toBeGreaterThanOrEqual(15);
  if (major === 15) {
    expect(minor).toBeGreaterThanOrEqual(5);
    if (minor === 5) {
      expect(patch).toBeGreaterThanOrEqual(10);
    }
  }
});

test('should have React 18.2.0 pinned', () => {
  expect(packageJson.dependencies.react).toBe('18.2.0');
  expect(packageJson.dependencies['react-dom']).toBe('18.2.0');
});

test('should not have duplicate dependencies', () => {
  const depKeys = Object.keys(packageJson.dependencies || {});
  const devDepKeys = Object.keys(packageJson.devDependencies || {});
  const duplicates = depKeys.filter(dep => devDepKeys.includes(dep));
  expect(duplicates).toEqual([]);
});

// DevDependencies tests
console.log('\nDevDependencies:');
test('should include essential Next.js and React dev dependencies', () => {
  expect(packageJson.devDependencies).toHaveProperty('@types/react');
  expect(packageJson.devDependencies).toHaveProperty('@types/react-dom');
  expect(packageJson.devDependencies).toHaveProperty('@types/node');
  expect(packageJson.devDependencies).toHaveProperty('typescript');
});

test('should include Jest test dependencies', () => {
  expect(packageJson.devDependencies).toHaveProperty('jest');
  expect(packageJson.devDependencies).toHaveProperty('ts-jest');
  expect(packageJson.devDependencies).toHaveProperty('@jest/globals');
  expect(packageJson.devDependencies).toHaveProperty('@types/jest');
});

test('should include Tailwind CSS and plugins', () => {
  expect(packageJson.devDependencies).toHaveProperty('tailwindcss');
  expect(packageJson.devDependencies).toHaveProperty('postcss');
  expect(packageJson.devDependencies).toHaveProperty('autoprefixer');
});

test('should include ESLint and Prettier', () => {
  expect(packageJson.devDependencies).toHaveProperty('eslint');
  expect(packageJson.devDependencies).toHaveProperty('prettier');
});

// Security tests
console.log('\nSecurity and Vulnerability Fixes:');
test('should not use vulnerable Next.js versions', () => {
  const nextVersion = packageJson.dependencies.next;
  const cleanVersion = nextVersion.replace(/^[\^~]/, '');
  const [major, minor, patch] = cleanVersion.split('.').map(Number);
  const isVulnerable = major < 15 || (major === 15 && minor < 5) || (major === 15 && minor === 5 && patch < 10);
  expect(isVulnerable).toBe(false);
});

test('should use caret or greater for Next.js for security patches', () => {
  const nextVersion = packageJson.dependencies.next;
  expect(nextVersion).toMatch(/^[\^~]/);
});

// Version consistency tests
console.log('\nDependency Version Consistency:');
test('should use consistent React versions', () => {
  const reactVersion = packageJson.dependencies.react;
  const reactDomVersion = packageJson.dependencies['react-dom'];
  expect(reactVersion).toBe(reactDomVersion);
});

// Workspace compatibility
console.log('\nWorkspace Compatibility:');
test('should use scoped package name', () => {
  expect(packageJson.name).toMatch(/^@coral-xyz\//);
});

test('should be compatible with monorepo', () => {
  expect(packageJson.private).toBe(true);
});

// Edge cases
console.log('\nEdge Cases and Validations:');
test('should not have nullish dependencies', () => {
  Object.entries(packageJson.dependencies || {}).forEach(([name, version]) => {
    expect(version).not.toBeNull();
    expect(version).not.toBeUndefined();
    expect(version).not.toBe('');
  });
});

test('should validate package name format', () => {
  expect(packageJson.name).not.toMatch(/^[._]/);
  expect(packageJson.name).not.toMatch(/[A-Z]/);
  expect(packageJson.name).not.toMatch(/\s/);
});

test('should not include test deps in production', () => {
  const testRelatedPackages = ['jest', 'mocha', 'chai'];
  const prodDeps = Object.keys(packageJson.dependencies || {});
  testRelatedPackages.forEach((testPkg) => {
    const hasTestDep = prodDeps.some(dep => dep.includes(testPkg));
    if (hasTestDep) {
      throw new Error(`Found test dependency ${testPkg} in production dependencies`);
    }
  });
});

// Regression tests
console.log('\nRegression Tests:');
test('should maintain backward compatibility', () => {
  expect(packageJson.scripts.build).toBeDefined();
  expect(packageJson.scripts.start).toBeDefined();
});

test('should be on Next.js 15', () => {
  const nextVersion = packageJson.dependencies.next;
  const major = parseInt(nextVersion.replace(/^[\^~]/, '').split('.')[0]);
  expect(major).toBe(15);
});

test('should preserve Tailwind plugins', () => {
  const plugins = [
    '@tailwindcss/aspect-ratio',
    '@tailwindcss/forms',
    '@tailwindcss/typography'
  ];
  plugins.forEach(plugin => {
    expect(packageJson.devDependencies).toHaveProperty(plugin);
  });
});

test('should maintain HeadlessUI and Heroicons', () => {
  expect(packageJson.devDependencies).toHaveProperty('@headlessui/react');
  expect(packageJson.devDependencies).toHaveProperty('@heroicons/react');
});

// Summary
console.log('\n=== Test Summary ===');
console.log(`✓ Passed: ${passCount}`);
console.log(`✗ Failed: ${failCount}`);
console.log(`Total: ${passCount + failCount}`);

if (failCount > 0) {
  console.log('\nFailures:');
  failures.forEach(({ description, error }) => {
    console.log(`  - ${description}: ${error}`);
  });
  process.exit(1);
} else {
  console.log('\n✓ All tests passed!');
  process.exit(0);
}