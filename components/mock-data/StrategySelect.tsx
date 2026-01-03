
import React, { useMemo, useState } from 'react';
import { Select, SelectItem, Chip } from "@nextui-org/react";
import { ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react';
import { 
    ALL_STRATEGIES, 
    getGroupedStrategies, 
    isStrategyCompatible 
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
}

export const StrategySelect: React.FC<StrategySelectProps> = ({ value, onChange, odataType, label }) => {
    // 管理展开的类别
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Custom (自定义)', 'Person (人)'])); // 默认展开常用

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
            // 1. Category Header
            items.push({
                key: `CAT_${cat}`,
                type: 'category',
                label: cat,
                value: `CAT_${cat}`, // Dummy value
                isCompatible: true,
                level: 0,
                isExpanded
            });

            // 2. Strategies (if expanded)
            if (isExpanded) {
                grouped[cat].forEach(strat => {
                    items.push({
                        key: strat.value,
                        type: 'strategy',
                        label: strat.label,
                        value: strat.value,
                        isCompatible: isStrategyCompatible(strat.value, odataType),
                        level: 1
                    });
                });
            }
        });

        return items;
    }, [grouped, expandedCategories, odataType]);

    // 获取当前选中的完整对象
    const selectedStrategy = ALL_STRATEGIES.find(s => s.value === value);
    const isCurrentCompatible = selectedStrategy ? isStrategyCompatible(value, odataType) : true;

    // 处理选择变更
    const handleSelectionChange = (keys: any) => {
        const selectedKey = Array.from(keys)[0] as string;
        if (!selectedKey) return;

        // 如果点击的是类别 -> 切换展开
        if (selectedKey.startsWith('CAT_')) {
            const catName = selectedKey.replace('CAT_', '');
            setExpandedCategories(prev => {
                const next = new Set(prev);
                if (next.has(catName)) next.delete(catName);
                else next.add(catName);
                return next;
            });
            // 不触发 onChange，保持原值
        } else {
            // 点击的是策略 -> 选中
            onChange(selectedKey);
        }
    };

    return (
        <Select 
            aria-label={label || "Select Strategy"}
            size="sm" 
            variant="faded" 
            selectedKeys={selectedStrategy ? [selectedStrategy.value] : []}
            onSelectionChange={handleSelectionChange}
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
                            value={item.key}
                            textValue={item.label}
                            className="font-bold text-default-600 bg-default-50 sticky top-0 z-10"
                        >
                            <div className="flex items-center gap-1">
                                {item.isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                                <span className="text-[11px] uppercase tracking-wider">{item.label}</span>
                            </div>
                        </SelectItem>
                    );
                }
                
                return (
                    <SelectItem key={item.key} value={item.key} textValue={item.label}>
                        <div className="flex justify-between items-center w-full gap-2 pl-4">
                            <span className={`text-[11px] ${!item.isCompatible ? 'text-default-400 line-through decoration-default-300' : ''}`}>
                                {item.label}
                            </span>
                            {!item.isCompatible && (
                                <Chip size="sm" color="warning" variant="flat" className="h-4 text-[9px] px-1 min-w-min">
                                    Type mismatch
                                </Chip>
                            )}
                        </div>
                    </SelectItem>
                );
            }}
        </Select>
    );
};
