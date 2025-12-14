// Optimized Content Display Component
// Renders HTML or Markdown content with copy functionality

import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface OptimizedContentDisplayProps {
    content: string;
}

export const OptimizedContentDisplay = ({ content }: OptimizedContentDisplayProps) => {
    const [copied, setCopied] = useState(false);

    // Detect if content is HTML (contains HTML tags) or Markdown
    const isHtml = useMemo(() => {
        // Check for common HTML tags
        const htmlTagPattern = /<(h[1-6]|p|div|ul|ol|li|strong|em|br|a|span|table|tr|td|th)[^>]*>/i;
        return htmlTagPattern.test(content);
    }, [content]);

    // Preprocess markdown to fix common formatting issues from AI
    const processedContent = useMemo(() => {
        if (isHtml) return content;

        let processed = content;

        // Fix inline list items: "text * **item:** text" -> "text\n\n* **item:** text"
        // This pattern matches: space or colon, then * **, then text until next * ** or end
        processed = processed.replace(/([.:]) \* \*\*/g, '$1\n\n* **');

        // Also handle numbered lists: "text 1. **item:**" -> "text\n\n1. **item:**"
        processed = processed.replace(/([.:]) (\d+)\. \*\*/g, '$1\n\n$2. **');

        // Fix standalone bullet points without newlines
        processed = processed.replace(/ \* \*\*/g, '\n* **');

        return processed;
    }, [content, isHtml]);

    const handleCopy = async () => {
        try {
            // Copy plain text (strip HTML/Markdown)
            let plainText = content;
            if (isHtml) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content;
                plainText = tempDiv.textContent || tempDiv.innerText || '';
            } else {
                // Strip markdown formatting
                plainText = content
                    .replace(/#{1,6}\s?/g, '') // Remove headers
                    .replace(/\*\*/g, '')      // Remove bold
                    .replace(/\*/g, '')        // Remove italic
                    .replace(/`/g, '');        // Remove code
            }
            await navigator.clipboard.writeText(plainText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-white">Nội dung đã tối ưu</CardTitle>
                        <CardDescription className="text-slate-400">Nội dung được tạo bởi AI và tối ưu cho SEO</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="flex items-center gap-2 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
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
                <div className="prose prose-sm prose-invert max-w-none prose-headings:text-white prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-p:text-slate-300 prose-p:my-2 prose-strong:text-white prose-li:text-slate-300 prose-ul:my-2 prose-ol:my-2">
                    {isHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                        <ReactMarkdown>{processedContent}</ReactMarkdown>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
