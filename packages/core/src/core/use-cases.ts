import type {
  GenerateTypesUseCase as IGenerateTypesUseCase,
  OpenAPIParser,
  FrameworkTypeBuilderFactory,
  CodeGeneratorFactory
} from '../core/interfaces';
import { TypeScriptWriter } from '../core/typescript-writer';

export class GenerateTypesUseCase implements IGenerateTypesUseCase {
  constructor(
    private parser: OpenAPIParser,
    private typeBuilderFactory: FrameworkTypeBuilderFactory,
    private codeGeneratorFactory: CodeGeneratorFactory
  ) { }

  async execute(schemaContent: string): Promise<string> {
    const apiModel = await this.parser.parse(schemaContent);

    const writer = new TypeScriptWriter();
    const typeBuilder = this.typeBuilderFactory.create(writer);
    const codeGenerator = this.codeGeneratorFactory.create(typeBuilder);

    return codeGenerator.generate(apiModel);
  }
}
