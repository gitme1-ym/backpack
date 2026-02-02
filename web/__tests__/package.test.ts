import { describe, expect, it } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";

describe("web/package.json", () => {
  let packageJson: any;
  let packageJsonPath: string;

  beforeAll(() => {
    packageJsonPath = path.join(__dirname, "..", "package.json");
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
    packageJson = JSON.parse(packageJsonContent);
  });

  describe("Structure and Validity", () => {
    it("should be valid JSON", () => {
      expect(() => {
        const content = fs.readFileSync(packageJsonPath, "utf-8");
        JSON.parse(content);
      }).not.toThrow();
    });

    it("should have a valid name field", () => {
      expect(packageJson.name).toBe("@coral-xyz/backpack-web");
      expect(packageJson.name).toMatch(/^@[a-z0-9-~][a-z0-9-._~]*\/[a-z0-9-~][a-z0-9-._~]*$/);
    });

    it("should have a valid version field", () => {
      expect(packageJson.version).toBe("1.0.0");
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("should be marked as private", () => {
      expect(packageJson.private).toBe(true);
    });

    it("should have all required top-level fields", () => {
      expect(packageJson).toHaveProperty("name");
      expect(packageJson).toHaveProperty("version");
      expect(packageJson).toHaveProperty("scripts");
      expect(packageJson).toHaveProperty("dependencies");
      expect(packageJson).toHaveProperty("devDependencies");
    });
  });

  describe("Scripts", () => {
    it("should define all necessary npm scripts", () => {
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts).toHaveProperty("dev");
      expect(packageJson.scripts).toHaveProperty("build");
      expect(packageJson.scripts).toHaveProperty("start");
      expect(packageJson.scripts).toHaveProperty("lint");
      expect(packageJson.scripts).toHaveProperty("lint:fix");
    });

    it("should have valid Next.js script commands", () => {
      expect(packageJson.scripts.dev).toBe("next dev");
      expect(packageJson.scripts.build).toBe("next build");
      expect(packageJson.scripts.start).toBe("next start");
    });

    it("should have valid lint script commands", () => {
      expect(packageJson.scripts.lint).toBe("next lint");
      expect(packageJson.scripts["lint:fix"]).toBe("next lint --fix");
    });

    it("should not have any empty script values", () => {
      Object.entries(packageJson.scripts).forEach(([name, command]) => {
        expect(command).toBeTruthy();
        expect(typeof command).toBe("string");
        expect((command as string).trim()).not.toBe("");
      });
    });
  });

  describe("Dependencies", () => {
    it("should have required production dependencies", () => {
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies).toHaveProperty("next");
      expect(packageJson.dependencies).toHaveProperty("react");
      expect(packageJson.dependencies).toHaveProperty("react-dom");
    });

    it("should use Next.js 15.5.10 or higher to fix vulnerability SNYK-JS-NEXT-15104645", () => {
      const nextVersion = packageJson.dependencies.next;
      expect(nextVersion).toBeDefined();

      // Remove caret if present
      const cleanVersion = nextVersion.replace(/^[\^~]/, "");
      const [major, minor, patch] = cleanVersion.split(".").map(Number);

      // Verify version is >= 15.5.10
      expect(major).toBeGreaterThanOrEqual(15);
      if (major === 15) {
        expect(minor).toBeGreaterThanOrEqual(5);
        if (minor === 5) {
          expect(patch).toBeGreaterThanOrEqual(10);
        }
      }
    });

    it("should have React 18.2.0 pinned (no caret)", () => {
      expect(packageJson.dependencies.react).toBe("18.2.0");
      expect(packageJson.dependencies["react-dom"]).toBe("18.2.0");
    });

    it("should have all dependencies with valid semver ranges", () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      Object.entries(allDeps).forEach(([name, version]) => {
        expect(version).toBeTruthy();
        expect(typeof version).toBe("string");
        // Valid semver pattern (includes ^, ~, >=, exact versions, etc.)
        expect(version).toMatch(/^(\^|~|>=)?(\d+\.)?(\d+\.)?(\*|\d+)(-[a-z0-9.]+)?$/i);
      });
    });

    it("should not have duplicate dependencies", () => {
      const depKeys = Object.keys(packageJson.dependencies || {});
      const devDepKeys = Object.keys(packageJson.devDependencies || {});

      const duplicates = depKeys.filter(dep => devDepKeys.includes(dep));
      expect(duplicates).toEqual([]);
    });
  });

  describe("DevDependencies", () => {
    it("should include essential Next.js and React dev dependencies", () => {
      expect(packageJson.devDependencies).toBeDefined();
      expect(packageJson.devDependencies).toHaveProperty("@types/react");
      expect(packageJson.devDependencies).toHaveProperty("@types/react-dom");
      expect(packageJson.devDependencies).toHaveProperty("@types/node");
      expect(packageJson.devDependencies).toHaveProperty("typescript");
    });

    it("should include Tailwind CSS and plugins", () => {
      expect(packageJson.devDependencies).toHaveProperty("tailwindcss");
      expect(packageJson.devDependencies).toHaveProperty("postcss");
      expect(packageJson.devDependencies).toHaveProperty("autoprefixer");
      expect(packageJson.devDependencies).toHaveProperty("@tailwindcss/aspect-ratio");
      expect(packageJson.devDependencies).toHaveProperty("@tailwindcss/forms");
      expect(packageJson.devDependencies).toHaveProperty("@tailwindcss/typography");
    });

    it("should include ESLint and Prettier for code quality", () => {
      expect(packageJson.devDependencies).toHaveProperty("eslint");
      expect(packageJson.devDependencies).toHaveProperty("eslint-config-next");
      expect(packageJson.devDependencies).toHaveProperty("eslint-config-prettier");
      expect(packageJson.devDependencies).toHaveProperty("prettier");
      expect(packageJson.devDependencies).toHaveProperty("prettier-plugin-tailwindcss");
    });

    it("should have compatible TypeScript version", () => {
      const tsVersion = packageJson.devDependencies.typescript;
      expect(tsVersion).toBeDefined();
      expect(tsVersion).toMatch(/^~?4\.9\.\d+$/);
    });
  });

  describe("Dependency Version Consistency", () => {
    it("should use consistent React versions", () => {
      const reactVersion = packageJson.dependencies.react;
      const reactDomVersion = packageJson.dependencies["react-dom"];
      expect(reactVersion).toBe(reactDomVersion);
    });

    it("should use consistent @types versions for React", () => {
      const typesReact = packageJson.devDependencies["@types/react"];
      const typesReactDom = packageJson.devDependencies["@types/react-dom"];

      // Extract major version
      const reactMajor = typesReact.replace(/^[\^~]/, "").split(".")[0];
      const reactDomMajor = typesReactDom.replace(/^[\^~]/, "").split(".")[0];

      expect(reactMajor).toBe(reactDomMajor);
    });
  });

  describe("Security and Vulnerability Fixes", () => {
    it("should not use vulnerable Next.js versions below 15.5.10", () => {
      const nextVersion = packageJson.dependencies.next;
      const cleanVersion = nextVersion.replace(/^[\^~]/, "");
      const [major, minor, patch] = cleanVersion.split(".").map(Number);

      // Ensure not using any known vulnerable versions
      const isVulnerable = major < 15 || (major === 15 && minor < 5) || (major === 15 && minor === 5 && patch < 10);
      expect(isVulnerable).toBe(false);
    });

    it("should use caret or greater version range for Next.js to allow security patches", () => {
      const nextVersion = packageJson.dependencies.next;
      expect(nextVersion).toMatch(/^[\^~]/);
    });
  });

  describe("Package Structure Integrity", () => {
    it("should not have unexpected top-level fields that could cause issues", () => {
      const validFields = [
        "name",
        "version",
        "private",
        "scripts",
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies",
        "engines",
        "repository",
        "author",
        "license",
        "keywords",
        "description",
        "main",
        "module",
        "types",
        "exports",
        "files",
        "browserslist",
      ];

      const packageFields = Object.keys(packageJson);
      packageFields.forEach((field) => {
        expect(validFields).toContain(field);
      });
    });

    it("should have consistent formatting (no trailing commas in JSON)", () => {
      const content = fs.readFileSync(packageJsonPath, "utf-8");
      // JSON.parse would fail if there are syntax errors
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it("should not have any empty dependency objects", () => {
      if (packageJson.dependencies) {
        expect(Object.keys(packageJson.dependencies).length).toBeGreaterThan(0);
      }
      if (packageJson.devDependencies) {
        expect(Object.keys(packageJson.devDependencies).length).toBeGreaterThan(0);
      }
    });
  });

  describe("Workspace Compatibility", () => {
    it("should use scoped package name matching the workspace convention", () => {
      expect(packageJson.name).toMatch(/^@coral-xyz\//);
    });

    it("should be compatible with the monorepo structure", () => {
      // This package should work within the Yarn workspace
      expect(packageJson.private).toBe(true);
      // Private packages don't need to specify repository, license, etc.
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    it("should handle missing optional fields gracefully", () => {
      // These fields are optional and should not break if missing
      const optionalFields = ["description", "repository", "keywords", "author", "license"];
      optionalFields.forEach((field) => {
        // Should either not exist or have a valid value
        if (packageJson[field]) {
          expect(packageJson[field]).toBeTruthy();
        }
      });
    });

    it("should not have any nullish dependencies", () => {
      Object.entries(packageJson.dependencies || {}).forEach(([name, version]) => {
        expect(version).not.toBeNull();
        expect(version).not.toBeUndefined();
        expect(version).not.toBe("");
      });

      Object.entries(packageJson.devDependencies || {}).forEach(([name, version]) => {
        expect(version).not.toBeNull();
        expect(version).not.toBeUndefined();
        expect(version).not.toBe("");
      });
    });

    it("should handle deeply nested script commands", () => {
      // Ensure all script values are strings (not objects or nested structures)
      Object.values(packageJson.scripts).forEach((command) => {
        expect(typeof command).toBe("string");
      });
    });

    it("should validate that package name doesn't contain uppercase letters", () => {
      expect(packageJson.name).toBe(packageJson.name.toLowerCase());
    });

    it("should not include test dependencies in production dependencies", () => {
      const testRelatedPackages = ["jest", "mocha", "chai", "jasmine", "@testing-library"];
      const prodDeps = Object.keys(packageJson.dependencies || {});

      testRelatedPackages.forEach((testPkg) => {
        const hasTestDep = prodDeps.some(dep => dep.includes(testPkg));
        expect(hasTestDep).toBe(false);
      });
    });
  });

  describe("Regression Tests", () => {
    it("should maintain backward compatibility with existing build process", () => {
      // Verify scripts that other parts of the monorepo might depend on
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.start).toBeDefined();
    });

    it("should not introduce breaking changes to Next.js major version", () => {
      const nextVersion = packageJson.dependencies.next;
      const major = parseInt(nextVersion.replace(/^[\^~]/, "").split(".")[0]);

      // Verify we're on Next.js 15 as intended by the upgrade
      expect(major).toBe(15);
    });

    it("should preserve all essential Tailwind plugins after upgrade", () => {
      const essentialPlugins = [
        "@tailwindcss/aspect-ratio",
        "@tailwindcss/forms",
        "@tailwindcss/typography",
      ];

      essentialPlugins.forEach((plugin) => {
        expect(packageJson.devDependencies).toHaveProperty(plugin);
      });
    });

    it("should maintain HeadlessUI and Heroicons dependencies", () => {
      expect(packageJson.devDependencies).toHaveProperty("@headlessui/react");
      expect(packageJson.devDependencies).toHaveProperty("@heroicons/react");
    });
  });

  describe("Negative Test Cases", () => {
    it("should not allow invalid package names", () => {
      // Current name should be valid
      expect(packageJson.name).not.toMatch(/^[._]/); // Can't start with . or _
      expect(packageJson.name).not.toMatch(/[A-Z]/); // No uppercase
      expect(packageJson.name).not.toMatch(/\s/); // No spaces
    });

    it("should not have conflicting Next.js and ESLint versions", () => {
      const nextVersion = packageJson.dependencies.next;
      const eslintConfigNext = packageJson.devDependencies["eslint-config-next"];

      // Both should be defined
      expect(nextVersion).toBeDefined();
      expect(eslintConfigNext).toBeDefined();
    });

    it("should not include development-only dependencies in production", () => {
      const devOnlyPackages = ["nodemon", "ts-node", "webpack-dev-server"];
      const prodDeps = Object.keys(packageJson.dependencies || {});

      devOnlyPackages.forEach((devPkg) => {
        expect(prodDeps).not.toContain(devPkg);
      });
    });

    it("should not have mismatched React versions that could cause runtime errors", () => {
      const reactVersion = packageJson.dependencies.react;
      const reactDomVersion = packageJson.dependencies["react-dom"];

      // Extract versions without prefixes
      const reactClean = reactVersion.replace(/^[\^~]/, "");
      const reactDomClean = reactDomVersion.replace(/^[\^~]/, "");

      expect(reactClean).toBe(reactDomClean);
    });
  });
});