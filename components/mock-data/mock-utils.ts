
import { faker } from '@faker-js/faker';
import { EntityType, EntityProperty, ParsedSchema } from '@/utils/odata-helper';
import { DEFAULT_STRATEGIES, FAKER_DEFINITIONS } from './faker-definitions';

export type MockStrategyType = 'faker' | 'custom.null' | 'custom.empty' | 'custom.undefined' | 'custom.increment';

export interface MockStrategy {
    value: string;
    label: string;
    category: string;
    type: MockStrategyType;
    fakerModule?: string;
    fakerMethod?: string;
    allowedTypes?: string[]; 
}

export interface AutoIncrementConfig {
    start: number; step: number; prefix: string; suffix: string;
}

export interface MockFieldConfig {
    path: string; property: EntityProperty; strategy: string; incrementConfig?: AutoIncrementConfig;
}

// 统一合并所有策略 (默认 + Faker)
export const ALL_STRATEGIES = [...DEFAULT_STRATEGIES, ...FAKER_DEFINITIONS];

export const getGroupedStrategies = () => {
    const groups: Record<string, MockStrategy[]> = {};
    ALL_STRATEGIES.forEach(s => {
        if (!groups[s.category]) groups[s.category] = [];
        groups[s.category].push(s);
    });
    return groups;
};

export const isStrategyCompatible = (strategyValue: string, odataType: string): boolean => {
    const strategy = ALL_STRATEGIES.find(s => s.value === strategyValue);
    if (!strategy) return false;
    if (!strategy.allowedTypes) return true;
    if (['Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.Byte'].includes(odataType) && strategy.value === 'number.int') return true;
    return strategy.allowedTypes.includes(odataType);
};

export const flattenEntityProperties = (entity: EntityType, schema: ParsedSchema, prefix: string = ''): { path: string, property: EntityProperty }[] => {
    let results: { path: string, property: EntityProperty }[] = [];
    entity.properties.forEach(p => {
        const currentPath = prefix ? `${prefix}.${p.name}` : p.name;
        const complexType = schema.entities.find(e => e.name === p.type.split('.').pop());
        if (complexType) results = results.concat(flattenEntityProperties(complexType, schema, currentPath));
        else results.push({ path: currentPath, property: p });
    });
    return results;
};

export const suggestStrategy = (prop: EntityProperty): string => {
    const name = prop.name.toLowerCase();
    const type = prop.type;
    if (type === 'Edm.Boolean') return 'datatype.boolean';
    if (type === 'Edm.Guid') return 'string.uuid';
    if (type.includes('Date')) return 'date.recent';
    if (['Edm.Int16', 'Edm.Int32', 'Edm.Int64'].includes(type)) return 'number.int';
    if (['Edm.Decimal', 'Edm.Double'].includes(type)) return 'commerce.price';
    if (type === 'Edm.String') {
        if (name.includes('email')) return 'internet.email';
        if (name.includes('phone')) return 'phone.number';
        if (name.includes('url')) return 'internet.url';
        if (name.includes('name')) {
            if (name.includes('first')) return 'person.firstName';
            if (name.includes('last')) return 'person.lastName';
            if (name.includes('product')) return 'commerce.productName';
            return 'person.fullName';
        }
        if (name.includes('city')) return 'location.city';
        if (name.includes('country')) return 'location.country';
        if (name.includes('id') || name.includes('key')) return 'string.uuid';
        return 'lorem.word';
    }
    return 'custom.null';
};

export const generateValue = (strategyValue: string, prop: EntityProperty, index: number, incrementConfig?: AutoIncrementConfig): any => {
    const strategy = ALL_STRATEGIES.find(s => s.value === strategyValue);
    if (!strategy) return null;

    if (strategy.type === 'custom.null') return null;
    if (strategy.type === 'custom.empty') return "";
    if (strategy.type === 'custom.increment') {
        const conf = incrementConfig || { start: 1, step: 1, prefix: '', suffix: '' };
        const numVal = conf.start + (index * conf.step);
        const valStr = `${conf.prefix}${numVal}${conf.suffix}`;
        if (prop.type !== 'Edm.String' && !conf.prefix && !conf.suffix) return numVal;
        return valStr;
    }

    if (strategy.type === 'faker' && strategy.fakerModule && strategy.fakerMethod) {
        try {
            // @ts-ignore
            const module = faker[strategy.fakerModule];
            if (module && typeof module[strategy.fakerMethod] === 'function') {
                return enforceConstraints(module[strategy.fakerMethod](), prop);
            } else {
                return `[Missing ${strategy.value}]`;
            }
        } catch (e) {
            return "Error";
        }
    }
    return enforceConstraints(null, prop);
};

const enforceConstraints = (val: any, prop: EntityProperty): any => {
    if (val === null || val === undefined) return val;
    if (prop.type === 'Edm.String') {
        let str = String(val);
        if (prop.maxLength && prop.maxLength > 0) str = str.substring(0, prop.maxLength);
        return str;
    }
    if (['Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.Byte', 'Edm.SByte'].includes(prop.type)) {
        let num = typeof val === 'number' ? val : parseInt(val);
        if (isNaN(num)) return 0;
        if (prop.type === 'Edm.Byte') num = Math.abs(num) % 256;
        else if (prop.type === 'Edm.Int16') { if (num > 32767) num = 32767; if (num < -32768) num = -32768; }
        return Math.floor(num);
    }
    if (['Edm.Decimal', 'Edm.Double', 'Edm.Single'].includes(prop.type)) {
        let num = typeof val === 'number' ? val : parseFloat(val);
        if (isNaN(num)) return 0;
        if (prop.scale !== undefined && prop.scale >= 0) num = parseFloat(num.toFixed(prop.scale));
        return num;
    }
    if (prop.type.includes('Date') && val instanceof Date) return val.toISOString();
    return val;
};
