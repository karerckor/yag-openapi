import { Project } from 'ts-morph';
import type { APIModel } from './interfaces';
import { TypeScriptWriter } from './typescript-writer';

// Generates exported type aliases for every component schema in the OpenAPI document
export class ModelsGenerator {
  private writer = new TypeScriptWriter();

  generate(api: APIModel): string {
    const project = new Project();
    const sourceFile = project.createSourceFile('models.generated.ts', '', { overwrite: true });

    const schemas = api.schemas || {};

    for (const [name, schema] of Object.entries(schemas)) {
      const typeString = this.writer.schemaToTypeString(schema);
      // Use a type alias for maximum compatibility with unions/allOf/anyOf/oneOf
      sourceFile.addTypeAlias({
        name,
        type: typeString,
        isExported: true
      });
    }

    return sourceFile.getFullText();
  }
}
