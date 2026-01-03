
import React, { useState, useEffect, useMemo } from 'react';
import { Button, Input, Card, CardBody, Select, SelectItem, Checkbox, Tabs, Tab, ScrollShadow, Tooltip, Accordion, AccordionItem } from "@nextui-org/react";
import { faker } from '@faker-js/faker';
import { ODataVersion, ParsedSchema, EntityType } from '@/utils/odata-helper';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper, RowSelectionState } from '@tanstack/react-table';
import { Sparkles, Code2, Plus, Table2, Braces, Settings2, RefreshCw, Wand2, CheckSquare } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { useEntityActions } from './query-builder/hooks/useEntityActions';
import { CodeModal } from './query-builder/CodeModal';

interface Props {
  url: string;
  version: ODataVersion;
  schema: ParsedSchema | null;
}

// 常见 Faker 策略映射
const FAKER_OPTIONS = [
    { label: 'Name (Full)', value: 'person.fullName' },
    { label: 'Name (First)', value: 'person.firstName' },
    { label: 'Name (Last)', value: 'person.lastName' },
    { label: 'Product Name', value: 'commerce.productName' },
    { label: 'Product Desc', value: 'commerce.productDescription' },
    { label: 'Price', value: 'commerce.price' },
    { label: 'Department', value: 'commerce.department' },
    { label: 'Company', value: 'company.name' },
    { label: 'Email', value: 'internet.email' },
    { label: 'Phone', value: 'phone.number' },
    { label: 'Address', value: 'location.streetAddress' },
    { label: 'City', value: 'location.city' },
    { label: 'Country', value: 'location.country' },
    { label: 'Date (Past)', value: 'date.past' },
    { label: 'Date (Future)', value: 'date.future' },
    { label: 'Date (Recent)', value: 'date.recent' },
    { label: 'Integer', value: 'number.int' },
    { label: 'Boolean', value: 'datatype.boolean' },
    { label: 'UUID', value: 'string.uuid' },
    { label: 'Word', value: 'lorem.word' },
    { label: 'Sentence', value: 'lorem.sentence' },
];

