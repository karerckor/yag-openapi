import { 
  type FrameworkTypeBuilderFactory,
  type FrameworkTypeBuilder,
  type TypeScriptWriter,
  type CodeGenerator as ICodeGenerator,
  AbstractCodeGeneratorFactory
} from '../core/interfaces';
import { CodeGenerator, type ImportDeclaration } from '../core/code-generator';
import { HonoTypeBuilder } from '../frameworks/hono-type-builder';
import { ElysiaTypeBuilder } from '../frameworks/elysia-type-builder';

export class HonoTypeBuilderFactory implements FrameworkTypeBuilderFactory {
  create(writer: TypeScriptWriter): FrameworkTypeBuilder {
    return new HonoTypeBuilder(writer);
  }
}

export class ElysiaTypeBuilderFactory implements FrameworkTypeBuilderFactory {
  create(writer: TypeScriptWriter): FrameworkTypeBuilder {
    return new ElysiaTypeBuilder(writer);
  }
}

export class HonoCodeGeneratorFactory extends AbstractCodeGeneratorFactory {
  create(typeBuilder: FrameworkTypeBuilder): ICodeGenerator {
    const imports: ImportDeclaration[] = [
      {
        moduleSpecifier: 'hono',
        namedImports: [{ name: 'Hono', isTypeOnly: true }]
      },
      {
        moduleSpecifier: 'hono/types',
        namedImports: [{ name: 'BlankEnv', isTypeOnly: true }]
      },
      {
        moduleSpecifier: 'hono/utils/http-status',
        namedImports: [{ name: 'ContentfulStatusCode', isTypeOnly: true }]
      }
    ];

    return new CodeGenerator(this.sourceName, typeBuilder, imports);
  }
}

export class ElysiaCodeGeneratorFactory extends AbstractCodeGeneratorFactory {
  create(typeBuilder: FrameworkTypeBuilder): ICodeGenerator {
    const imports: ImportDeclaration[] = [
      {
        moduleSpecifier: 'elysia',
        namedImports: [
          { name: 'DefinitionBase', isTypeOnly: true },
          { name: 'Elysia', isTypeOnly: true },
          { name: 'MetadataBase', isTypeOnly: true },
          { name: 'SingletonBase', isTypeOnly: true }
        ]
      }
    ];

    return new CodeGenerator(this.sourceName, typeBuilder, imports);
  }
}
