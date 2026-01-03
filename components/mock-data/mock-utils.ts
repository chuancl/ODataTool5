
import { faker } from '@faker-js/faker';
import { EntityType, EntityProperty, ParsedSchema } from '@/utils/odata-helper';

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

const mkFaker = (cat: string, mod: string, meth: string, lbl: string, types?: string[]): MockStrategy => ({
    value: `${mod}.${meth}`, label: lbl, category: cat, type: 'faker', fakerModule: mod, fakerMethod: meth, allowedTypes: types
});

const STR = ['Edm.String'];
const NUM = ['Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.Byte', 'Edm.SByte', 'Edm.Decimal', 'Edm.Double', 'Edm.Single'];
const DATE = ['Edm.DateTime', 'Edm.DateTimeOffset', 'Edm.String'];

const FAKER_DEFINITIONS: MockStrategy[] = [
    // Person & Phone
    mkFaker('Person (人)', 'person', 'fullName', 'Full Name (全名)', STR),
    mkFaker('Person (人)', 'person', 'firstName', 'First Name (名)', STR),
    mkFaker('Person (人)', 'person', 'lastName', 'Last Name (姓)', STR),
    mkFaker('Person (人)', 'person', 'jobTitle', 'Job Title (职位)', STR),
    mkFaker('Person (人)', 'person', 'bio', 'Bio (简介)', STR),
    mkFaker('Phone (电话)', 'phone', 'number', 'Phone Number (号码)', STR),

    // Commerce & Company
    mkFaker('Commerce (商业)', 'commerce', 'productName', 'Product Name (产品名)', STR),
    mkFaker('Commerce (商业)', 'commerce', 'price', 'Price (价格)', ['Edm.Decimal', 'Edm.Double', 'Edm.String']),
    mkFaker('Commerce (商业)', 'commerce', 'department', 'Department (部门)', STR),
    mkFaker('Company (公司)', 'company', 'name', 'Company Name (公司名)', STR),
    mkFaker('Company (公司)', 'company', 'catchPhrase', 'Catch Phrase (口号)', STR),

    // Internet & System
    mkFaker('Internet (互联网)', 'internet', 'email', 'Email (邮箱)', STR),
    mkFaker('Internet (互联网)', 'internet', 'userName', 'Username (用户名)', STR),
    mkFaker('Internet (互联网)', 'internet', 'url', 'URL (链接)', STR),
    mkFaker('Internet (互联网)', 'internet', 'ipv4', 'IPv4', STR),
    mkFaker('System (系统)', 'system', 'fileName', 'File Name (文件名)', STR),
    mkFaker('System (系统)', 'system', 'mimeType', 'MIME Type', STR),
    mkFaker('System (系统)', 'system', 'semver', 'Semver (版本号)', STR),

    // Location
    mkFaker('Location (地点)', 'location', 'city', 'City (城市)', STR),
    mkFaker('Location (地点)', 'location', 'country', 'Country (国家)', STR),
    mkFaker('Location (地点)', 'location', 'streetAddress', 'Street Address (街道)', STR),
    mkFaker('Location (地点)', 'location', 'zipCode', 'Zip Code (邮编)', STR),

    // Date
    mkFaker('Date (日期)', 'date', 'past', 'Past Date (过去)', DATE),
    mkFaker('Date (日期)', 'date', 'future', 'Future Date (未来)', DATE),
    mkFaker('Date (日期)', 'date', 'recent', 'Recent Date (最近)', DATE),

    // Numbers & Strings
    mkFaker('Number (数字)', 'number', 'int', 'Integer (整数)', NUM),
    mkFaker('Number (数字)', 'number', 'float', 'Float (浮点数)', ['Edm.Double', 'Edm.Single', 'Edm.Decimal']),
    mkFaker('String (文本)', 'string', 'uuid', 'UUID / GUID', ['Edm.Guid', 'Edm.String']),
    mkFaker('String (文本)', 'string', 'alphanumeric', 'Alphanumeric', STR),
    
    // Extended Modules
    mkFaker('Animal (动物)', 'animal', 'type', 'Type (种类)', STR),
    mkFaker('Animal (动物)', 'animal', 'dog', 'Dog (狗)', STR),
    mkFaker('Animal (动物)', 'animal', 'cat', 'Cat (猫)', STR),
    
    mkFaker('Color (颜色)', 'color', 'human', 'Human Color (Red...)', STR),
    mkFaker('Color (颜色)', 'color', 'rgb', 'RGB', STR),
    
    mkFaker('Database (数据库)', 'database', 'column', 'Column Name', STR),
    mkFaker('Database (数据库)', 'database', 'type', 'Column Type', STR),
    
    mkFaker('Finance (金融)', 'finance', 'accountName', 'Account Name', STR),
    mkFaker('Finance (金融)', 'finance', 'amount', 'Amount', ['Edm.Decimal', 'Edm.Double', 'Edm.String']),
    mkFaker('Finance (金融)', 'finance', 'currencyName', 'Currency', STR),
    
    mkFaker('Hacker (黑客)', 'hacker', 'phrase', 'Phrase (短语)', STR),
    mkFaker('Hacker (黑客)', 'hacker', 'noun', 'Noun (名词)', STR),
    
    mkFaker('Image (图像)', 'image', 'avatar', 'Avatar URL', STR),
    mkFaker('Image (图像)', 'image', 'url', 'Image URL', STR),
    
    mkFaker('Lorem (文本)', 'lorem', 'word', 'Word', STR),
    mkFaker('Lorem (文本)', 'lorem', 'sentence', 'Sentence', STR),
    mkFaker('Lorem (文本)', 'lorem', 'paragraph', 'Paragraph', STR),
    
    mkFaker('Music (音乐)', 'music', 'genre', 'Genre (流派)', STR),
    mkFaker('Music (音乐)', 'music', 'songName', 'Song Name (歌名)', STR),
    
    mkFaker('Science (科学)', 'science', 'chemicalElement', 'Element (元素)', STR),
    mkFaker('Science (科学)', 'science', 'unit', 'Unit (单位)', STR),
    
    mkFaker('Vehicle (车辆)', 'vehicle', 'vehicle', 'Vehicle Name', STR),
    mkFaker('Vehicle (车辆)', 'vehicle', 'model', 'Model', STR),
    mkFaker('Vehicle (车辆)', 'vehicle', 'vin', 'VIN', STR),

    // Book (Safe Check later)
    mkFaker('Book (书籍)', 'book', 'title', 'Title (书名)', STR),
    mkFaker('Book (书籍)', 'book', 'author', 'Author (作者)', STR),
    mkFaker('Book (书籍)', 'book', 'genre', 'Genre (类别)', STR),
];

const CUSTOM_STRATEGIES: MockStrategy[] = [
    { value: 'custom.null', label: 'Null (空值)', category: 'Custom (自定义)', type: 'custom.null' },
    { value: 'custom.empty', label: 'Empty String (空字符串)', category: 'Custom (自定义)', type: 'custom.empty', allowedTypes: STR },
    { value: 'custom.increment', label: 'Auto Increment (自增序列)', category: 'Custom (自定义)', type: 'custom.increment', allowedTypes: [...NUM, 'Edm.String'] },
];

export const ALL_STRATEGIES = [...CUSTOM_STRATEGIES, ...FAKER_DEFINITIONS];

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
                // Fallback for missing modules (e.g. 'book' in older faker versions)
                if (strategy.fakerModule === 'book') return `Book ${strategy.fakerMethod} ${index}`;
                if (strategy.fakerModule === 'music') return `Song ${index}`;
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
