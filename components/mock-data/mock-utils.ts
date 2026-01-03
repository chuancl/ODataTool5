
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
    { value: 'custom.null', label: 'Null (空值)', category: 'Custom (自定义)', type: 'custom.null' },
    { value: 'custom.empty', label: 'Empty String (空字符串)', category: 'Custom (自定义)', type: 'custom.empty', allowedTypes: ['Edm.String'] },
    { value: 'custom.increment', label: 'Auto Increment (自增序列)', category: 'Custom (自定义)', type: 'custom.increment', allowedTypes: ['Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.String', 'Edm.Byte'] },
];

// 辅助构建 Faker 策略
const mkFaker = (cat: string, mod: string, meth: string, lbl: string, types?: string[]): MockStrategy => ({
    value: `${mod}.${meth}`,
    label: lbl,
    category: cat,
    type: 'faker',
    fakerModule: mod,
    fakerMethod: meth,
    allowedTypes: types
});

const STRING_ONLY = ['Edm.String'];
const NUMBER_ONLY = ['Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.Byte', 'Edm.SByte', 'Edm.Decimal', 'Edm.Double', 'Edm.Single'];
const DATE_ONLY = ['Edm.DateTime', 'Edm.DateTimeOffset', 'Edm.String'];

// 定义支持的 Faker 方法 (全面覆盖)
const FAKER_DEFINITIONS: MockStrategy[] = [
    // Person 人
    mkFaker('Person (人)', 'person', 'fullName', 'Full Name (全名)', STRING_ONLY),
    mkFaker('Person (人)', 'person', 'firstName', 'First Name (名)', STRING_ONLY),
    mkFaker('Person (人)', 'person', 'lastName', 'Last Name (姓)', STRING_ONLY),
    mkFaker('Person (人)', 'person', 'middleName', 'Middle Name (中间名)', STRING_ONLY),
    mkFaker('Person (人)', 'person', 'jobTitle', 'Job Title (职位)', STRING_ONLY),
    mkFaker('Person (人)', 'person', 'gender', 'Gender (性别)', STRING_ONLY),
    mkFaker('Person (人)', 'person', 'bio', 'Bio (简介)', STRING_ONLY),

    // Commerce 商业
    mkFaker('Commerce (商业)', 'commerce', 'department', 'Department (部门)', STRING_ONLY),
    mkFaker('Commerce (商业)', 'commerce', 'productName', 'Product Name (产品名)', STRING_ONLY),
    mkFaker('Commerce (商业)', 'commerce', 'price', 'Price (价格)', ['Edm.Decimal', 'Edm.Double', 'Edm.Single', 'Edm.String']),
    mkFaker('Commerce (商业)', 'commerce', 'productDescription', 'Product Desc (描述)', STRING_ONLY),
    mkFaker('Commerce (商业)', 'commerce', 'productMaterial', 'Material (材质)', STRING_ONLY),

    // Company 公司
    mkFaker('Company (公司)', 'company', 'name', 'Company Name (公司名)', STRING_ONLY),
    mkFaker('Company (公司)', 'company', 'catchPhrase', 'Catch Phrase (口号)', STRING_ONLY),
    mkFaker('Company (公司)', 'company', 'buzzPhrase', 'Buzz Phrase (热词)', STRING_ONLY),

    // Internet 互联网
    mkFaker('Internet (互联网)', 'internet', 'email', 'Email (邮箱)', STRING_ONLY),
    mkFaker('Internet (互联网)', 'internet', 'userName', 'Username (用户名)', STRING_ONLY),
    mkFaker('Internet (互联网)', 'internet', 'domainName', 'Domain (域名)', STRING_ONLY),
    mkFaker('Internet (互联网)', 'internet', 'url', 'URL (链接)', STRING_ONLY),
    mkFaker('Internet (互联网)', 'internet', 'ipv4', 'IPv4', STRING_ONLY),
    mkFaker('Internet (互联网)', 'internet', 'userAgent', 'User Agent', STRING_ONLY),
    mkFaker('Internet (互联网)', 'internet', 'mac', 'MAC Address', STRING_ONLY),
    mkFaker('Internet (互联网)', 'internet', 'password', 'Password (密码)', STRING_ONLY),

    // Location 地点
    mkFaker('Location (地点)', 'location', 'city', 'City (城市)', STRING_ONLY),
    mkFaker('Location (地点)', 'location', 'country', 'Country (国家)', STRING_ONLY),
    mkFaker('Location (地点)', 'location', 'streetAddress', 'Street Address (街道)', STRING_ONLY),
    mkFaker('Location (地点)', 'location', 'zipCode', 'Zip Code (邮编)', STRING_ONLY),
    mkFaker('Location (地点)', 'location', 'state', 'State (州/省)', STRING_ONLY),
    mkFaker('Location (地点)', 'location', 'latitude', 'Latitude (纬度)', ['Edm.Double', 'Edm.Single', 'Edm.String']),
    mkFaker('Location (地点)', 'location', 'longitude', 'Longitude (经度)', ['Edm.Double', 'Edm.Single', 'Edm.String']),

    // Date 日期
    mkFaker('Date (日期)', 'date', 'past', 'Past Date (过去)', DATE_ONLY),
    mkFaker('Date (日期)', 'date', 'future', 'Future Date (未来)', DATE_ONLY),
    mkFaker('Date (日期)', 'date', 'recent', 'Recent Date (最近)', DATE_ONLY),
    mkFaker('Date (日期)', 'date', 'month', 'Month (月份)', STRING_ONLY),
    mkFaker('Date (日期)', 'date', 'weekday', 'Weekday (星期)', STRING_ONLY),

    // Phone 电话
    mkFaker('Phone (电话)', 'phone', 'number', 'Phone Number (号码)', STRING_ONLY),
    mkFaker('Phone (电话)', 'phone', 'imei', 'IMEI', STRING_ONLY),

    // Finance 金融
    mkFaker('Finance (金融)', 'finance', 'accountName', 'Account Name (账户名)', STRING_ONLY),
    mkFaker('Finance (金融)', 'finance', 'amount', 'Amount (金额)', ['Edm.Decimal', 'Edm.Double', 'Edm.String']),
    mkFaker('Finance (金融)', 'finance', 'currencyCode', 'Currency Code (货币代码)', STRING_ONLY),
    mkFaker('Finance (金融)', 'finance', 'currencyName', 'Currency Name (货币名)', STRING_ONLY),
    mkFaker('Finance (金融)', 'finance', 'bitcoinAddress', 'Bitcoin Addr (比特币地址)', STRING_ONLY),
    mkFaker('Finance (金融)', 'finance', 'creditCardNumber', 'Credit Card (信用卡)', STRING_ONLY),

    // Animal 动物
    mkFaker('Animal (动物)', 'animal', 'type', 'Type (种类)', STRING_ONLY),
    mkFaker('Animal (动物)', 'animal', 'dog', 'Dog (狗)', STRING_ONLY),
    mkFaker('Animal (动物)', 'animal', 'cat', 'Cat (猫)', STRING_ONLY),
    mkFaker('Animal (动物)', 'animal', 'snake', 'Snake (蛇)', STRING_ONLY),
    mkFaker('Animal (动物)', 'animal', 'bear', 'Bear (熊)', STRING_ONLY),
    mkFaker('Animal (动物)', 'animal', 'lion', 'Lion (狮子)', STRING_ONLY),

    // Color 颜色
    mkFaker('Color (颜色)', 'color', 'human', 'Human Color (Red, Blue...)', STRING_ONLY),
    mkFaker('Color (颜色)', 'color', 'rgb', 'RGB', STRING_ONLY),
    mkFaker('Color (颜色)', 'color', 'hex', 'Hex (#FFFFFF)', STRING_ONLY),

    // Vehicle 车辆
    mkFaker('Vehicle (车辆)', 'vehicle', 'vehicle', 'Vehicle Name (车名)', STRING_ONLY),
    mkFaker('Vehicle (车辆)', 'vehicle', 'manufacturer', 'Manufacturer (厂商)', STRING_ONLY),
    mkFaker('Vehicle (车辆)', 'vehicle', 'model', 'Model (型号)', STRING_ONLY),
    mkFaker('Vehicle (车辆)', 'vehicle', 'type', 'Type (类型)', STRING_ONLY),
    mkFaker('Vehicle (车辆)', 'vehicle', 'fuel', 'Fuel (燃料)', STRING_ONLY),
    mkFaker('Vehicle (车辆)', 'vehicle', 'vin', 'VIN', STRING_ONLY),

    // System 系统
    mkFaker('System (系统)', 'system', 'fileName', 'File Name (文件名)', STRING_ONLY),
    mkFaker('System (系统)', 'system', 'commonFileName', 'Common File (常用文件)', STRING_ONLY),
    mkFaker('System (系统)', 'system', 'mimeType', 'MIME Type', STRING_ONLY),
    mkFaker('System (系统)', 'system', 'fileType', 'File Type (扩展名)', STRING_ONLY),
    mkFaker('System (系统)', 'system', 'semver', 'Semver (版本号)', STRING_ONLY),

    // Science 科学
    mkFaker('Science (科学)', 'science', 'chemicalElement', 'Element (元素)', STRING_ONLY),
    mkFaker('Science (科学)', 'science', 'unit', 'Unit (单位)', STRING_ONLY),

    // Hacker 黑客
    mkFaker('Hacker (黑客)', 'hacker', 'abbreviation', 'Abbreviation (缩写)', STRING_ONLY),
    mkFaker('Hacker (黑客)', 'hacker', 'adjective', 'Adjective (形容词)', STRING_ONLY),
    mkFaker('Hacker (黑客)', 'hacker', 'noun', 'Noun (名词)', STRING_ONLY),
    mkFaker('Hacker (黑客)', 'hacker', 'verb', 'Verb (动词)', STRING_ONLY),
    mkFaker('Hacker (黑客)', 'hacker', 'phrase', 'Phrase (短语)', STRING_ONLY),

    // Word 单词 & Lorem
    mkFaker('Word (单词)', 'word', 'adjective', 'Adjective', STRING_ONLY),
    mkFaker('Word (单词)', 'word', 'noun', 'Noun', STRING_ONLY),
    mkFaker('Lorem (文本)', 'lorem', 'word', 'Word', STRING_ONLY),
    mkFaker('Lorem (文本)', 'lorem', 'sentence', 'Sentence (句子)', STRING_ONLY),
    mkFaker('Lorem (文本)', 'lorem', 'paragraph', 'Paragraph (段落)', STRING_ONLY),
    mkFaker('Lorem (文本)', 'lorem', 'slug', 'Slug', STRING_ONLY),

    // Number 数字
    mkFaker('Number (数字)', 'number', 'int', 'Integer (整数)', NUMBER_ONLY),
    mkFaker('Number (数字)', 'number', 'float', 'Float (浮点数)', ['Edm.Double', 'Edm.Single', 'Edm.Decimal']),
    mkFaker('Number (数字)', 'number', 'binary', 'Binary (二进制)', STRING_ONLY),
    mkFaker('Number (数字)', 'number', 'octal', 'Octal (八进制)', STRING_ONLY),
    mkFaker('Number (数字)', 'number', 'hex', 'Hex (十六进制)', STRING_ONLY),

    // ID & String
    mkFaker('String (ID)', 'string', 'uuid', 'UUID / GUID', ['Edm.Guid', 'Edm.String']),
    mkFaker('String (ID)', 'string', 'alphanumeric', 'Alphanumeric', STRING_ONLY),
    mkFaker('String (ID)', 'string', 'numeric', 'Numeric String', STRING_ONLY),
    
    // Boolean
    mkFaker('Datatype (数据类型)', 'datatype', 'boolean', 'Boolean (布尔)', ['Edm.Boolean']),

    // Image
    mkFaker('Image (图像)', 'image', 'avatar', 'Avatar URL', STRING_ONLY),
    mkFaker('Image (图像)', 'image', 'url', 'Image URL', STRING_ONLY),
];

