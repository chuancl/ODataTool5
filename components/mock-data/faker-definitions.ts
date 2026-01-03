
import { MockStrategy } from './mock-utils';

// 简写辅助函数
const STR = ['Edm.String'];
const NUM = ['Edm.Int16', 'Edm.Int32', 'Edm.Int64', 'Edm.Byte', 'Edm.SByte', 'Edm.Decimal', 'Edm.Double', 'Edm.Single'];
const DATE = ['Edm.DateTime', 'Edm.DateTimeOffset', 'Edm.String'];
const BOOL = ['Edm.Boolean'];

const mk = (cat: string, mod: string, meth: string, lbl: string, types?: string[]): MockStrategy => ({
    value: `${mod}.${meth}`, 
    label: lbl, 
    category: cat, 
    type: 'faker', 
    fakerModule: mod, 
    fakerMethod: meth, 
    allowedTypes: types
});

export const FAKER_DEFINITIONS: MockStrategy[] = [
    // --- Person (人物) ---
    mk('Person (人物)', 'person', 'fullName', 'Full Name (全名)', STR),
    mk('Person (人物)', 'person', 'firstName', 'First Name (名)', STR),
    mk('Person (人物)', 'person', 'lastName', 'Last Name (姓)', STR),
    mk('Person (人物)', 'person', 'middleName', 'Middle Name (中间名)', STR),
    mk('Person (人物)', 'person', 'jobTitle', 'Job Title (职位)', STR),
    mk('Person (人物)', 'person', 'jobDescriptor', 'Job Desc (职位描述)', STR),
    mk('Person (人物)', 'person', 'jobArea', 'Job Area (领域)', STR),
    mk('Person (人物)', 'person', 'jobType', 'Job Type (工种)', STR),
    mk('Person (人物)', 'person', 'gender', 'Gender (性别)', STR),
    mk('Person (人物)', 'person', 'sex', 'Sex (生理性别)', STR),
    mk('Person (人物)', 'person', 'bio', 'Bio (简介)', STR),
    mk('Person (人物)', 'person', 'prefix', 'Prefix (称谓前缀)', STR),
    mk('Person (人物)', 'person', 'suffix', 'Suffix (称谓后缀)', STR),
    mk('Person (人物)', 'person', 'zodiacSign', 'Zodiac Sign (星座)', STR),

    // --- Internet (互联网) ---
    mk('Internet (互联网)', 'internet', 'email', 'Email (邮箱)', STR),
    mk('Internet (互联网)', 'internet', 'exampleEmail', 'Example Email (示例邮箱)', STR),
    mk('Internet (互联网)', 'internet', 'userName', 'Username (用户名)', STR),
    mk('Internet (互联网)', 'internet', 'displayName', 'Display Name (昵称)', STR),
    mk('Internet (互联网)', 'internet', 'password', 'Password (密码)', STR),
    mk('Internet (互联网)', 'internet', 'url', 'URL (链接)', STR),
    mk('Internet (互联网)', 'internet', 'domainName', 'Domain (域名)', STR),
    mk('Internet (互联网)', 'internet', 'ipv4', 'IPv4 Address', STR),
    mk('Internet (互联网)', 'internet', 'ipv6', 'IPv6 Address', STR),
    mk('Internet (互联网)', 'internet', 'userAgent', 'User Agent', STR),
    mk('Internet (互联网)', 'internet', 'mac', 'MAC Address', STR),
    mk('Internet (互联网)', 'internet', 'protocol', 'Protocol (协议)', STR),
    mk('Internet (互联网)', 'internet', 'httpMethod', 'HTTP Method', STR),
    mk('Internet (互联网)', 'internet', 'emoji', 'Emoji (表情)', STR),

    // --- Location (位置) ---
    mk('Location (位置)', 'location', 'city', 'City (城市)', STR),
    mk('Location (位置)', 'location', 'country', 'Country (国家)', STR),
    mk('Location (位置)', 'location', 'countryCode', 'Country Code (国家代码)', STR),
    mk('Location (位置)', 'location', 'streetAddress', 'Street Address (街道地址)', STR),
    mk('Location (位置)', 'location', 'zipCode', 'Zip Code (邮编)', STR),
    mk('Location (位置)', 'location', 'state', 'State (州/省)', STR),
    mk('Location (位置)', 'location', 'county', 'County (县/郡)', STR),
    mk('Location (位置)', 'location', 'latitude', 'Latitude (纬度)', ['Edm.Double', 'Edm.Single', 'Edm.Decimal', ...STR]),
    mk('Location (位置)', 'location', 'longitude', 'Longitude (经度)', ['Edm.Double', 'Edm.Single', 'Edm.Decimal', ...STR]),
    mk('Location (位置)', 'location', 'direction', 'Direction (方向)', STR),
    mk('Location (位置)', 'location', 'timeZone', 'Time Zone (时区)', STR),

    // --- Finance (金融) ---
    mk('Finance (金融)', 'finance', 'accountName', 'Account Name (账户名)', STR),
    mk('Finance (金融)', 'finance', 'accountNumber', 'Account Number (账号)', STR),
    mk('Finance (金融)', 'finance', 'amount', 'Amount (金额)', ['Edm.Decimal', 'Edm.Double', ...STR]),
    mk('Finance (金融)', 'finance', 'currencyCode', 'Currency Code (货币代码)', STR),
    mk('Finance (金融)', 'finance', 'currencyName', 'Currency Name (货币名)', STR),
    mk('Finance (金融)', 'finance', 'currencySymbol', 'Currency Symbol (符号)', STR),
    mk('Finance (金融)', 'finance', 'bitcoinAddress', 'Bitcoin Addr (比特币地址)', STR),
    mk('Finance (金融)', 'finance', 'creditCardNumber', 'Credit Card (信用卡号)', STR),
    mk('Finance (金融)', 'finance', 'creditCardCVV', 'CVV', STR),
    mk('Finance (金融)', 'finance', 'iban', 'IBAN', STR),
    mk('Finance (金融)', 'finance', 'transactionType', 'Transaction Type (交易类型)', STR),

    // --- Date (日期) ---
    mk('Date (日期)', 'date', 'past', 'Past Date (过去)', DATE),
    mk('Date (日期)', 'date', 'future', 'Future Date (未来)', DATE),
    mk('Date (日期)', 'date', 'recent', 'Recent Date (最近)', DATE),
    mk('Date (日期)', 'date', 'soon', 'Soon (不久后)', DATE),
    mk('Date (日期)', 'date', 'birthdate', 'Birthdate (生日)', DATE),
    mk('Date (日期)', 'date', 'month', 'Month (月份)', STR),
    mk('Date (日期)', 'date', 'weekday', 'Weekday (星期)', STR),

    // --- Commerce (商业) ---
    mk('Commerce (商业)', 'commerce', 'productName', 'Product Name (产品名)', STR),
    mk('Commerce (商业)', 'commerce', 'price', 'Price (价格)', ['Edm.Decimal', 'Edm.Double', ...STR]),
    mk('Commerce (商业)', 'commerce', 'department', 'Department (部门)', STR),
    mk('Commerce (商业)', 'commerce', 'productDescription', 'Product Desc (描述)', STR),
    mk('Commerce (商业)', 'commerce', 'productAdjective', 'Adjective (形容词)', STR),
    mk('Commerce (商业)', 'commerce', 'productMaterial', 'Material (材质)', STR),
    mk('Commerce (商业)', 'commerce', 'isbn', 'ISBN', STR),

    // --- Company (公司) ---
    mk('Company (公司)', 'company', 'name', 'Company Name (公司名)', STR),
    mk('Company (公司)', 'company', 'catchPhrase', 'Catch Phrase (口号)', STR),
    mk('Company (公司)', 'company', 'buzzPhrase', 'Buzz Phrase (热词)', STR),

    // --- Phone (电话) ---
    mk('Phone (电话)', 'phone', 'number', 'Phone Number (号码)', STR),
    mk('Phone (电话)', 'phone', 'imei', 'IMEI', STR),

    // --- Animal (动物) ---
    mk('Animal (动物)', 'animal', 'type', 'Type (种类)', STR),
    mk('Animal (动物)', 'animal', 'dog', 'Dog (狗)', STR),
    mk('Animal (动物)', 'animal', 'cat', 'Cat (猫)', STR),
    mk('Animal (动物)', 'animal', 'lion', 'Lion (狮子)', STR),
    mk('Animal (动物)', 'animal', 'bear', 'Bear (熊)', STR),
    mk('Animal (动物)', 'animal', 'bird', 'Bird (鸟)', STR),
    mk('Animal (动物)', 'animal', 'fish', 'Fish (鱼)', STR),
    mk('Animal (动物)', 'animal', 'snake', 'Snake (蛇)', STR),
    mk('Animal (动物)', 'animal', 'insect', 'Insect (昆虫)', STR),

    // --- Vehicle (车辆) ---
    mk('Vehicle (车辆)', 'vehicle', 'vehicle', 'Vehicle (车辆名称)', STR),
    mk('Vehicle (车辆)', 'vehicle', 'manufacturer', 'Manufacturer (厂商)', STR),
    mk('Vehicle (车辆)', 'vehicle', 'model', 'Model (型号)', STR),
    mk('Vehicle (车辆)', 'vehicle', 'type', 'Type (类型)', STR),
    mk('Vehicle (车辆)', 'vehicle', 'fuel', 'Fuel (燃料)', STR),
    mk('Vehicle (车辆)', 'vehicle', 'vin', 'VIN', STR),
    mk('Vehicle (车辆)', 'vehicle', 'color', 'Color (颜色)', STR),

    // --- Color (颜色) ---
    mk('Color (颜色)', 'color', 'human', 'Human Color (Red...)', STR),
    mk('Color (颜色)', 'color', 'rgb', 'RGB', STR),
    mk('Color (颜色)', 'color', 'hex', 'Hex (#FFFFFF)', STR),
    mk('Color (颜色)', 'color', 'cmyk', 'CMYK', STR),
    mk('Color (颜色)', 'color', 'hsl', 'HSL', STR),

    // --- System (系统) ---
    mk('System (系统)', 'system', 'fileName', 'File Name (文件名)', STR),
    mk('System (系统)', 'system', 'fileExt', 'File Ext (后缀)', STR),
    mk('System (系统)', 'system', 'commonFileName', 'Common File (常用文件)', STR),
    mk('System (系统)', 'system', 'mimeType', 'MIME Type', STR),
    mk('System (系统)', 'system', 'semver', 'Semver (版本号)', STR),
    mk('System (系统)', 'system', 'networkInterface', 'Network Interface', STR),
    mk('System (系统)', 'system', 'cron', 'Cron Expression', STR),

    // --- Science (科学) ---
    mk('Science (科学)', 'science', 'chemicalElement', 'Element (元素)', STR),
    mk('Science (科学)', 'science', 'unit', 'Unit (单位)', STR),

    // --- Hacker (黑客) ---
    mk('Hacker (黑客)', 'hacker', 'abbreviation', 'Abbreviation (缩写)', STR),
    mk('Hacker (黑客)', 'hacker', 'adjective', 'Adjective (形容词)', STR),
    mk('Hacker (黑客)', 'hacker', 'noun', 'Noun (名词)', STR),
    mk('Hacker (黑客)', 'hacker', 'verb', 'Verb (动词)', STR),
    mk('Hacker (黑客)', 'hacker', 'phrase', 'Phrase (短语)', STR),

    // --- Music (音乐) ---
    mk('Music (音乐)', 'music', 'genre', 'Genre (流派)', STR),
    mk('Music (音乐)', 'music', 'songName', 'Song Name (歌名)', STR),
    mk('Music (音乐)', 'music', 'artist', 'Artist (艺术家)', STR),
    mk('Music (音乐)', 'music', 'album', 'Album (专辑)', STR),

    // --- Word & Lorem (文本) ---
    mk('Word (单词)', 'word', 'adjective', 'Adjective (形容词)', STR),
    mk('Word (单词)', 'word', 'noun', 'Noun (名词)', STR),
    mk('Word (单词)', 'word', 'verb', 'Verb (动词)', STR),
    mk('Lorem (文本)', 'lorem', 'word', 'Word', STR),
    mk('Lorem (文本)', 'lorem', 'words', 'Words (多个单词)', STR),
    mk('Lorem (文本)', 'lorem', 'sentence', 'Sentence (句子)', STR),
    mk('Lorem (文本)', 'lorem', 'slug', 'Slug', STR),
    mk('Lorem (文本)', 'lorem', 'paragraph', 'Paragraph (段落)', STR),
    mk('Lorem (文本)', 'lorem', 'text', 'Text (长文本)', STR),

    // --- Image (图像) ---
    mk('Image (图像)', 'image', 'avatar', 'Avatar URL', STR),
    mk('Image (图像)', 'image', 'url', 'Image URL', STR),
    mk('Image (图像)', 'image', 'dataUri', 'Data URI', STR),

    // --- Database (数据库) ---
    mk('Database (数据库)', 'database', 'column', 'Column Name', STR),
    mk('Database (数据库)', 'database', 'type', 'Column Type', STR),
    mk('Database (数据库)', 'database', 'collation', 'Collation', STR),
    mk('Database (数据库)', 'database', 'engine', 'Engine', STR),

    // --- String & Number (基础类型) ---
    mk('Number (数字)', 'number', 'int', 'Integer (整数)', NUM),
    mk('Number (数字)', 'number', 'float', 'Float (浮点数)', ['Edm.Double', 'Edm.Single', 'Edm.Decimal']),
    mk('Number (数字)', 'number', 'binary', 'Binary (二进制)', STR),
    mk('Number (数字)', 'number', 'octal', 'Octal (八进制)', STR),
    mk('Number (数字)', 'number', 'hex', 'Hex (十六进制)', STR),
    
    mk('String (文本)', 'string', 'uuid', 'UUID / GUID', ['Edm.Guid', 'Edm.String']),
    mk('String (文本)', 'string', 'alphanumeric', 'Alphanumeric', STR),
    mk('String (文本)', 'string', 'numeric', 'Numeric String', STR),
    mk('String (文本)', 'string', 'sample', 'Sample Characters', STR),
    mk('String (文本)', 'string', 'nanoid', 'Nano ID', STR),

    // --- Datatype (杂项) ---
    mk('Datatype (杂项)', 'datatype', 'boolean', 'Boolean (布尔)', BOOL),
];