const MockDataGenerator: React.FC<Props> = ({ url, version, schema }) => {
  const [count, setCount] = useState('5');
  const [entitySets, setEntitySets] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  
  // 生成配置: { FieldName: "faker.module.method" }
  const [fieldConfigs, setFieldConfigs] = useState<Record<string, string>>({});
  
  // 数据状态
  const [mockData, setMockData] = useState<any[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // 1. 初始化实体列表
  useEffect(() => {
    if (!schema) return;
    let sets: string[] = [];
    if (schema.entitySets && schema.entitySets.length > 0) {
        sets = schema.entitySets.map(es => es.name);
    } else if (schema.entities && schema.entities.length > 0) {
        sets = schema.entities.map(e => e.name + 's');
    }
    setEntitySets(sets);
    if (sets.length > 0) setSelectedEntity(sets[0]);
  }, [schema]);

  // 2. 获取当前选中实体的 Schema 定义
  const currentSchema = useMemo(() => {
      if (!selectedEntity || !schema || !schema.entities) return null;
      const setInfo = schema.entitySets.find(es => es.name === selectedEntity);
      if (setInfo) {
          const typeName = setInfo.entityType.split('.').pop();
          return schema.entities.find(e => e.name === typeName) || null;
      }
      return schema.entities.find(s => selectedEntity.includes(s.name)) || null;
  }, [selectedEntity, schema]);

  // 3. 智能推断 Faker 策略
  const suggestFakerStrategy = (propName: string, type: string) => {
      const name = propName.toLowerCase();
      // 基于名称推断
      if (name.includes('email')) return 'internet.email';
      if (name.includes('phone') || name.includes('tel')) return 'phone.number';
      if (name.includes('price') || name.includes('cost') || name.includes('amount')) return 'commerce.price';
      if (name.includes('name')) {
          if (name.includes('product')) return 'commerce.productName';
          if (name.includes('company')) return 'company.name';
          return 'person.fullName';
      }
      if (name.includes('desc') || name.includes('info')) return 'commerce.productDescription';
      if (name.includes('date') || name.includes('time') || name.includes('created') || name.includes('modified')) return 'date.recent';
      if (name.includes('id') || name.includes('key') || name.includes('guid') || name.includes('uuid')) return 'string.uuid';
      if (name.includes('address')) return 'location.streetAddress';
      if (name.includes('city')) return 'location.city';
      if (name.includes('country')) return 'location.country';

      // 基于类型推断
      if (type === 'Edm.Int32' || type === 'Edm.Int16' || type === 'Edm.Int64') return 'number.int';
      if (type === 'Edm.Decimal' || type === 'Edm.Double') return 'commerce.price';
      if (type === 'Edm.Boolean') return 'datatype.boolean';
      if (type === 'Edm.DateTime' || type === 'Edm.DateTimeOffset') return 'date.recent';
      if (type === 'Edm.Guid') return 'string.uuid';
      
      return 'lorem.word';
  };

  // 4. 当实体变化时，初始化配置
  useEffect(() => {
      if (!currentSchema) return;
      const initialConfig: Record<string, string> = {};
      currentSchema.properties.forEach(p => {
          initialConfig[p.name] = suggestFakerStrategy(p.name, p.type);
      });
      setFieldConfigs(initialConfig);
      setMockData([]); // 清空旧数据
      setRowSelection({});
  }, [currentSchema]);

  // 5. 生成数据核心逻辑
  const generateData = () => {
    if (!currentSchema) return;
    const num = parseInt(count) || 5;
    
    const newData = Array.from({ length: num }).map((_, i) => {
      const row: any = { id: i }; // local ID for table key
      currentSchema.properties.forEach(p => {
          const strategy = fieldConfigs[p.name];
          try {
              if (strategy) {
                  // 执行 Faker 函数 (e.g. "internet.email")
                  const [module, method] = strategy.split('.');
                  if ((faker as any)[module] && (faker as any)[module][method]) {
                      let val = (faker as any)[module][method]();
                      
                      // 类型转换
                      if (p.type === 'Edm.Int32') val = parseInt(val);
                      else if (p.type === 'Edm.Boolean') val = !!val;
                      else if (p.type.includes('Date')) val = new Date(val).toISOString();
                      
                      row[p.name] = val;
                  } else {
                      row[p.name] = `[Invalid Faker: ${strategy}]`;
                  }
              }
          } catch (e) {
              row[p.name] = "Gen Error";
          }
      });
      return row;
    });
    setMockData(newData);
    // 默认全选
    const selection: RowSelectionState = {};
    newData.forEach((_, idx) => selection[idx] = true);
    setRowSelection(selection);
  };

  // 6. Action Hook 集成
  const { 
      prepareCreate, 
      isOpen: isModalOpen, 
      onOpenChange: onModalOpenChange, 
      codePreview, 
      modalAction, 
      executeBatch 
  } = useEntityActions(
      url, 
      version, 
      schema, 
      selectedEntity, 
      currentSchema, 
      async () => {}, // No need to refresh query usually
      () => {}, 
      () => {}
  );

  const handleCreateSelected = () => {
      const selectedIndices = Object.keys(rowSelection).map(Number);
      const itemsToCreate = mockData.filter((_, idx) => rowSelection[idx]);
      prepareCreate(itemsToCreate);
  };

  // --- Table Configuration ---
  const columnHelper = createColumnHelper<any>();
  const columns = useMemo(() => {
      if (mockData.length === 0 && !currentSchema) return [];
      
      // Selection Column
      const selectCol = columnHelper.display({
          id: 'select',
          header: ({ table }) => (
            <Checkbox
                size="sm"
                isIndeterminate={table.getIsSomeRowsSelected()}
                isSelected={table.getIsAllRowsSelected()}
                onValueChange={(val) => table.toggleAllRowsSelected(!!val)}
                aria-label="Select all"
                classNames={{ wrapper: "m-0" }}
            />
          ),
          cell: ({ row }) => (
            <Checkbox
                size="sm"
                isSelected={row.getIsSelected()}
                onValueChange={(val) => row.toggleSelected(!!val)}
                aria-label="Select row"
                classNames={{ wrapper: "m-0" }}
            />
          ),
          size: 40,
      });

      // Data Columns
      let dataCols: any[] = [];
      if (currentSchema) {
          dataCols = currentSchema.properties.map(p => columnHelper.accessor(p.name, {
              header: p.name,
              cell: info => <span className="text-xs font-mono truncate block max-w-[150px]" title={String(info.getValue())}>{String(info.getValue())}</span>
          }));
      }

      return [selectCol, ...dataCols];
  }, [mockData, currentSchema]);

  const table = useReactTable({
    data: mockData,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-4 h-full relative">
      {/* 顶部控制栏 */}
      <Card className="border-none shadow-sm bg-content1 shrink-0">
        <CardBody className="p-3">
           <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
              <div className="flex items-center gap-4 flex-1 w-full">
                <Select 
                    label="Target Entity" 
                    size="sm" 
                    variant="bordered" 
                    className="max-w-[240px]"
                    selectedKeys={selectedEntity ? [selectedEntity] : []}
                    onChange={(e) => setSelectedEntity(e.target.value)}
                >
                    {entitySets.map(es => <SelectItem key={es} value={es}>{es}</SelectItem>)}
                </Select>
                <Input 
                    label="Row Count" 
                    type="number" 
                    value={count} 
                    onValueChange={setCount} 
                    className="max-w-[100px]" 
                    variant="bordered"
                    size="sm"
                />
                <Button color="primary" onPress={generateData} startContent={<Sparkles size={16}/>} className="font-semibold">
                  Generate Data
                </Button>
              </div>
           </div>
        </CardBody>
      </Card>

      <div className="flex gap-4 flex-1 min-h-0">
          {/* 左侧：配置微调面板 */}
          <div className="w-[280px] bg-content1 rounded-xl border border-divider flex flex-col shrink-0">
             <div className="p-3 border-b border-divider font-bold text-sm flex items-center gap-2 text-default-600">
                 <Settings2 size={16} /> Generation Logic
             </div>
             <ScrollShadow className="flex-1 p-3">
                 {!currentSchema ? (
                     <div className="text-default-400 text-xs text-center mt-10">Select an Entity first</div>
                 ) : (
                    <div className="flex flex-col gap-3">
                        {currentSchema.properties.map(p => (
                            <div key={p.name} className="flex flex-col gap-1">
                                <div className="flex justify-between items-baseline">
                                    <label className="text-[10px] font-bold text-default-600 truncate max-w-[180px]" title={p.name}>{p.name}</label>
                                    <span className="text-[9px] text-default-400 font-mono">{p.type.split('.').pop()}</span>
                                </div>
                                <div className="flex gap-1">
                                    <Select 
                                        aria-label={p.name}
                                        size="sm" 
                                        variant="faded" 
                                        selectedKeys={fieldConfigs[p.name] ? [fieldConfigs[p.name]] : []}
                                        onChange={(e) => setFieldConfigs({...fieldConfigs, [p.name]: e.target.value})}
                                        classNames={{ trigger: "h-7 min-h-7 px-2", value: "text-[10px]" }}
                                    >
                                        {FAKER_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value} textValue={opt.label}>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px]">{opt.label}</span>
                                                    <span className="text-[9px] text-default-400">{opt.value}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    {/* Advanced manual input trigger could go here */}
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
             </ScrollShadow>
             <div className="p-2 border-t border-divider">
                 <Button size="sm" variant="light" fullWidth onPress={() => setFieldConfigs({})} startContent={<RefreshCw size={14}/>}>
                     Reset Defaults
                 </Button>
             </div>
          </div>

          {/* 右侧：数据展示区 */}
          <div className="flex-1 flex flex-col bg-content1 rounded-xl border border-divider overflow-hidden relative">
              <Tabs 
                aria-label="View Mode" 
                variant="underlined"
                color="secondary"
                classNames={{
                    tabList: "px-4 border-b border-divider bg-default-50",
                    cursor: "w-full bg-secondary",
                }}
              >
                  <Tab key="table" title={<div className="flex items-center gap-2"><Table2 size={14}/> Table View</div>}>
                      <div className="flex-1 overflow-auto h-[calc(100vh-280px)] scrollbar-thin p-0">
                         {mockData.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 z-20 bg-default-100 shadow-sm">
                                    {table.getHeaderGroups().map(hg => (
                                        <tr key={hg.id}>
                                            {hg.headers.map(h => (
                                                <th key={h.id} className="p-2 text-xs font-bold text-default-600 border-b border-divider border-r border-divider/50 last:border-r-0">
                                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.map((row, idx) => (
                                        <tr key={row.id} className={`border-b border-divider/40 hover:bg-default-50 transition-colors ${row.getIsSelected() ? 'bg-primary/5' : ''}`}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className="p-2 border-r border-divider/20 last:border-r-0">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         ) : (
                             <div className="flex flex-col items-center justify-center h-full text-default-300 gap-2">
                                <Wand2 size={48} className="opacity-20" />
                                <p>Click "Generate Data" to start</p>
                             </div>
                         )}
                      </div>
                  </Tab>
                  <Tab key="json" title={<div className="flex items-center gap-2"><Braces size={14}/> JSON Preview</div>}>
                      <div className="h-[calc(100vh-280px)] overflow-hidden text-sm">
                          <CodeMirror
                            value={JSON.stringify(mockData, null, 2)}
                            height="100%"
                            extensions={[json()]}
                            theme={vscodeDark}
                            readOnly={true}
                            editable={false}
                          />
                      </div>
                  </Tab>
              </Tabs>

              {/* 底部浮动操作栏 */}
              {mockData.length > 0 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-foreground text-background px-6 py-2 rounded-full shadow-xl flex items-center gap-4 z-30 animate-appearance-in">
                      <div className="flex items-center gap-2 font-medium text-sm">
                          <CheckSquare size={16} className="text-primary-500"/>
                          <span>{Object.keys(rowSelection).length} Selected</span>
                      </div>
                      <div className="h-4 w-px bg-background/20"></div>
                      <Button 
                        size="sm" 
                        color="primary" 
                        variant="shadow" 
                        className="font-bold text-white"
                        onPress={handleCreateSelected}
                        isDisabled={Object.keys(rowSelection).length === 0}
                        startContent={<Plus size={16}/>}
                      >
                          Create Selected
                      </Button>
                  </div>
              )}
          </div>
      </div>

      {/* Code Execution Modal */}
      <CodeModal 
          isOpen={isModalOpen}
          onOpenChange={onModalOpenChange}
          code={codePreview}
          action={modalAction}
          onExecute={executeBatch}
      />
    </div>
  );
};

export default MockDataGenerator;
