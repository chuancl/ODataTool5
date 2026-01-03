
import React, { useMemo, useState, useEffect } from 'react';
import { Select, SelectItem } from "@nextui-org/select";
import { Chip } from "@nextui-org/chip";
import { Tooltip } from "@nextui-org/tooltip";
import { ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react';
import { 
    ALL_STRATEGIES, 
    getGroupedStrategies, 
    isStrategyCompatible,
    MockStrategy
} from './mock-utils';

interface StrategySelectProps {
    value: string;
    onChange: (value: string) => void;
    odataType: string;
    label?: string;
}

interface FlatItem {
    key: string;
    type: 'category' | 'strategy';
    label: string;
    value: string;
    isCompatible: boolean;
    level: number;
    isExpanded?: boolean;
    strategy?: MockStrategy; // 为了获取 fakerModule/Method
}

export const StrategySelect: React.FC<StrategySelectProps> = ({ value, onChange, odataType, label }) => {
    const selectedStrategy = useMemo(() => ALL_STRATEGIES.find(s => s.value === value), [value]);

    // 默认展开 Custom 和 Person，以及当前选中值所属的分类
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
        const defaults = new Set(['Custom (自定义)', 'Person (人物)']);
        if (selectedStrategy) {
            defaults.add(selectedStrategy.category);
        }
        return defaults;
    });

    // 当 value 变化时（例如重置或自动匹配），确保对应的分类被展开，否则 Select 无法渲染该选项
    useEffect(() => {
        if (selectedStrategy && !expandedCategories.has(selectedStrategy.category)) {
            setExpandedCategories(prev => {
                const next = new Set(prev);
                next.add(selectedStrategy.category);
                return next;
            });
        }
    }, [selectedStrategy]);

    const grouped = useMemo(() => getGroupedStrategies(), []);
    
    // 构造扁平化列表 (用于 Select items)
    const flatItems = useMemo(() => {
        const items: FlatItem[] = [];
        
        // 排序 Categories (Custom first, then alphabetical)
        const categories = Object.keys(grouped).sort((a, b) => {
            if (a.startsWith('Custom')) return -1;
            if (b.startsWith('Custom')) return 1;
            return a.localeCompare(b);
        });

        categories.forEach(cat => {
            const isExpanded = expandedCategories.has(cat);
            items.push({
                key: `CAT_${cat}`,
                type: 'category',
                label: cat,
                value: `CAT_${cat}`, 
                isCompatible: true,
                level: 0,
                isExpanded
            });

            if (isExpanded) {
                grouped[cat].forEach(strat => {
                    items.push({
                        key: strat.value,
                        type: 'strategy',
                        label: strat.label,
                        value: strat.value,
                        isCompatible: isStrategyCompatible(strat.value, odataType),
                        level: 1,
                        strategy: strat
                    });
                });
            }
        });

        return items;
    }, [grouped, expandedCategories, odataType]);

    const isCurrentCompatible = selectedStrategy ? isStrategyCompatible(value, odataType) : true;

    const toggleCategory = (catName: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(catName)) next.delete(catName);
            else next.add(catName);
            return next;
        });
    };

    return (
        <Select 
            aria-label={label || "Select Strategy"}
            size="sm" 
            variant="faded" 
            selectedKeys={selectedStrategy ? [selectedStrategy.value] : []}
            onSelectionChange={(keys) => {
                const k = Array.from(keys)[0] as string;
                if (k && !k.startsWith('CAT_')) onChange(k);
            }}
            selectionMode="single"
            disallowEmptySelection
            classNames={{ 
                trigger: "h-8 min-h-8 px-2", 
                value: `text-[11px] ${!isCurrentCompatible ? 'text-warning-600 font-medium' : ''}` 
            }}
            items={flatItems}
            renderValue={() => {
                if (!selectedStrategy) return <span>Select...</span>;
                return (
                    <div className="flex items-center gap-1">
                        {!isCurrentCompatible && <AlertTriangle size={12} className="text-warning" />}
                        <span>{selectedStrategy.label}</span>
                    </div>
                );
            }}
        >
            {(item) => {
                if (item.type === 'category') {
                    return (
                        <SelectItem 
                            key={item.key} 
                            textValue={item.label}
                            className="font-bold text-default-600 bg-default-50 sticky top-0 z-10 p-0 rounded-none border-b border-divider/50 data-[hover=true]:bg-default-100 outline-none"
                            isReadOnly
                        >
                            <div 
                                className="flex items-center gap-2 w-full h-full py-2 px-3 cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleCategory(item.label);
                                }}
                            >
                                <div className="text-default-400">
                                    {item.isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                                </div>
                                <span className="text-[11px] uppercase tracking-wider select-none">{item.label}</span>
                            </div>
                        </SelectItem>
                    );
                }
                
                // 构建 Tooltip 内容
                const tooltipContent = item.strategy?.type === 'faker' 
                    ? `faker.${item.strategy.fakerModule}.${item.strategy.fakerMethod}()`
                    : (item.strategy?.type === 'custom.increment' 
                        ? 'Auto-incrementing number/string (e.g. 1, 2, 3...)'
                        : 'Fixed value logic');

                return (
                    <SelectItem key={item.key} value={item.key} textValue={item.label}>
                         <Tooltip 
                            content={<span className="font-mono text-[10px]">{tooltipContent}</span>} 
                            placement="right" 
                            delay={300}
                            closeDelay={0}
                        >
                            <div className="flex justify-between items-center w-full gap-2 pl-6">
                                <span className={`text-[11px] ${!item.isCompatible ? 'text-default-400 line-through decoration-default-300' : ''}`}>
                                    {item.label}
                                </span>
                                {!item.isCompatible && (
                                    <Chip size="sm" color="warning" variant="flat" className="h-4 text-[9px] px-1 min-w-min">
                                        Type mismatch
                                    </Chip>
                                )}
                            </div>
                        </Tooltip>
                    </SelectItem>
                );
            }}
        </Select>
    );
};
