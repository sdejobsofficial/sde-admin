import { camelCase, pascalCase, snakeCase } from "case-anything";

function convertKeys(obj: any, converter: (str: string) => string): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeys(item, converter));
  }
  const converted: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = converter(key);
      converted[newKey] = convertKeys(obj[key], converter);
    }
  }
  return converted;
}

export function convertToPascalCase<T>(obj: any): T {
  return convertKeys(obj, pascalCase) as T;
}

export function convertToCamelCase<T>(obj: any): T {
  return convertKeys(obj, camelCase) as T;
}

export function convertToSnakeCase<T>(obj: any): T {
  return convertKeys(obj, snakeCase) as T;
}
