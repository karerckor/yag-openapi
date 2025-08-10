import { join } from 'path';
import { Plugin } from "vite";
import { writeFile, mkdir } from 'fs/promises';

import * as core from "@yag-openapi/core";

import { SchemaMap, Source } from "./source.js";

type Framework = 'hono' | 'elysia';

async function generateTypesForVirtualModule(
  virtualModuleId: string,
  framework: Framework,
  currentSchemasContent: Record<string, string>
) {
  let combined = '';

  for (const [name, schema] of Object.entries(currentSchemasContent)) {
    try {
  const typeCode = await core.generate(name, schema, framework);
      combined += typeCode + '\n';
    } catch (err) {
      console.error(`Error generating types for ${name}:`, err);
    }
  }

  if (combined) {
    const declarationContent = `declare module '${virtualModuleId}' {
${combined}
}`;
    return declarationContent;
  }

  return `declare module '${virtualModuleId}' {
  // No schemas loaded yet
}`;
}

class SchemaSubscriber {
  private abort = new AbortController();
  private unsubscribe: (() => void) | null = null;

  constructor(private name: string, private source: Source, private onUpdate: (schema: string) => void) { }

  start() {
    try {
      this.unsubscribe = this.source(this.onUpdate, this.abort);
    } catch (error) {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`[yag-openapi] Failed to start source "${this.name}".\n  • Reason: ${msg}\n  • Tips: For file sources, verify the file path exists. For remote sources, verify the URL and network access.`);
      this.unsubscribe = null;
    }
  }

  stop() {
    this.abort.abort();
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

class SchemaManager {
  private subscribers = new Map<string, SchemaSubscriber>();
  private schemas = new Map<string, string>();
  private onChangeCallbacks = new Set<() => void>();

  constructor(private schemaMap: SchemaMap) { }

  startAll() {
    for (const [name, source] of Object.entries(this.schemaMap)) {
      if (this.subscribers.has(name)) continue;

      try {
        const subscriber = new SchemaSubscriber(name, source, (schema) => {
          this.schemas.set(name, schema);
          this.notifyChange();
        });
        subscriber.start();
        this.subscribers.set(name, subscriber);
      } catch (error) {
        console.error(`Failed to start subscriber for ${name}:`, error);
      }
    }
  }

  stopAll() {
    for (const subscriber of this.subscribers.values()) {
      subscriber.stop();
    }
    this.subscribers.clear();
  }

  getSchemas() {
    return Object.fromEntries(this.schemas);
  }

  onChange(cb: () => void) {
    this.onChangeCallbacks.add(cb);
    return () => this.onChangeCallbacks.delete(cb);
  }

  private notifyChange() {
    for (const cb of this.onChangeCallbacks) {
      cb();
    }
  }
}

export { file, remote } from './source.js'

export default function yagOpenApiPlugin(schemaMap: SchemaMap): Plugin {
  const generate = core.generate;
  const generateModelsFn: undefined | ((schema: string) => Promise<string>) = (core as any).generateModels;
  const VIRTUAL_MODULES = {
    hono: '@yag-openapi/client/hono',
    elysia: '@yag-openapi/client/elysia',
  models: '@yag-openapi/client',
  };

  const schemaManager = new SchemaManager(schemaMap);
  let projectRoot = '';

  const generateDeclarationFiles = async () => {
    if (!projectRoot) return;

    try {
      const nodeModulesTypesDir = join(projectRoot, 'node_modules', '@types', 'yag-openapi');
      await mkdir(nodeModulesTypesDir, { recursive: true });

      const packageJson = {
        name: '@types/yag-openapi',
        version: '1.0.0',
        description: 'TypeScript definitions for @yag-openapi/client',
        types: 'index.d.ts',
        typesPublisherContentHash: '0000000000000000000000000000000000000000'
      };
      await writeFile(join(nodeModulesTypesDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  let allDeclarations = '';

      const schemas = schemaManager.getSchemas();

      const elysiaTypes = await generateTypesForVirtualModule(VIRTUAL_MODULES.elysia, 'elysia', schemas);
      allDeclarations += elysiaTypes + '\n\n';

      const honoTypes = await generateTypesForVirtualModule(VIRTUAL_MODULES.hono, 'hono', schemas);
      allDeclarations += honoTypes + '\n\n';

      // Generate models package types grouped by source in exported namespaces to avoid collisions
      // Generate models module only if core provides generateModels
      if (generateModelsFn) {
        const toValidTSIdentifier = (name: string) => {
          // Replace non-alphanumeric with underscore and ensure it doesn't start with a digit
          const cleaned = name.replace(/[^A-Za-z0-9_]/g, '_');
          return cleaned.match(/^[A-Za-z_]/) ? cleaned : `_${cleaned}`;
        };

        const indent = (str: string, spaces = 2) => str
          .split('\n')
          .map(line => (line.length ? ' '.repeat(spaces) + line : line))
          .join('\n');

        let namespaces: string[] = [];
        for (const [sourceName, schema] of Object.entries(schemas)) {
          try {
            const models = await generateModelsFn(schema);
            const nsName = toValidTSIdentifier(sourceName);
            const nsBlock = `export namespace ${nsName} {\n${indent(models.trim(), 2)}\n}`;
            namespaces.push(nsBlock);
          } catch (err) {
            console.error('Error generating models:', err);
          }
        }

        const modelsDeclaration = namespaces.length
          ? `declare module '${VIRTUAL_MODULES.models}' {\n${namespaces.map(n => indent(n, 2)).join('\n\n')}\n}`
          : `declare module '${VIRTUAL_MODULES.models}' {\n  // No schemas loaded yet\n}`;

        allDeclarations += modelsDeclaration + '\n\n';
      }

      await writeFile(join(nodeModulesTypesDir, 'index.d.ts'), allDeclarations);
    } catch (error) {
      console.warn('Could not generate declaration files:', error);
    }
  };

  return {
    name: 'yag-openapi',

    configResolved(config) {
      projectRoot = config.root;
    },

    buildStart() {
      schemaManager.startAll();

      let timeout: NodeJS.Timeout | null = null;
      const onChange = () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          generateDeclarationFiles().catch(console.error);
        }, 100);
      };

      schemaManager.onChange(onChange);

      generateDeclarationFiles().catch(console.error);
    },

    buildEnd() {
      schemaManager.stopAll();
    },

    resolveId(id) {
      if (Object.values(VIRTUAL_MODULES).includes(id)) {
        return id;
      }
      return null;
    },

    async load(id) {
      if (id === VIRTUAL_MODULES.hono || id === VIRTUAL_MODULES.elysia || id === VIRTUAL_MODULES.models) {
        return `// Virtual module provided by @yag-openapi/vite-plugin\nexport {};`;
      }
      return null;
    }
  };
}
