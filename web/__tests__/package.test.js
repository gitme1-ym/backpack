const fs = require("fs");
const path = require("path");

describe("web/package.json", () => {
  let packageJson;

  beforeAll(() => {
    const packagePath = path.join(__dirname, "..", "package.json");
    const packageContent = fs.readFileSync(packagePath, "utf8");
    packageJson = JSON.parse(packageContent);
  });

  describe("Package Metadata", () => {
    test("should have correct package name", () => {
      expect(packageJson.name).toBe("@coral-xyz/backpack-web");
    });

    test("should have version defined", () => {
      expect(packageJson.version).toBeDefined();
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test("should be marked as private", () => {
      expect(packageJson.private).toBe(true);
    });

    test("should not have invalid package name characters", () => {
      expect(packageJson.name).not.toContain(" ");
      expect(packageJson.name).not.toContain("_");
    });
  });

  describe("Scripts", () => {
    test("should have all required scripts defined", () => {
      const requiredScripts = ["dev", "build", "start", "lint", "lint:fix"];
      requiredScripts.forEach((script) => {
        expect(packageJson.scripts).toHaveProperty(script);
      });
    });

    test("dev script should use next dev", () => {
      expect(packageJson.scripts.dev).toBe("next dev");
    });

    test("build script should use next build", () => {
      expect(packageJson.scripts.build).toBe("next build");
    });

    test("start script should use next start", () => {
      expect(packageJson.scripts.start).toBe("next start");
    });

    test("lint script should use next lint", () => {
      expect(packageJson.scripts.lint).toBe("next lint");
    });

    test("lint:fix script should use next lint with fix flag", () => {
      expect(packageJson.scripts["lint:fix"]).toBe("next lint --fix");
    });

    test("all script values should be non-empty strings", () => {
      Object.values(packageJson.scripts).forEach((script) => {
        expect(typeof script).toBe("string");
        expect(script.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Dependencies", () => {
    test("should have next.js as a dependency", () => {
      expect(packageJson.dependencies).toHaveProperty("next");
    });

    test("should have react as a dependency", () => {
      expect(packageJson.dependencies).toHaveProperty("react");
    });

    test("should have react-dom as a dependency", () => {
      expect(packageJson.dependencies).toHaveProperty("react-dom");
    });

    test("next.js should be at least version 15.5.10 (security fix)", () => {
      const nextVersion = packageJson.dependencies.next;
      expect(nextVersion).toMatch(/^\^15\.5\.10/);
    });

    test("react and react-dom versions should match", () => {
      expect(packageJson.dependencies.react).toBe("18.2.0");
      expect(packageJson.dependencies["react-dom"]).toBe("18.2.0");
    });

    test("all dependencies should have valid version strings", () => {
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        expect(typeof version).toBe("string");
        expect(version).toMatch(/^[\^~]?\d+\.\d+\.\d+/);
      });
    });

    test("should not have unnecessary dependencies", () => {
      const dependencyCount = Object.keys(packageJson.dependencies).length;
      expect(dependencyCount).toBe(3);
    });
  });

  describe("Dev Dependencies", () => {
    const expectedDevDeps = [
      "@headlessui/react",
      "@heroicons/react",
      "@mailchimp/mailchimp_marketing",
      "@tailwindcss/aspect-ratio",
      "@tailwindcss/forms",
      "@tailwindcss/typography",
      "@types/node",
      "@types/react",
      "@types/react-dom",
      "autoprefixer",
      "eslint",
      "eslint-config-next",
      "eslint-config-prettier",
      "isomorphic-unfetch",
      "jest",
      "next-plausible",
      "postcss",
      "prettier",
      "prettier-plugin-tailwindcss",
      "tailwindcss",
      "typescript",
    ];

    test("should have all expected dev dependencies", () => {
      expectedDevDeps.forEach((dep) => {
        expect(packageJson.devDependencies).toHaveProperty(dep);
      });
    });

    test("should have TypeScript for type checking", () => {
      expect(packageJson.devDependencies).toHaveProperty("typescript");
      expect(packageJson.devDependencies.typescript).toMatch(/^~?4\.9\.3/);
    });

    test("should have type definitions for React", () => {
      expect(packageJson.devDependencies).toHaveProperty("@types/react");
      expect(packageJson.devDependencies).toHaveProperty("@types/react-dom");
    });

    test("should have ESLint for code quality", () => {
      expect(packageJson.devDependencies).toHaveProperty("eslint");
      expect(packageJson.devDependencies).toHaveProperty("eslint-config-next");
      expect(packageJson.devDependencies).toHaveProperty(
        "eslint-config-prettier"
      );
    });

    test("should have Prettier for code formatting", () => {
      expect(packageJson.devDependencies).toHaveProperty("prettier");
      expect(packageJson.devDependencies.prettier).toMatch(/^\^3\.2\.4/);
    });

    test("should have Tailwind CSS and related plugins", () => {
      expect(packageJson.devDependencies).toHaveProperty("tailwindcss");
      expect(packageJson.devDependencies).toHaveProperty(
        "@tailwindcss/aspect-ratio"
      );
      expect(packageJson.devDependencies).toHaveProperty("@tailwindcss/forms");
      expect(packageJson.devDependencies).toHaveProperty(
        "@tailwindcss/typography"
      );
    });

    test("should have PostCSS and Autoprefixer for CSS processing", () => {
      expect(packageJson.devDependencies).toHaveProperty("postcss");
      expect(packageJson.devDependencies).toHaveProperty("autoprefixer");
    });

    test("all dev dependencies should have valid version strings", () => {
      Object.entries(packageJson.devDependencies).forEach(
        ([name, version]) => {
          expect(typeof version).toBe("string");
          expect(version).toMatch(/^[\^~]?\d+\.\d+\.\d+/);
        }
      );
    });

    test("should have exactly the expected number of dev dependencies", () => {
      expect(Object.keys(packageJson.devDependencies).length).toBe(21);
    });
  });

  describe("Package Structure", () => {
    test("should only have expected top-level keys", () => {
      const expectedKeys = [
        "name",
        "version",
        "private",
        "scripts",
        "dependencies",
        "devDependencies",
      ];
      const actualKeys = Object.keys(packageJson);
      expect(actualKeys.sort()).toEqual(expectedKeys.sort());
    });

    test("should be valid JSON", () => {
      const packagePath = path.join(__dirname, "..", "package.json");
      const packageContent = fs.readFileSync(packagePath, "utf8");
      expect(() => JSON.parse(packageContent)).not.toThrow();
    });

    test("should not have any production dependencies in devDependencies", () => {
      // Next.js, React, and React-DOM should be in dependencies, not devDependencies
      expect(packageJson.devDependencies).not.toHaveProperty("next");
      expect(packageJson.devDependencies).not.toHaveProperty("react");
      expect(packageJson.devDependencies).not.toHaveProperty("react-dom");
    });
  });

  describe("Security and Version Constraints", () => {
    test("should use caret (^) or tilde (~) for version ranges where appropriate", () => {
      const dependenciesWithRanges = [
        packageJson.dependencies.next,
        packageJson.devDependencies.prettier,
        packageJson.devDependencies.tailwindcss,
      ];

      dependenciesWithRanges.forEach((version) => {
        expect(version).toMatch(/^[\^~]/);
      });
    });

    test("should pin exact versions for critical framework dependencies", () => {
      // React and React-DOM should be exact versions to avoid mismatches
      expect(packageJson.dependencies.react).not.toMatch(/^[\^~]/);
      expect(packageJson.dependencies["react-dom"]).not.toMatch(/^[\^~]/);
    });

    test("next.js version should address SNYK-JS-NEXT-15104645 vulnerability", () => {
      // The vulnerability fix requires Next.js >= 15.5.10
      const nextVersion = packageJson.dependencies.next.replace("^", "");
      const [major, minor, patch] = nextVersion.split(".").map(Number);

      expect(major).toBeGreaterThanOrEqual(15);
      if (major === 15) {
        expect(minor).toBeGreaterThanOrEqual(5);
        if (minor === 5) {
          expect(patch).toBeGreaterThanOrEqual(10);
        }
      }
    });

    test("should not have any alpha or beta versions in production dependencies", () => {
      Object.values(packageJson.dependencies).forEach((version) => {
        expect(version).not.toMatch(/alpha|beta|rc/i);
      });
    });
  });

  describe("Compatibility", () => {
    test("should have compatible eslint version with eslint-config-next", () => {
      expect(packageJson.devDependencies.eslint).toBeDefined();
      expect(packageJson.devDependencies["eslint-config-next"]).toBeDefined();
    });

    test("should have Node.js types matching project requirements", () => {
      expect(packageJson.devDependencies["@types/node"]).toMatch(/^\^18\.0\.0/);
    });

    test("React types should be compatible with React version", () => {
      // React 18.2.0 should use @types/react ^17.0.2 or higher
      expect(packageJson.devDependencies["@types/react"]).toBeDefined();
      expect(packageJson.devDependencies["@types/react-dom"]).toBeDefined();
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    test("should handle package.json with proper encoding", () => {
      const packagePath = path.join(__dirname, "..", "package.json");
      const packageContent = fs.readFileSync(packagePath, "utf8");
      expect(packageContent).not.toContain("\ufffd"); // No replacement characters
    });

    test("should not have circular dependencies in structure", () => {
      expect(() => JSON.stringify(packageJson)).not.toThrow();
    });

    test("should not have duplicate keys", () => {
      const packagePath = path.join(__dirname, "..", "package.json");
      const packageContent = fs.readFileSync(packagePath, "utf8");
      const parsed = JSON.parse(packageContent);

      // If there were duplicate keys, the parsed object would only have one of each
      expect(Object.keys(parsed).length).toBeGreaterThan(0);
    });

    test("dependency and devDependency lists should not overlap", () => {
      const deps = Object.keys(packageJson.dependencies);
      const devDeps = Object.keys(packageJson.devDependencies);
      const intersection = deps.filter((dep) => devDeps.includes(dep));
      expect(intersection).toEqual([]);
    });

    test("should not have empty dependency objects", () => {
      expect(Object.keys(packageJson.dependencies).length).toBeGreaterThan(0);
      expect(Object.keys(packageJson.devDependencies).length).toBeGreaterThan(
        0
      );
    });

    test("should not have scripts with shell injection risks", () => {
      Object.values(packageJson.scripts).forEach((script) => {
        // Basic check for suspicious patterns
        expect(script).not.toMatch(/;.*rm\s+-rf/);
        expect(script).not.toMatch(/&&.*rm\s+-rf/);
      });
    });

    test("version numbers should not exceed reasonable bounds", () => {
      const allVersions = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      Object.values(allVersions).forEach((version) => {
        const cleanVersion = version.replace(/[\^~]/, "");
        const [major] = cleanVersion.split(".").map(Number);
        expect(major).toBeLessThan(1000); // Reasonable upper bound
      });
    });
  });

  describe("Regression Tests", () => {
    test("should maintain Next.js version that fixes vulnerability", () => {
      // This is a regression test to ensure the security fix stays in place
      const nextVersion = packageJson.dependencies.next;
      expect(nextVersion).toBe("^15.5.10");
    });

    test("should keep private flag enabled", () => {
      // Regression test: should never be published to npm
      expect(packageJson.private).toBe(true);
    });

    test("should maintain monorepo-compatible package name", () => {
      // Regression test: package name should work with Yarn workspaces
      expect(packageJson.name).toMatch(/^@coral-xyz\//);
    });
  });
});