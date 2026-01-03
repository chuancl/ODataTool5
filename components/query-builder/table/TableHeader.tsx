
import React from 'react';
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { Trash, Save, Pencil, Check, X, Plus } from 'lucide-react';

interface TableHeaderProps {
    isRoot: boolean;
    isEditing: boolean;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onConfirmUpdate: () => void;
    onDelete: () => void;
    onExport: () => void;
    // New Props for customization
    onCreate?: () => void;
    enableEdit?: boolean;
    enableDelete?: boolean;
    hideUpdateButton?: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
    isRoot,
    isEditing,
    onStartEdit,
    onCancelEdit,
    onConfirmUpdate,
    onDelete,
    onExport,
    onCreate,
    enableEdit = true,
    enableDelete = true,
    hideUpdateButton = false
}) => {
    // 如果不是根表，不显示任何操作按钮和表头条
    // Sub-tables should not show modify/delete/export buttons.
    if (!isRoot) return null;

    return (
        <div className="bg-default-50 p-2 flex gap-2 border-b border-divider items-center justify-between shrink-0 h-12">
             <div className="flex items-center gap-2">
                {/* Header Left Content */}
                {isEditing && (
                    <Chip size="sm" color="warning" variant="flat" className="animate-pulse">编辑模式 (Editing)</Chip>
                )}
             </div>
             
             <div className="flex gap-2">
                 {/* Create Button (Moved to Right Group) */}
                {onCreate && (
                    <Button size="sm" color="primary" variant="solid" onPress={onCreate} startContent={<Plus size={14} />}>
                        新增选中 (Create Selected)
                    </Button>
                )}

                {/* 1. Modify Button: Show only if enabled and not editing */}
                {enableEdit && !isEditing && (
                    <Button size="sm" variant="flat" onPress={onStartEdit} startContent={<Pencil size={14} />}>
                        修改 (Modify)
                    </Button>
                )}

                {/* 2. Update/Cancel Buttons: Show only when editing */}
                {enableEdit && isEditing && (
                    <>
                        {!hideUpdateButton && (
                            <Button size="sm" color="success" variant="solid" className="text-white" onPress={onConfirmUpdate} startContent={<Check size={14} />}>
                                更新 (Update)
                            </Button>
                        )}
                        <Button size="sm" color="default" variant="flat" onPress={onCancelEdit} startContent={<X size={14} />}>
                            取消 (Cancel)
                        </Button>
                    </>
                )}
                
                {/* 3. Delete Button: Show only if enabled */}
                {enableDelete && (
                    <Button size="sm" color="danger" variant="light" onPress={onDelete} startContent={<Trash size={14} />}>
                        删除 (Delete)
                    </Button>
                )}

                {/* 4. Export Button: Always show */}
                <Button size="sm" color="primary" variant="light" onPress={onExport} startContent={<Save size={14} />}>
                    导出 Excel
                </Button>
            </div>
        </div>
    );
};