import { Project } from 'ts-morph';
import type { 
  CodeGenerator as ICodeGenerator,
  FrameworkTypeBuilder,
  APIModel
} from '../core/interfaces';

export interface ImportDeclaration {
  moduleSpecifier: string;
  namedImports?: Array<{ name: string; isTypeOnly?: boolean }>;
  defaultImport?: string;
  isTypeOnly?: boolean;
}

export class CodeGenerator implements ICodeGenerator {
  constructor(
    private sourceName: string,
    private typeBuilder: FrameworkTypeBuilder,
    private imports: ImportDeclaration[] = []
  ) {}

  generate(api: APIModel): string {
    const project = new Project();
    const sourceFile = project.createSourceFile('generated.ts', '', { overwrite: true });

    for (const importDecl of this.imports) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: importDecl.moduleSpecifier,
        namedImports: importDecl.namedImports,
        defaultImport: importDecl.defaultImport,
        isTypeOnly: importDecl.isTypeOnly
      });
    }

    const appTypeWriter = this.typeBuilder.buildAppType(api);

    sourceFile.addTypeAlias({
      name: this.sourceName,
      type: appTypeWriter,
      isExported: true
    });

    return sourceFile.getFullText();
  }
}
