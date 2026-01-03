
import { faker } from '@faker-js/faker';
import { EntityType, EntityProperty, ParsedSchema } from '@/utils/odata-helper';

// --- 类型定义 ---

export type MockStrategyType = 
    | 'faker' 
    | 'custom.null' 
    | 'custom.empty' 
    | 'custom.undefined' 
    | 'custom.increment';

export interface MockStrategy {
    value: string;
    label: string;
    category: string;
    type: MockStrategyType;
    fakerModule?: string;
    fakerMethod?: string;
    // 允许的 OData 类型, undefined 表示通用
    allowedTypes?: string[]; 
}

export interface AutoIncrementConfig {
    start: number;
    step: number;
    prefix: string;
    suffix: string;
}

export interface MockFieldConfig {
    path: string; // e.g., "Address/City" or "Name"
    property: EntityProperty;
    strategy: string; // Strategy Value
    incrementConfig?: AutoIncrementConfig;
}

// --- 1. 策略定义 (Faker + Custom) ---

const COMMON_STRATEGIES: MockStrategy[] = [
    { value: 'custom.null', label: 'Null (空值)', category: 'Custom', type: 'custom.null' },
    { value: 'custom.empty', label: 'Empty String ""', category: 'Custom', type: 'custom.empty', allowedTypes: ['Edm.String'] },
    // { value: 'custom.undefined', label: 'Undefined (Skip)', category: 'Custom', type: 'custom.undefined' },
    { value: 'custom.increment', label: 'Auto Increment (自增)', category: 'Custom', type: 'custom.increment', allowedTypes: ['Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.String'] },
];

// 定义支持的 Faker 方法 (按类别分组)
const FAKER_DEFINITIONS: MockStrategy[] = [
    // Person
    { value: 'person.fullName', label: 'Full Name', category: 'Person', type: 'faker', fakerModule: 'person', fakerMethod: 'fullName', allowedTypes: ['Edm.String'] },
    { value: 'person.firstName', label: 'First Name', category: 'Person', type: 'faker', fakerModule: 'person', fakerMethod: 'firstName', allowedTypes: ['Edm.String'] },
    { value: 'person.lastName', label: 'Last Name', category: 'Person', type: 'faker', fakerModule: 'person', fakerMethod: 'lastName', allowedTypes: ['Edm.String'] },
    { value: 'person.jobTitle', label: 'Job Title', category: 'Person', type: 'faker', fakerModule: 'person', fakerMethod: 'jobTitle', allowedTypes: ['Edm.String'] },
    
    // Commerce
    { value: 'commerce.productName', label: 'Product Name', category: 'Commerce', type: 'faker', fakerModule: 'commerce', fakerMethod: 'productName', allowedTypes: ['Edm.String'] },
    { value: 'commerce.price', label: 'Price', category: 'Commerce', type: 'faker', fakerModule: 'commerce', fakerMethod: 'price', allowedTypes: ['Edm.Decimal', 'Edm.Double', 'Edm.Single', 'Edm.String'] },
    { value: 'commerce.department', label: 'Department', category: 'Commerce', type: 'faker', fakerModule: 'commerce', fakerMethod: 'department', allowedTypes: ['Edm.String'] },
    
    // Internet
    { value: 'internet.email', label: 'Email', category: 'Internet', type: 'faker', fakerModule: 'internet', fakerMethod: 'email', allowedTypes: ['Edm.String'] },
    { value: 'internet.userName', label: 'Username', category: 'Internet', type: 'faker', fakerModule: 'internet', fakerMethod: 'userName', allowedTypes: ['Edm.String'] },
    { value: 'internet.url', label: 'URL', category: 'Internet', type: 'faker', fakerModule: 'internet', fakerMethod: 'url', allowedTypes: ['Edm.String'] },
    
    // Location
    { value: 'location.city', label: 'City', category: 'Location', type: 'faker', fakerModule: 'location', fakerMethod: 'city', allowedTypes: ['Edm.String'] },
    { value: 'location.country', label: 'Country', category: 'Location', type: 'faker', fakerModule: 'location', fakerMethod: 'country', allowedTypes: ['Edm.String'] },
    { value: 'location.streetAddress', label: 'Street Address', category: 'Location', type: 'faker', fakerModule: 'location', fakerMethod: 'streetAddress', allowedTypes: ['Edm.String'] },
    { value: 'location.zipCode', label: 'Zip Code', category: 'Location', type: 'faker', fakerModule: 'location', fakerMethod: 'zipCode', allowedTypes: ['Edm.String'] },

    // Date
    { value: 'date.past', label: 'Date (Past)', category: 'Date', type: 'faker', fakerModule: 'date', fakerMethod: 'past', allowedTypes: ['Edm.DateTime', 'Edm.DateTimeOffset', 'Edm.String'] },
    { value: 'date.future', label: 'Date (Future)', category: 'Date', type: 'faker', fakerModule: 'date', fakerMethod: 'future', allowedTypes: ['Edm.DateTime', 'Edm.DateTimeOffset', 'Edm.String'] },
    { value: 'date.recent', label: 'Date (Recent)', category: 'Date', type: 'faker', fakerModule: 'date', fakerMethod: 'recent', allowedTypes: ['Edm.DateTime', 'Edm.DateTimeOffset', 'Edm.String'] },

    // Numbers & IDs
    { value: 'number.int', label: 'Integer', category: 'Number/ID', type: 'faker', fakerModule: 'number', fakerMethod: 'int', allowedTypes: ['Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.Byte', 'Edm.SByte'] },
    { value: 'string.uuid', label: 'UUID / GUID', category: 'Number/ID', type: 'faker', fakerModule: 'string', fakerMethod: 'uuid', allowedTypes: ['Edm.Guid', 'Edm.String'] },
    
    // Text
    { value: 'lorem.word', label: 'Word', category: 'Text', type: 'faker', fakerModule: 'lorem', fakerMethod: 'word', allowedTypes: ['Edm.String'] },
    { value: 'lorem.sentence', label: 'Sentence', category: 'Text', type: 'faker', fakerModule: 'lorem', fakerMethod: 'sentence', allowedTypes: ['Edm.String'] },
    { value: 'lorem.paragraph', label: 'Paragraph', category: 'Text', type: 'faker', fakerModule: 'lorem', fakerMethod: 'paragraph', allowedTypes: ['Edm.String'] },
    
    // Boolean
    { value: 'datatype.boolean', label: 'Boolean', category: 'Boolean', type: 'faker', fakerModule: 'datatype', fakerMethod: 'boolean', allowedTypes: ['Edm.Boolean'] },
];

