import { ElysiaCodeGeneratorFactory, ElysiaTypeBuilderFactory, GenerateTypesUseCase, HonoCodeGeneratorFactory, HonoTypeBuilderFactory, OpenAPIParser, ModelsGenerator } from "./core";

export type FrameworkType = 'hono' | 'elysia';

export async function generate(sourceName: string, schema: string, framework: FrameworkType) {
  const parser = new OpenAPIParser();
  const { typeBuilderFactory, codeGeneratorFactory } = getFactories(sourceName, framework);
  const useCase = new GenerateTypesUseCase(
    parser,
    typeBuilderFactory,
    codeGeneratorFactory
  );

  return useCase.execute(schema);
}

export async function generateModels(schema: string) {
  const parser = new OpenAPIParser();
  const apiModel = await parser.parse(schema);
  const models = new ModelsGenerator();
  return models.generate(apiModel);
}

function getFactories(sourceName: string, framework: FrameworkType) {
  switch (framework) {
    case 'hono':
      return {
        typeBuilderFactory: new HonoTypeBuilderFactory(),
        codeGeneratorFactory: new HonoCodeGeneratorFactory(sourceName)
      };
    case 'elysia':
      return {
        typeBuilderFactory: new ElysiaTypeBuilderFactory(),
        codeGeneratorFactory: new ElysiaCodeGeneratorFactory(sourceName)
      };
    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }
}
