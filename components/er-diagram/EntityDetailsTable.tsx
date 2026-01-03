
import React, { useMemo, useState } from 'react';
import { EntityProperty } from '@/utils/odata-helper';
import { Key, Link2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, createColumnHelper, SortingState, ColumnOrderState } from '@tanstack/react-table';

export const EntityDetailsTable = ({ 
    properties, 
    keys, 
    getFkInfo,
    onJumpToEntity,
    onFocus
}: { 
    properties: EntityProperty[], 
    keys: string[], 
    getFkInfo: (name: string) => any,
    onJumpToEntity: (name: string) => void,
    onFocus?: () => void
}) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(['name', 'type', 'size', 'attributes', 'defaultValue', 'relation']);
    const [draggingColumn, setDraggingColumn] = useState<string | null>(null);

    const columnHelper = createColumnHelper<EntityProperty>();

    const columns = useMemo(() => [
        // 1. Name Column
        columnHelper.accessor('name', {
            id: 'name',
            header: 'Field',
            enableSorting: true,
            minSize: 110,
            cell: info => {
                const isKey = keys.includes(info.getValue());
                return (
                    <div className="flex items-center gap-2">
                        {isKey ? <Key size={14} className="text-orange-600 dark:text-warning shrink-0" /> : <div className="w-3.5" />}
                        <span className={`${isKey ? "font-bold text-foreground" : "text-slate-700 dark:text-default-700"} text-xs`}>
                            {info.getValue()}
                        </span>
                    </div>
                );
            }
        }),

        // 2. Type Column
        columnHelper.accessor('type', {
            id: 'type',
            header: 'Type',
            enableSorting: true,
            size: 100,
            cell: info => <span className="font-mono text-xs text-primary/80">{info.getValue().split('.').pop()}</span>
        }),

        // 3. Size/Precision Column
        columnHelper.accessor(row => row.maxLength || row.precision || 0, {
            id: 'size',
            header: 'Size',
            enableSorting: true,
            size: 70,
            cell: info => {
                const p = info.row.original;
                if (p.maxLength) return <span className="font-mono text-xs text-slate-500 dark:text-default-500">{p.maxLength}</span>;
                if (p.precision) return <span className="font-mono text-xs text-slate-500 dark:text-default-500">{p.precision}{p.scale !== undefined ? `,${p.scale}` : ''}</span>;
                return <span className="text-slate-300 dark:text-default-300 text-xs">-</span>;
            }
        }),

        // 4. Attributes Column
        columnHelper.accessor(row => `${row.nullable}${row.unicode}${row.fixedLength}${row.concurrencyMode}`, {
            id: 'attributes',
            header: 'Attributes',
            enableSorting: false, 
            size: 180,
            cell: info => {
                const p = info.row.original;
                return (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Nullable status */}
                        {!p.nullable && (
                            <span title="Field is Required (Not Null)" className="px-1.5 py-0.5 rounded-[4px] bg-red-50 dark:bg-danger/10 text-red-700 dark:text-danger text-[10px] font-semibold border border-red-200 dark:border-danger/20">Required</span>
                        )}
                        
                        {/* Fixed Length */}
                        {p.fixedLength && (
                             <span title="Fixed Length String/Binary" className="px-1.5 py-0.5 rounded-[4px] bg-slate-100 dark:bg-default-100 text-slate-600 dark:text-default-600 text-[10px] font-medium border border-slate-200 dark:border-default-200">Fixed Length</span>
                        )}

                        {/* Unicode Status */}
                        {p.unicode === false ? (
                             <span title="Non-Unicode (ANSI)" className="px-1.5 py-0.5 rounded-[4px] bg-orange-50 dark:bg-warning/10 text-orange-700 dark:text-warning-700 text-[10px] font-medium border border-orange-200 dark:border-warning/20">Non-Unicode</span>
                        ) : (
                             <span title="Unicode Enabled" className="px-1.5 py-0.5 rounded-[4px] bg-blue-50 dark:bg-primary/5 text-blue-700 dark:text-primary/70 text-[10px] font-medium border border-blue-100 dark:border-primary/10">Unicode</span>
                        )}

                        {/* Concurrency */}
                        {p.concurrencyMode === 'Fixed' && (
                            <span title="Optimistic Concurrency Control" className="px-1.5 py-0.5 rounded-[4px] bg-green-50 dark:bg-success/10 text-green-700 dark:text-success-700 text-[10px] font-medium border border-green-200 dark:border-success/20">Concurrency</span>
                        )}
                    </div>
                );
            }
        }),

        // 5. Default Value
        columnHelper.accessor('defaultValue', {
            id: 'defaultValue',
            header: 'Default',
            enableSorting: true,
            size: 90,
            cell: info => info.getValue() ? <span className="font-mono text-xs bg-slate-50 dark:bg-default-50 px-1 rounded border border-slate-200 dark:border-default-100 text-slate-600 dark:text-default-600 max-w-[80px] truncate block" title={info.getValue()}>{info.getValue()}</span> : <span className="text-slate-200 dark:text-default-200 text-xs">-</span>
        }),

        // 6. Relation Column
        columnHelper.display({
            id: 'relation',
            header: 'Relation',
            size: 200,
            cell: info => {
                const fk = getFkInfo(info.row.original.name);
                if (!fk) return null;
                return (
                    <div className="flex items-center gap-1 text-xs w-full group">
                        <Link2 size={12} className="text-purple-600 dark:text-secondary shrink-0" />
                        <div className="flex items-center gap-0.5 overflow-hidden">
                            <span 
                                className="font-bold text-purple-600 dark:text-secondary cursor-pointer hover:underline hover:text-purple-800 dark:hover:text-secondary-600 truncate" 
                                // STRATEGY: 
                                // 1. Stop propagation on MouseDown. This prevents the Root 'onMouseDown' (which triggers Z-index update) 
                                //    from firing immediately. This PROTECTS the link click from being killed by a re-render race condition.
                                onMouseDown={(e) => e.stopPropagation()}
                                // 2. Handle Jump AND manually trigger Z-index update (onFocus) on Click.
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onFocus?.(); 
                                    onJumpToEntity(fk.targetEntity); 
                                }}
                                title={`Jump to Entity: ${fk.targetEntity}`}
                            >
                                {fk.targetEntity}
                            </span>
                            <span className="text-slate-400 dark:text-default-400">.</span>
                            <span className="font-mono text-slate-600 dark:text-default-600 truncate" title={`Target Field: ${fk.targetProperty}`}>{fk.targetProperty}</span>
                        </div>
                    </div>
                );
            }
        })

    ], [keys, getFkInfo, onJumpToEntity, onFocus]);

    const table = useReactTable({
        data: properties,
        columns,
        state: { sorting, columnOrder },
        onSortingChange: setSorting,
        onColumnOrderChange: setColumnOrder,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
    });

    return (
        <div className="w-full h-full flex flex-col">
            <table className="w-full text-left border-collapse table-fixed">
                <thead className="sticky top-0 z-20 bg-slate-100/90 dark:bg-default-50/90 backdrop-blur-md shadow-sm border-b border-slate-300 dark:border-divider">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th 
                                    key={header.id} 
                                    className="relative p-2 py-3 text-xs font-bold text-slate-700 dark:text-default-600 uppercase tracking-wider select-none group border-r border-slate-200/50 dark:border-divider/10 hover:bg-slate-200 dark:hover:bg-default-100 transition-colors"
                                    style={{ width: header.getSize() }}
                                    draggable={!header.isPlaceholder}
                                    onDragStart={(e) => {
                                        setDraggingColumn(header.column.id);
                                        e.dataTransfer.effectAllowed = 'move';
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        if (draggingColumn && draggingColumn !== header.column.id) {
                                            const newOrder = [...columnOrder];
                                            const dragIndex = newOrder.indexOf(draggingColumn);
                                            const dropIndex = newOrder.indexOf(header.column.id);
                                            if (dragIndex !== -1 && dropIndex !== -1) {
                                                newOrder.splice(dragIndex, 1);
                                                newOrder.splice(dropIndex, 0, draggingColumn);
                                                setColumnOrder(newOrder);
                                            }
                                            setDraggingColumn(null);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-1 w-full">
                                        <GripVertical 
                                            size={12} 
                                            className="text-slate-400 dark:text-default-300 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" 
                                        />
                                        
                                        <div 
                                            className="flex items-center gap-1 cursor-pointer flex-1 overflow-hidden"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <span className="truncate">{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                            {{
                                                asc: <ChevronUp size={12} className="text-primary shrink-0" />,
                                                desc: <ChevronDown size={12} className="text-primary shrink-0" />,
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </div>
                                    </div>
                                    
                                    {/* Resizer Handle */}
                                    <div
                                        onMouseDown={header.getResizeHandler()}
                                        onTouchStart={header.getResizeHandler()}
                                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none hover:bg-primary/50 ${
                                            header.column.getIsResizing() ? 'bg-primary w-1.5' : 'bg-transparent'
                                        }`}
                                    />
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row, idx) => (
                        <tr 
                            key={row.id} 
                            className={`
                                border-b border-slate-200 dark:border-divider/40 last:border-0 transition-colors
                                hover:bg-blue-50 dark:hover:bg-primary/5
                                ${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-default-50/30'}
                            `}
                        >
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="p-2 text-xs h-10 border-r border-slate-100 dark:border-divider/20 last:border-r-0 align-middle overflow-hidden text-ellipsis">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {properties.length === 0 && <div className="p-8 text-center text-sm text-default-400">No properties found for this entity.</div>}
        </div>
    );
};
