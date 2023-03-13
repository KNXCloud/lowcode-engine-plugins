import type { Program, ObjectExpression } from '@babel/types';
import MagicString from 'magic-string';
import { parse } from 'acorn';

interface ImportStatement {
  type: 'import';
  from: string;
  name: string;
  importedName: string | null;
}

interface NormalStatement {
  type: 'expression';
  code: string;
}

type UsageStatement = ImportStatement | NormalStatement;

const initModuleTemp = `
(() => {const $id = @{id}; return ($cached, $scope = window) => {
  if ($id in $cached) return $cached[$id];
  const exports = $cached[$id] = {};
  @{expressions}
  return exports;
}})()
`.trim();

export function parseCode(id: string, code: string, libraryMap: Record<string, string>) {
  const s = new MagicString(code);
  const program = parse(code, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  }) as Program;

  let name = '';
  const data = {};
  const methods = {};
  const lifeCycles = {};

  const statements: UsageStatement[] = [];
  const globalVars = new Set<string>();

  let compNode: ObjectExpression | null = null;
  if (program.type === 'Program') {
    for (const node of program.body) {
      if (node.type === 'ImportDeclaration') {
        const from = node.source.value;
        node.specifiers.forEach((item) => {
          if (item.type === 'ImportSpecifier') {
            const statement: ImportStatement = {
              type: 'import',
              from,
              importedName:
                item.imported.type === 'Identifier'
                  ? item.imported.name
                  : item.imported.value,
              name: item.local.name,
            };
            globalVars.add(statement.name);
            statements.push(statement);
          } else if (item.type === 'ImportDefaultSpecifier') {
            const statement: ImportStatement = {
              type: 'import',
              from,
              importedName: 'default',
              name: item.local.name,
            };
            globalVars.add(statement.name);
            statements.push(statement);
          } else {
            const statement: ImportStatement = {
              type: 'import',
              from,
              importedName: null,
              name: item.local.name,
            };
            globalVars.add(statement.name);
            statements.push(statement);
          }
        });
        continue;
      } else if (node.type === 'ExportDefaultDeclaration') {
        const declaration = node.declaration;
        if (
          declaration.type === 'CallExpression' &&
          declaration.callee.type === 'Identifier' &&
          declaration.callee.name === 'defineComponent' &&
          declaration.arguments.length > 0 &&
          declaration.arguments[0].type === 'ObjectExpression'
        ) {
          compNode = declaration.arguments[0];
        } else if (declaration.type === 'ObjectExpression') {
          compNode = declaration;
        }
        continue;
      } else if (
        node.type === 'ExportAllDeclaration' ||
        node.type === 'ExportNamedDeclaration'
      ) {
        // ignore export * from 'xxx' & export const xxx & export { xxx }
        continue;
      } else if (node.type === 'VariableDeclaration') {
        node.declarations.forEach((d) => {
          if (d.id.type === 'Identifier') {
            globalVars.add(d.id.name);
          }
        });
      } else if (node.type === 'FunctionDeclaration') {
        if (node.id?.name) {
          globalVars.add(node.id.name);
        }
      }
      statements.push({
        type: 'expression',
        code: s.slice(node.start!, node.end!),
      });
    }
  }

  // 初始化 module
  if (
    (globalVars.size > 1 && globalVars.has('defineComponent')) ||
    (globalVars.size > 0 && !globalVars.has('defineComponent'))
  ) {
    const code: string[] = [];
    const imports: Record<string, [string | null, string][]> = {};
    statements.forEach((stat) => {
      if (stat.type === 'import') {
        const library = libraryMap[stat.from] ?? stat.from;
        const record = imports[library] || (imports[library] = []);
        record.push([stat.importedName, stat.name]);
      } else {
        code.push(new MagicString(stat.code).indent('  ').toString());
      }
    });
    const importCodes = Object.keys(imports).map((name) => {
      const items: string[] = [];
      for (const [importName, exportName] of imports[name]) {
        if (importName == null) {
          return `const ${exportName} = $scope["${name}"]`;
        } else if (importName === exportName) {
          items.push(importName);
        } else {
          items.push(`${importName}: exportName`);
        }
      }
      return `const {${items.join(',')}} = $scope["${name}"];`;
    });
    code.unshift(...importCodes);
    globalVars.forEach((varName) => {
      code.push(`  exports.${varName} = ${varName};`);
    });
    lifeCycles['initModule'] = {
      type: 'JSExpression',
      value: initModuleTemp
        .replace('@{id}', JSON.stringify(id))
        .replace('@{expressions}', code.join('\n')),
    };
  }

  function getPropName(propKey: any) {
    if (propKey.type === 'Identifier') {
      return propKey.name;
    } else {
      return propKey.value;
    }
  }

  // 处理组件内容
  if (compNode != null) {
    for (const property of compNode.properties as any[]) {
      if (property.computed || property.shorthand) {
        continue;
      }

      const { method, value } = property;

      switch (property.key.name) {
        case 'data': {
          let dataProperies: any[] | null = null;
          if (!method && value.type === 'ArrowFunctionExpression') {
            if (value.body.type === 'ObjectExpression') {
              dataProperies = value.body.properties;
            }
          } else if (method && value.type === 'FunctionExpression') {
            if (
              value.body.body.length === 1 &&
              value.body.body[0].type === 'ReturnStatement' &&
              value.body.body[0].argument.type === 'ObjectExpression'
            ) {
              dataProperies = value.body.body[0].argument.properties;
            } else {
            }
          }
          if (dataProperies) {
            dataProperies.forEach((item) => {
              if (item.value.type === 'Literal' && !item.value.regex) {
                data[getPropName(item.key)] = item.value.value;
              } else if (item.value.type === 'FunctionExpression') {
                data[getPropName(item.key)] = {
                  type: 'JSFunction',
                  value: `function ${s.slice(item.value.start, item.value.end)}`,
                };
              } else {
                data[getPropName(item.key)] = {
                  type: 'JSExpresssion',
                  value: `${s.slice(item.value.start, item.value.end)}`,
                };
              }
            });
          } else if (method) {
            lifeCycles['initData'] = {
              type: 'JSFunction',
              value: `function ${s.slice(value.start, value.end)}`,
            };
          } else if (value.type === 'ArrowFunctionExpression') {
            lifeCycles['initData'] = {
              type: 'JSExpresssion',
              value: `${s.slice(value.start, value.end)}`,
            };
          }
          break;
        }
        case 'props': {
          if (value.type === 'ArrayExpression' || value.type === 'ObjectExpression') {
            lifeCycles['initProps'] = {
              type: 'JSExpression',
              value: s.slice(value.start, value.end),
            };
          }
          break;
        }
        case 'methods': {
          if (value.type === 'ObjectExpression') {
            for (const methdProp of value.properties) {
              if (methdProp.method && methdProp.value.type === 'FunctionExpression') {
                methods[getPropName(methdProp.key)] = {
                  type: 'JSFunction',
                  value: `function ${s.slice(
                    methdProp.value.start,
                    methdProp.value.end
                  )}`,
                };
              } else if (
                !methdProp.method &&
                methdProp.value.type === 'ArrowFunctionExpression'
              ) {
                methods[getPropName(methdProp.key)] = {
                  type: 'JSExpression',
                  value: `${s.slice(methdProp.value.start, methdProp.value.end)}`,
                };
              }
            }
          }
          break;
        }
        case 'watch': {
          const initWatch: Record<string, unknown> = {};
          if (value.type === 'ObjectExpression') {
            for (const watchProp of value.properties) {
              if (watchProp.value.type === 'FunctionExpression') {
                initWatch[getPropName(watchProp.key)] = {
                  type: 'JSFunction',
                  value: `function ${s.slice(
                    watchProp.value.start,
                    watchProp.value.end
                  )}`,
                };
              } else if (watchProp.value.type === 'ArrowFunctionExpression') {
                initWatch[getPropName(watchProp.key)] = {
                  type: 'JSExpression',
                  value: `${s.slice(watchProp.value.start, watchProp.value.end)}`,
                };
              } else if (watchProp.value.type === 'ArrayExpression') {
                const watchElements: unknown[] = [];
                for (const element of watchProp.value.elements) {
                  if (element.type === 'ObjectExpression') {
                    const watchProps: Record<string, unknown> = {};
                    for (const watchProp of element.properties) {
                      if (watchProp.value.type === 'Literal') {
                        watchProps[getPropName(watchProp.key)] = watchProp.value.value;
                      } else if (watchProp.value.type === 'ArrowFunctionExpression') {
                        watchProps[getPropName(watchProp.key)] = {
                          type: 'JSExpression',
                          value: s.slice(watchProp.value.start, watchProp.value.end),
                        };
                      } else if (watchProp.value.type === 'FunctionExpression') {
                        watchProps[getPropName(watchProp.key)] = {
                          type: 'JSFunction',
                          value: `function ${s.slice(
                            watchProp.value.start,
                            watchProp.value.end
                          )}`,
                        };
                      }
                    }
                    watchElements.push(watchProps);
                  } else if (element.type === 'FunctionExpression') {
                    watchElements.push({
                      type: 'JSFunction',
                      value: `${s.slice(element.start, element.end)}`,
                    });
                  } else if (element.type === 'ArrowFunctionExpression') {
                    watchElements.push({
                      type: 'JSExpression',
                      value: `${s.slice(element.start, element.end)}`,
                    });
                  }
                }
                if (watchElements.length > 0) {
                  initWatch[getPropName(watchProp.key)] = watchElements;
                }
              } else if (watchProp.value.type === 'ObjectExpression') {
                const watchProps: Record<string, unknown> = {};
                for (const watchOption of watchProp.value.properties) {
                  if (watchOption.value.type === 'Literal') {
                    watchProps[getPropName(watchOption.key)] = watchOption.value.value;
                  } else if (watchOption.value.type === 'ArrowFunctionExpression') {
                    watchProps[getPropName(watchOption.key)] = {
                      type: 'JSExpression',
                      value: s.slice(watchOption.value.start, watchOption.value.end),
                    };
                  } else if (watchOption.value.type === 'FunctionExpression') {
                    watchProps[getPropName(watchOption.key)] = {
                      type: 'JSFunction',
                      value: `function ${s.slice(
                        watchOption.value.start,
                        watchOption.value.end
                      )}`,
                    };
                  }
                }
                initWatch[getPropName(watchProp.key)] = watchProps;
              } else if (watchProp.value.type === 'Literal') {
                initWatch[getPropName(watchProp.key)] = watchProp.value.value;
              }
            }
          }
          if (Object.keys(initWatch).length > 0) {
            lifeCycles['initWatch'] = initWatch;
          }
          break;
        }
        case 'computed': {
          const initComputed: Record<string, unknown> = {};
          if (value.type === 'ObjectExpression') {
            for (const prop of value.properties) {
              if (prop.value.type === 'FunctionExpression') {
                initComputed[getPropName(prop.key)] = {
                  type: 'JSFunction',
                  value: `function ${s.slice(prop.value.start, prop.value.end)}`,
                };
              } else if (prop.value.type === 'ArrowFunctionExpression') {
                initComputed[getPropName(prop.key)] = {
                  type: 'JSExpression',
                  value: `${s.slice(prop.value.start, prop.value.end)}`,
                };
              } else if (prop.value.type === 'ObjectExpression') {
                const computedProps: Record<string, unknown> = {};
                for (const computedProp of prop.value.properties) {
                  if (computedProp.value.type === 'ArrowFunctionExpression') {
                    computedProps[getPropName(computedProp.key)] = {
                      type: 'JSExpression',
                      value: s.slice(computedProp.value.start, computedProp.value.end),
                    };
                  } else if (computedProp.value.type === 'FunctionExpression') {
                    computedProps[getPropName(computedProp.key)] = {
                      type: 'JSFunction',
                      value: `function ${s.slice(
                        computedProp.value.start,
                        computedProp.value.end
                      )}`,
                    };
                  }
                }
                initComputed[getPropName(prop.key)] = computedProps;
              }
            }
          }
          if (Object.keys(initComputed).length > 0) {
            lifeCycles['initComputed'] = initComputed;
          }
          break;
        }
        default:
          if (value.type === 'FunctionExpression') {
            lifeCycles[getPropName(property.key)] = {
              type: 'JSFunction',
              value: `function ${s.slice(value.start, value.end)}`,
            };
          } else if (value.type === 'FunctionExpression') {
            lifeCycles[getPropName(property.key)] = {
              type: 'JSExpression',
              value: s.slice(value.start, value.end),
            };
          } else if (property.key.name === 'name' && value.type === 'Literal') {
            name = value.value;
          }
      }
    }
  }

  return { name, data, methods, lifeCycles };
}
