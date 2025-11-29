// Optimized Content Display Component
// Renders markdown content with copy functionality

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface OptimizedContentDisplayProps {
    content: string;
}

export const OptimizedContentDisplay = ({ content }: OptimizedContentDisplayProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Nội dung đã tối ưu</CardTitle>
                        <CardDescription>Nội dung được tạo bởi AI và tối ưu cho SEO</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="flex items-center gap-2"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4" />
                                Đã sao chép
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                Sao chép
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </CardContent>
        </Card>
    );
};