export const ALL_STRATEGIES = [...COMMON_STRATEGIES, ...FAKER_DEFINITIONS];

// --- 2. 辅助函数 ---

// 检查策略是否与字段类型兼容
export const isStrategyCompatible = (strategyValue: string, odataType: string): boolean => {
    const strategy = ALL_STRATEGIES.find(s => s.value === strategyValue);
    if (!strategy) return false;
    if (!strategy.allowedTypes) return true; // 通用类型 (如 Null)
    
    // 特殊处理 Number 兼容性
    if (odataType === 'Edm.Int32' || odataType === 'Edm.Int16' || odataType === 'Edm.Int64') {
        if (strategy.value === 'number.int') return true;
    }
    
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

// 扁平化实体属性 (支持嵌套 ComplexType)
export const flattenEntityProperties = (
    entity: EntityType, 
    schema: ParsedSchema, 
    prefix: string = ''
): { path: string, property: EntityProperty }[] => {
    let results: { path: string, property: EntityProperty }[] = [];

    entity.properties.forEach(p => {
        const currentPath = prefix ? `${prefix}.${p.name}` : p.name;
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

    if (type === 'Edm.Boolean') return 'datatype.boolean';
    if (type === 'Edm.Guid') return 'string.uuid';
    if (type === 'Edm.DateTime' || type === 'Edm.DateTimeOffset') return 'date.recent';
    if (['Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.Byte'].includes(type)) return 'number.int';
    if (['Edm.Decimal', 'Edm.Double', 'Edm.Single'].includes(type)) return 'commerce.price';

    if (type === 'Edm.String') {
        if (name.includes('email')) return 'internet.email';
        if (name.includes('phone') || name.includes('tel')) return 'phone.number';
        if (name.includes('url') || name.includes('link')) return 'internet.url';
        if (name.includes('name')) {
            if (name.includes('first')) return 'person.firstName';
            if (name.includes('last')) return 'person.lastName';
            if (name.includes('company')) return 'company.name';
            if (name.includes('product')) return 'commerce.productName';
            return 'person.fullName';
        }
        if (name.includes('city')) return 'location.city';
        if (name.includes('country')) return 'location.country';
        if (name.includes('address')) return 'location.streetAddress';
        if (name.includes('zip') || name.includes('code')) return 'location.zipCode';
        if (name.includes('desc')) return 'commerce.productDescription'; 
        if (name.includes('id') || name.includes('key')) return 'string.uuid';
        if (name.includes('img') || name.includes('pic') || name.includes('avatar')) return 'image.avatar';
        return 'lorem.word';
    }

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

    if (strategy.type === 'custom.null') return null;
    if (strategy.type === 'custom.empty') return "";
    if (strategy.type === 'custom.undefined') return undefined;
    if (strategy.type === 'custom.increment') {
        const conf = incrementConfig || { start: 1, step: 1, prefix: '', suffix: '' };
        const numVal = conf.start + (index * conf.step);
        
        // 强制拼接前缀后缀
        const valStr = `${conf.prefix}${numVal}${conf.suffix}`;

        // 若非String且无前后缀，保留数字类型以防精度丢失
        if (prop.type !== 'Edm.String' && !conf.prefix && !conf.suffix) {
            return numVal;
        }
        return valStr;
    }

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

    return enforceConstraints(result, prop);
};

// 约束强制执行
const enforceConstraints = (val: any, prop: EntityProperty): any => {
    if (val === null || val === undefined) return val;

    const type = prop.type;

    if (type === 'Edm.String') {
        let str = String(val);
        if (prop.maxLength && prop.maxLength > 0) {
            str = str.substring(0, prop.maxLength);
        }
        return str;
    }

    if (['Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.Byte', 'Edm.SByte'].includes(type)) {
        let num = typeof val === 'number' ? val : parseInt(val);
        if (isNaN(num)) return 0;

        if (type === 'Edm.Byte') num = Math.abs(num) % 256;
        else if (type === 'Edm.SByte') {
            num = num % 128; 
        } 
        else if (type === 'Edm.Int16') {
             if (num > 32767) num = 32767;
             if (num < -32768) num = -32768;
        }
        
        return Math.floor(num);
    }

    if (['Edm.Decimal', 'Edm.Double', 'Edm.Single'].includes(type)) {
        let num = typeof val === 'number' ? val : parseFloat(val);
        if (isNaN(num)) return 0;
        
        if (prop.scale !== undefined && prop.scale >= 0) {
            num = parseFloat(num.toFixed(prop.scale));
        }
        return num;
    }

    if (type.includes('Date')) {
        if (val instanceof Date) return val.toISOString();
        return val;
    }

    return val;
};