export const ALL_STRATEGIES = [...COMMON_STRATEGIES, ...FAKER_DEFINITIONS];

// --- 2. 辅助函数 ---

// 检查策略是否与字段类型兼容
export const isStrategyCompatible = (strategyValue: string, odataType: string): boolean => {
    const strategy = ALL_STRATEGIES.find(s => s.value === strategyValue);
    if (!strategy) return false;
    if (!strategy.allowedTypes) return true; // 通用类型 (如 Null)
    return strategy.allowedTypes.includes(odataType);
};

// 获取全部分组策略
export const getGroupedStrategies = () => {
    const groups: Record<string, MockStrategy[]> = {};
    ALL_STRATEGIES.forEach(s => {
        if (!groups[s.category]) groups[s.category] = [];
        groups[s.category].push(s);
    });
    return groups;
};

// 获取适用于特定类型的策略 (Legacy)
export const getStrategiesForType = (odataType: string) => {
    return ALL_STRATEGIES.filter(s => {
        if (!s.allowedTypes) return true; // 通用类型 (如 Null)
        return s.allowedTypes.includes(odataType);
    });
};

// 扁平化实体属性 (支持嵌套 ComplexType)
export const flattenEntityProperties = (
    entity: EntityType, 
    schema: ParsedSchema, 
    prefix: string = ''
): { path: string, property: EntityProperty }[] => {
    let results: { path: string, property: EntityProperty }[] = [];

    entity.properties.forEach(p => {
        const currentPath = prefix ? `${prefix}.${p.name}` : p.name;
        
        // 检查是否为 ComplexType
        const complexTypeName = p.type.split('.').pop() || '';
        const complexType = schema.entities.find(e => e.name === complexTypeName);

        if (complexType) {
            results = results.concat(flattenEntityProperties(complexType, schema, currentPath));
        } else {
            results.push({ path: currentPath, property: p });
        }
    });

    return results;
};

