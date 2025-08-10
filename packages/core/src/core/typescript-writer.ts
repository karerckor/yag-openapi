import type { WriterFunction } from 'ts-morph';
import type { TypeScriptWriter as ITypeScriptWriter } from './interfaces';

export class TypeScriptWriter implements ITypeScriptWriter {
  createObjectType(properties: Record<string, WriterFunction | string>): WriterFunction {
    return (writer) => {
      writer.write('{');
      writer.newLine();
      
      const entries = Object.entries(properties);
      entries.forEach(([key, value], index) => {
        writer.indent(() => {
          writer.write(`${key}: `);
          if (typeof value === 'string') {
            writer.write(value);
          } else {
            value(writer);
          }
          if (index < entries.length - 1) {
            writer.write(';');
          }
          writer.newLine();
        });
      });
      
      writer.write('}');
    };
  }

  createGenericType(typeName: string, typeParameters: (string | WriterFunction)[]): WriterFunction {
    return (writer) => {
      writer.write(`${typeName}<`);
      typeParameters.forEach((param, index) => {
        if (index > 0) writer.write(', ');
        if (typeof param === 'string') {
          writer.write(param);
        } else {
          param(writer);
        }
      });
      writer.write('>');
    };
  }

  createUnionType(types: (string | WriterFunction)[]): WriterFunction {
    return (writer) => {
      types.forEach((type, index) => {
        if (index > 0) writer.write(' | ');
        if (typeof type === 'string') {
          writer.write(type);
        } else {
          type(writer);
        }
      });
    };
  }

  createIntersectionType(types: (string | WriterFunction)[]): WriterFunction {
    return (writer) => {
      types.forEach((type, index) => {
        if (index > 0) writer.write(' & ');
        if (typeof type === 'string') {
          writer.write(type);
        } else {
          type(writer);
        }
      });
    };
  }

  schemaToTypeString(schema: any): string {
    if (!schema) return 'unknown';

    if (schema.$ref) {
      return schema.$ref.split('/').pop() || 'unknown';
    }

    if (schema.oneOf) {
      return schema.oneOf.map((s: any) => this.schemaToTypeString(s)).join(' | ');
    }

    if (schema.anyOf) {
      return schema.anyOf.map((s: any) => this.schemaToTypeString(s)).join(' | ');
    }

    if (schema.allOf) {
      return schema.allOf.map((s: any) => this.schemaToTypeString(s)).join(' & ');
    }
    
    if (schema.type === 'object' && schema.properties) {
      const props = Object.entries(schema.properties).map(([key, val]: [string, any]) => {
        const optional = schema.required?.includes(key) ? '' : '?';
        return `${key}${optional}: ${this.schemaToTypeString(val)};`;
      });
      return `{ ${props.join(' ')} }`;
    }
    
    if (schema.type === 'array' && schema.items) {
      return `${this.schemaToTypeString(schema.items)}[]`;
    }
    
    if (schema.enum) {
      return schema.enum.map((v: string) => JSON.stringify(v)).join(' | ');
    }
    
    switch (schema.type) {
      case 'string': return 'string';
      case 'integer':
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'null': return 'null';
      default: return 'any';
    }
  }
}
