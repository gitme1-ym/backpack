import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('web/package.json', () => {
  let packageJson: any;
  const packageJsonPath = path.join(__dirname, '..', 'package.json');

  beforeAll(() => {
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    packageJson = JSON.parse(packageJsonContent);
  });

  describe('Structure and Format', () => {
    it('should be valid JSON', () => {
      expect(() => {
        const content = fs.readFileSync(packageJsonPath, 'utf-8');
        JSON.parse(content);
      }).not.toThrow();
    });

    it('should have required top-level fields', () => {
      expect(packageJson).toHaveProperty('name');
      expect(packageJson).toHaveProperty('version');
      expect(packageJson).toHaveProperty('scripts');
      expect(packageJson).toHaveProperty('dependencies');
      expect(packageJson).toHaveProperty('devDependencies');
    });

    it('should be marked as private', () => {
      expect(packageJson.private).toBe(true);
    });

    it('should have the correct package name', () => {
      expect(packageJson.name).toBe('@coral-xyz/backpack-web');
    });

    it('should have a valid semver version', () => {
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('Dependencies', () => {
    it('should have Next.js as a dependency', () => {
      expect(packageJson.dependencies).toHaveProperty('next');
    });

    it('should have Next.js version 15.5.10 or higher to fix vulnerabilities', () => {
      const nextVersion = packageJson.dependencies.next;
      // Extract version number, handling ^, ~, >= prefixes
      const versionMatch = nextVersion.match(/[\d.]+/);
      expect(versionMatch).not.toBeNull();

      const version = versionMatch[0];
      const [major, minor, patch] = version.split('.').map(Number);

      // Should be >= 15.5.10 (fix for SNYK-JS-NEXT-15104645)
      expect(major).toBeGreaterThanOrEqual(15);
      if (major === 15) {
        expect(minor).toBeGreaterThanOrEqual(5);
        if (minor === 5) {
          expect(patch).toBeGreaterThanOrEqual(10);
        }
      }
    });

    it('should have React 18.2.0 as a dependency', () => {
      expect(packageJson.dependencies.react).toBe('18.2.0');
    });

    it('should have React DOM 18.2.0 as a dependency', () => {
      expect(packageJson.dependencies['react-dom']).toBe('18.2.0');
    });

    it('should have matching React and React DOM versions', () => {
      expect(packageJson.dependencies.react).toBe(packageJson.dependencies['react-dom']);
    });

    it('should only have production dependencies in dependencies field', () => {
      const prodDeps = Object.keys(packageJson.dependencies);
      expect(prodDeps).toContain('next');
      expect(prodDeps).toContain('react');
      expect(prodDeps).toContain('react-dom');
      expect(prodDeps.length).toBe(3);
    });
  });

  describe('Dev Dependencies', () => {
    it('should have required dev dependencies for a Next.js/React/TypeScript project', () => {
      const devDeps = packageJson.devDependencies;

      // TypeScript support
      expect(devDeps).toHaveProperty('typescript');
      expect(devDeps).toHaveProperty('@types/node');
      expect(devDeps).toHaveProperty('@types/react');
      expect(devDeps).toHaveProperty('@types/react-dom');

      // Tailwind CSS
      expect(devDeps).toHaveProperty('tailwindcss');
      expect(devDeps).toHaveProperty('autoprefixer');
      expect(devDeps).toHaveProperty('postcss');

      // Linting
      expect(devDeps).toHaveProperty('eslint');
      expect(devDeps).toHaveProperty('eslint-config-next');
    });

    it('should have Tailwind CSS plugins', () => {
      const devDeps = packageJson.devDependencies;
      expect(devDeps).toHaveProperty('@tailwindcss/aspect-ratio');
      expect(devDeps).toHaveProperty('@tailwindcss/forms');
      expect(devDeps).toHaveProperty('@tailwindcss/typography');
    });

    it('should have Headless UI for accessible components', () => {
      expect(packageJson.devDependencies).toHaveProperty('@headlessui/react');
    });

    it('should have TypeScript version compatible with project', () => {
      const tsVersion = packageJson.devDependencies.typescript;
      expect(tsVersion).toMatch(/[~^]?4\.9\.\d+/);
    });
  });

  describe('Scripts', () => {
    it('should have all required Next.js scripts', () => {
      const scripts = packageJson.scripts;
      expect(scripts).toHaveProperty('dev');
      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('start');
      expect(scripts).toHaveProperty('lint');
    });

    it('should have dev script pointing to next dev', () => {
      expect(packageJson.scripts.dev).toBe('next dev');
    });

    it('should have build script pointing to next build', () => {
      expect(packageJson.scripts.build).toBe('next build');
    });

    it('should have start script pointing to next start', () => {
      expect(packageJson.scripts.start).toBe('next start');
    });

    it('should have lint script pointing to next lint', () => {
      expect(packageJson.scripts.lint).toBe('next lint');
    });

    it('should have lint:fix script for auto-fixing', () => {
      expect(packageJson.scripts['lint:fix']).toBe('next lint --fix');
    });

    it('should have test scripts for running unit tests', () => {
      expect(packageJson.scripts.test).toBe('jest');
      expect(packageJson.scripts['test:watch']).toBe('jest --watch');
      expect(packageJson.scripts['test:coverage']).toBe('jest --coverage');
    });

    it('should have all standard scripts', () => {
      const scripts = packageJson.scripts;
      const requiredScripts = ['dev', 'build', 'start', 'lint', 'lint:fix', 'test', 'test:watch', 'test:coverage'];
      requiredScripts.forEach(script => {
        expect(scripts).toHaveProperty(script);
      });
    });
  });

  describe('Version Constraints', () => {
    it('should use caret (^) for flexible dependency updates', () => {
      const nextVersion = packageJson.dependencies.next;
      expect(nextVersion).toMatch(/^\^/);
    });

    it('should use exact versions for React to ensure consistency', () => {
      const reactVersion = packageJson.dependencies.react;
      const reactDomVersion = packageJson.dependencies['react-dom'];
      expect(reactVersion).not.toMatch(/[\^~]/);
      expect(reactDomVersion).not.toMatch(/[\^~]/);
    });

    it('should have reasonable version constraints for dev dependencies', () => {
      const devDeps = packageJson.devDependencies;
      Object.entries(devDeps).forEach(([name, version]) => {
        // Version should start with ^, ~, or be exact
        expect(String(version)).toMatch(/^[\^~]?\d+\.\d+(\.\d+)?/);
      });
    });
  });

  describe('Security - Vulnerability Fix', () => {
    it('should not have vulnerable Next.js version below 15.5.10', () => {
      const nextVersion = packageJson.dependencies.next;
      const versionMatch = nextVersion.match(/[\d.]+/);
      const version = versionMatch[0];
      const [major, minor, patch] = version.split('.').map(Number);

      // Ensure we're not using a vulnerable version
      const isVulnerable =
        major < 15 ||
        (major === 15 && minor < 5) ||
        (major === 15 && minor === 5 && patch < 10);

      expect(isVulnerable).toBe(false);
    });

    it('should use a specific Next.js version that addresses SNYK-JS-NEXT-15104645', () => {
      // This test ensures the security fix is in place
      const nextVersion = packageJson.dependencies.next;
      expect(nextVersion).toMatch(/\^15\.5\.10/);
    });
  });

  describe('Workspace Configuration', () => {
    it('should be part of a monorepo workspace', () => {
      // Check that parent package.json includes web in workspaces
      const rootPackageJsonPath = path.join(__dirname, '..', '..', 'package.json');
      const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'));

      expect(rootPackageJson.workspaces.packages).toContain('web');
    });
  });

  describe('Edge Cases', () => {
    it('should not have duplicate dependencies in dependencies and devDependencies', () => {
      const deps = new Set(Object.keys(packageJson.dependencies));
      const devDeps = new Set(Object.keys(packageJson.devDependencies));

      const intersection = [...deps].filter(dep => devDeps.has(dep));
      expect(intersection).toEqual([]);
    });

    it('should not have empty strings as values', () => {
      const allValues = [
        ...Object.values(packageJson.dependencies),
        ...Object.values(packageJson.devDependencies),
        ...Object.values(packageJson.scripts),
      ];

      allValues.forEach(value => {
        expect(String(value).trim()).not.toBe('');
      });
    });

    it('should not have null or undefined values', () => {
      const checkForNull = (obj: any) => {
        Object.values(obj).forEach(value => {
          expect(value).not.toBeNull();
          expect(value).not.toBeUndefined();
        });
      };

      checkForNull(packageJson.dependencies);
      checkForNull(packageJson.devDependencies);
      checkForNull(packageJson.scripts);
    });

    it('should handle package.json file read errors gracefully', () => {
      const nonExistentPath = path.join(__dirname, 'non-existent-package.json');
      expect(() => {
        fs.readFileSync(nonExistentPath, 'utf-8');
      }).toThrow();
    });
  });

  describe('Regression Tests', () => {
    it('should maintain Next.js version at or above security fix version', () => {
      // Regression test to ensure future updates don't downgrade Next.js
      const nextVersion = packageJson.dependencies.next;
      const versionMatch = nextVersion.match(/[\d.]+/);
      const version = versionMatch[0];
      const [major, minor, patch] = version.split('.').map(Number);

      // Version should be >= 15.5.10
      const versionNumber = major * 10000 + minor * 100 + patch;
      const minVersionNumber = 15 * 10000 + 5 * 100 + 10; // 15.5.10

      expect(versionNumber).toBeGreaterThanOrEqual(minVersionNumber);
    });

    it('should not accidentally use alpha/beta/rc versions of Next.js', () => {
      const nextVersion = packageJson.dependencies.next;
      expect(nextVersion).not.toMatch(/-(alpha|beta|rc|canary)/i);
    });

    it('should maintain consistency with workspace React versions', () => {
      // Ensure React versions align with workspace resolutions
      const rootPackageJsonPath = path.join(__dirname, '..', '..', 'package.json');
      const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'));

      if (rootPackageJson.resolutions?.react) {
        const expectedReactVersion = rootPackageJson.resolutions.react;
        expect(packageJson.dependencies.react).toBe(expectedReactVersion);
      }
    });
  });

  describe('Negative Cases', () => {
    it('should not have deprecated packages', () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Common deprecated packages to avoid
      const deprecatedPackages = [
        'request',
        'node-uuid',
        'babel-preset-es2015',
        'babel-preset-stage-0',
      ];

      deprecatedPackages.forEach(pkg => {
        expect(allDeps).not.toHaveProperty(pkg);
      });
    });

    it('should not have obvious typos in package names', () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      Object.keys(allDeps).forEach(packageName => {
        // Package names should not have obvious typos
        expect(packageName).not.toMatch(/reactt|nexxt|typscript/);
      });
    });

    it('should not have invalid version formats', () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      Object.entries(allDeps).forEach(([name, version]) => {
        // Should not have obviously invalid versions
        expect(String(version)).not.toBe('latest');
        expect(String(version)).not.toBe('*');
        expect(String(version)).not.toMatch(/^$/);
      });
    });
  });

  describe('Boundary Cases', () => {
    it('should handle very long dependency lists', () => {
      const totalDeps =
        Object.keys(packageJson.dependencies).length +
        Object.keys(packageJson.devDependencies).length;

      // Should be reasonable (not empty, not excessive)
      expect(totalDeps).toBeGreaterThan(0);
      expect(totalDeps).toBeLessThan(500); // Reasonable upper bound
    });

    it('should handle special characters in package names correctly', () => {
      // Scoped packages like @coral-xyz should be valid
      expect(packageJson.name).toMatch(/^@[\w-]+\/[\w-]+$/);

      // Check scoped dependencies are properly formatted
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      Object.keys(allDeps).forEach(packageName => {
        if (packageName.startsWith('@')) {
          expect(packageName).toMatch(/^@[\w-]+\/[\w-]+$/);
        }
      });
    });
  });
});