
import React from 'react';
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { Copy, Play } from 'lucide-react';

interface UrlBarProps {
    generatedUrl: string;
    setGeneratedUrl: (url: string) => void;
    loading: boolean;
    onRun: () => void;
    onCopyCode: () => void;
}

export const UrlBar: React.FC<UrlBarProps> = ({ generatedUrl, setGeneratedUrl, loading, onRun, onCopyCode }) => {
    return (
        <div className="flex gap-2 items-center bg-slate-50 dark:bg-content2 p-2 rounded-lg border border-slate-300 dark:border-divider shrink-0 shadow-sm">
            <Chip size="sm" color="primary" variant="flat" className="shrink-0 font-bold">GET</Chip>
            <Input
                value={generatedUrl}
                onValueChange={setGeneratedUrl}
                size="sm"
                variant="flat"
                className="font-mono text-sm"
                classNames={{ 
                    inputWrapper: "bg-white dark:bg-content1 shadow-none border border-slate-200 dark:border-transparent" 
                }}
            />
            <Button isIconOnly size="sm" variant="light" onPress={onCopyCode} title="复制 SAPUI5 代码">
                <Copy size={16} className="text-slate-500 dark:text-default-500" />
            </Button>
            <Button color="primary" size="sm" onPress={onRun} isLoading={loading} startContent={<Play size={16} />} className="shadow-md shadow-primary/20">
                运行查询
            </Button>
        </div>
    );
};
