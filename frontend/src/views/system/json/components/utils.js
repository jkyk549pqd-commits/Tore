/**
 * 生成随机JSON数据
 * @description 生成复杂的随机JSON数据，支持嵌套对象、数组、多种数据类型，并可配置复杂度
 * @param {Object} options - 配置选项
 * @param {number} options.maxDepth - 最大嵌套深度（默认：3）
 * @param {number} options.minFields - 最小字段数量（默认：5）
 * @param {number} options.maxFields - 最大字段数量（默认：15）
 * @param {number} options.minArrayLength - 数组最小长度（默认：1）
 * @param {number} options.maxArrayLength - 数组最大长度（默认：5）
 * @param {boolean} options.includeNull - 是否包含null值（默认：true）
 * @param {boolean} options.includeDate - 是否包含日期（默认：true）
 * @returns {string} JSON字符串
 */
import { fakerZH_CN as faker, faker as fakerEN } from "@faker-js/faker";

export const GenRandomJson = (options = {}) => {
  const {
    maxDepth = 3,
    minFields = 3,
    maxFields = 4,
    minArrayLength = 3,
    maxArrayLength = 4,
    includeNull = true,
    includeDate = true,
  } = options;

  // 数据类型生成器集合
  const valueGenerators = {
    // 字符串类型
    string: () => {
      const stringTypes = [
        () => faker.person.fullName(),
        () => faker.internet.email(),
        () => faker.phone.number(),
        () => faker.internet.url(),
        () => faker.company.name(),
        () => faker.location.city(),
        () => faker.location.streetAddress(),
        () => faker.lorem.sentence(),
        () => faker.lorem.paragraph(),
        () => faker.color.human(),
        () => faker.vehicle.vehicle(),
        () => faker.commerce.productName(),
        () => faker.hacker.abbreviation(),
      ];
      return stringTypes[Math.floor(Math.random() * stringTypes.length)]();
    },

    // 数字类型
    number: () => {
      const numberTypes = [
        () => faker.number.int({ min: 0, max: 1000 }),
        () => faker.number.float({ min: 0, max: 100, precision: 0.01 }),
        () => faker.number.int({ min: -100, max: 100 }),
        () => faker.number.int({ min: 10000, max: 99999 }),
      ];
      return numberTypes[Math.floor(Math.random() * numberTypes.length)]();
    },

    // 布尔类型
    boolean: () => faker.datatype.boolean(),

    // null值
    null: () => null,

    // 日期类型
    date: () => faker.date.recent().toISOString(),

    // 生成随机键名（确保为英文）
    keyName: () => {
      const prefixes = ["user", "data", "item", "record", "entity", "info", "details", "meta", "app", "system", "content", "config"];
      const suffixes = ["Id", "Name", "Value", "Type", "Status", "Code", "Data", "Info", "Config", "Settings", "Count", "List", "Map", "Set"];
      const nouns = ["account", "profile", "order", "product", "invoice", "report", "message", "notification", "session", "request", "response", "transaction", "operation", "resource", "element"];
      const verbs = ["create", "update", "delete", "read", "process", "handle", "manage", "execute"];
      
      const keyTypes = [
        () => fakerEN.database.column(),
        () => fakerEN.hacker.noun(),
        () => fakerEN.hacker.verb(),
        () => fakerEN.hacker.adjective(),
        () => fakerEN.hacker.ingverb(),
        () => fakerEN.hacker.abbreviation(),
        () => `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`,
        () => `${nouns[Math.floor(Math.random() * nouns.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`,
        () => `${verbs[Math.floor(Math.random() * verbs.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`,
        () => `${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 100)}`,
        () => `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${nouns[Math.floor(Math.random() * nouns.length)]}`,
        () => `${verbs[Math.floor(Math.random() * verbs.length)]}_${nouns[Math.floor(Math.random() * nouns.length)]}`,
      ];
      
      return keyTypes[Math.floor(Math.random() * keyTypes.length)]();
    },
  };

  // 生成数组
  const generateArray = (depth) => {
    const arrayLength = faker.number.int({ min: minArrayLength, max: maxArrayLength });
    const array = [];
    
    for (let i = 0; i < arrayLength; i++) {
      const valueTypes = ['string', 'number', 'boolean', 'null'];
      
      if (includeDate) {
        valueTypes.push('date');
      }
      
      if (depth < maxDepth) {
        valueTypes.push('object');
        valueTypes.push('array');
      }
      
      const valueType = valueTypes[Math.floor(Math.random() * valueTypes.length)];
      array.push(generateValue(valueType, depth));
    }
    
    return array;
  };

  // 生成嵌套对象
  const generateObject = (depth) => {
    const obj = {};
    const numFields = faker.number.int({ min: minFields, max: maxFields });
    
    for (let i = 0; i < numFields; i++) {
      const key = valueGenerators.keyName();
      const valueTypes = ['string', 'number', 'boolean'];
      
      if (includeNull) {
        valueTypes.push('null');
      }
      
      if (includeDate) {
        valueTypes.push('date');
      }
      
      if (depth < maxDepth) {
        valueTypes.push('object');
        valueTypes.push('array');
      }
      
      const valueType = valueTypes[Math.floor(Math.random() * valueTypes.length)];
      obj[key] = generateValue(valueType, depth);
    }
    
    return obj;
  };

  // 生成值
  const generateValue = (type, depth) => {
    switch (type) {
      case 'string':
        return valueGenerators.string();
      case 'number':
        return valueGenerators.number();
      case 'boolean':
        return valueGenerators.boolean();
      case 'null':
        return valueGenerators.null();
      case 'date':
        return valueGenerators.date();
      case 'object':
        return generateObject(depth + 1);
      case 'array':
        return generateArray(depth + 1);
      default:
        return valueGenerators.string();
    }
  };

  // 生成复杂对象数组结构
  const generateComplexStructure = () => {
    const structureTypes = [
      // 单个复杂对象
      () => generateObject(0),
      
      // 对象数组
      () => {
        const arrayLength = faker.number.int({ min: 2, max: 4 });
        return Array.from({ length: arrayLength }, () => generateObject(1));
      },
      
      // 包含元数据的结构
      () => ({
        metadata: {
          timestamp: faker.date.recent().toISOString(),
          version: faker.system.semver(),
          requestId: faker.string.uuid(),
          environment: faker.helpers.arrayElement(['development', 'staging', 'production']),
        },
        data: generateObject(1),
        status: {
          code: faker.number.int({ min: 200, max: 500 }),
          message: faker.hacker.phrase(),
        },
      }),
      
      // 分页结构
      () => ({
        items: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => generateObject(1)),
        pagination: {
          page: faker.number.int({ min: 1, max: 10 }),
          pageSize: faker.number.int({ min: 10, max: 50 }),
          total: faker.number.int({ min: 100, max: 1000 }),
          totalPages: faker.number.int({ min: 10, max: 20 }),
        },
        filters: {
          search: fakerEN.lorem.word(),
          sortBy: fakerEN.database.column(),
          sortOrder: faker.helpers.arrayElement(['asc', 'desc']),
        },
      }),
      
      // 树形结构
      () => {
        const generateTreeNode = (currentDepth) => {
          const node = {
            id: faker.string.uuid(),
            name: faker.commerce.productName(),
            value: faker.number.int({ min: 1, max: 100 }),
            enabled: faker.datatype.boolean(),
          };
          
          if (currentDepth < maxDepth) {
            const childCount = faker.number.int({ min: 0, max: 3 });
            if (childCount > 0) {
              node.children = Array.from({ length: childCount }, () => generateTreeNode(currentDepth + 1));
            }
          }
          
          return node;
        };
        
        return {
          tree: generateTreeNode(0),
          metadata: {
            totalNodes: faker.number.int({ min: 5, max: 50 }),
            maxDepth: maxDepth,
          },
        };
      },
      
      // 嵌套配置结构
      () => ({
        config: {
          app: {
            name: faker.company.name(),
            version: faker.system.semver(),
            environment: faker.helpers.arrayElement(['dev', 'test', 'prod']),
          },
          database: {
            host: faker.internet.ip(),
            port: faker.number.int({ min: 3000, max: 9000 }),
            name: faker.database.column(),
            credentials: {
              username: faker.internet.username(),
              password: faker.internet.password({ length: 20, memorable: false }),
            },
          },
          features: {
            authentication: faker.datatype.boolean(),
            logging: faker.datatype.boolean(),
            cache: faker.datatype.boolean(),
            rateLimiting: faker.datatype.boolean(),
          },
          settings: Array.from({ length: 3 }, () => ({
            key: fakerEN.database.column(),
            value: faker.helpers.arrayElement([fakerEN.database.column(), faker.number.int({ min: 0, max: 100 }), true]),
            description: faker.lorem.sentence(),
          })),
        },
      }),
    ];
    
    return structureTypes[Math.floor(Math.random() * structureTypes.length)]();
  };

  // 主生成函数
  const generateJson = () => {
    const result = generateComplexStructure();
    return JSON.stringify(result, null, 2);
  };

  return generateJson();
};