// 智能推断策略
export const suggestStrategy = (prop: EntityProperty): string => {
    const name = prop.name.toLowerCase();
    const type = prop.type;

    // 1. 基于类型强匹配
    if (type === 'Edm.Boolean') return 'datatype.boolean';
    if (type === 'Edm.Guid') return 'string.uuid';
    if (type === 'Edm.DateTime' || type === 'Edm.DateTimeOffset') return 'date.recent';
    if (type === 'Edm.Int16' || type === 'Edm.Int32' || type === 'Edm.Int64' || type === 'Edm.Byte') return 'number.int';

    // 2. 基于名称推断 (String)
    if (type === 'Edm.String') {
        if (name.includes('email')) return 'internet.email';
        if (name.includes('phone') || name.includes('tel')) return 'phone.number'; // Faker fallback
        if (name.includes('url') || name.includes('link')) return 'internet.url';
        if (name.includes('name')) {
            if (name.includes('first')) return 'person.firstName';
            if (name.includes('last')) return 'person.lastName';
            if (name.includes('product')) return 'commerce.productName';
            return 'person.fullName';
        }
        if (name.includes('city')) return 'location.city';
        if (name.includes('country')) return 'location.country';
        if (name.includes('address')) return 'location.streetAddress';
        if (name.includes('zip') || name.includes('code')) return 'location.zipCode';
        if (name.includes('desc')) return 'commerce.productDescription'; // Faker fallback
        if (name.includes('id') || name.includes('key')) return 'string.uuid';
        return 'lorem.word';
    }

    // 3. 默认
    return 'custom.null';
};

// --- 3. 核心生成逻辑 ---

export const generateValue = (
    strategyValue: string, 
    prop: EntityProperty, 
    index: number,
    incrementConfig?: AutoIncrementConfig
): any => {
    const strategy = ALL_STRATEGIES.find(s => s.value === strategyValue);
    if (!strategy) return null;

    let result: any = null;

    // A. 处理 Custom
    if (strategy.type === 'custom.null') return null;
    if (strategy.type === 'custom.empty') return "";
    if (strategy.type === 'custom.undefined') return undefined;
    if (strategy.type === 'custom.increment') {
        const conf = incrementConfig || { start: 1, step: 1, prefix: '', suffix: '' };
        const numVal = conf.start + (index * conf.step);
        
        // 核心逻辑修改：如果用户配置了前缀或后缀，即使是数字类型字段，也尝试拼接字符串
        // (后续 enforceConstraints 会尝试解析回数字，或者用户需要自己承担类型不匹配的后果)
        const valStr = `${conf.prefix}${numVal}${conf.suffix}`;

        // 如果字段非字符串类型，且没有配置前后缀，优先返回原始数字以保持精度
        if (prop.type !== 'Edm.String' && !conf.prefix && !conf.suffix) {
            return numVal;
        }

        return valStr;
    }

    // B. 处理 Faker
    if (strategy.type === 'faker' && strategy.fakerModule && strategy.fakerMethod) {
        try {
            // @ts-ignore
            const module = faker[strategy.fakerModule];
            if (module && module[strategy.fakerMethod]) {
                result = module[strategy.fakerMethod]();
            }
        } catch (e) {
            console.error(`Faker error for ${strategyValue}`, e);
            result = "Error";
        }
    }

    // C. 数据后处理 (Constraints enforcement)
    return enforceConstraints(result, prop);
};

// 约束强制执行
const enforceConstraints = (val: any, prop: EntityProperty): any => {
    if (val === null || val === undefined) return val;

    const type = prop.type;

    // 1. String Constraints
    if (type === 'Edm.String') {
        let str = String(val);
        if (prop.maxLength && prop.maxLength > 0) {
            str = str.substring(0, prop.maxLength);
        }
        return str;
    }

    // 2. Number Constraints
    if (['Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.Byte', 'Edm.SByte'].includes(type)) {
        // 如果 val 是字符串 (例如带前缀的 "ID_1")，parseInt 会尝试解析
        // "ID_1" -> NaN; "1_suffix" -> 1
        let num = typeof val === 'number' ? val : parseInt(val);
        if (isNaN(num)) return 0; // 解析失败回退为 0

        if (type === 'Edm.Byte') num = Math.abs(num) % 256;
        else if (type === 'Edm.SByte') {
            num = num % 128; // Simple clamp
        } 
        else if (type === 'Edm.Int16') {
             // 限制在 Short 范围
             if (num > 32767) num = 32767;
             if (num < -32768) num = -32768;
        }
        
        return Math.floor(num);
    }

    // 3. Decimal/Double
    if (['Edm.Decimal', 'Edm.Double', 'Edm.Single'].includes(type)) {
        let num = typeof val === 'number' ? val : parseFloat(val);
        if (isNaN(num)) return 0;
        
        if (prop.scale !== undefined && prop.scale >= 0) {
            num = parseFloat(num.toFixed(prop.scale));
        }
        return num;
    }

    // 4. Date
    if (type.includes('Date')) {
        // Faker returns Date object, usually fine. Convert to ISO string for OData?
        if (val instanceof Date) return val.toISOString();
        return val;
    }

    return val;
};
