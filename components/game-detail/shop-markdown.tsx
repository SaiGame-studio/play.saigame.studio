"use client";

import { createElement, useId, useMemo, type HTMLAttributes } from "react";
import ReactMarkdown, { type Components, type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";

interface ShopMarkdownProps {
  id: string;
  children: string;
  className: string;
  compact?: boolean;
}

const tags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "em", "del", "ul", "ol", "li", "a", "img", "blockquote", "pre", "code", "hr", "br", "table", "thead", "tbody", "tr", "th", "td", "input"];

/** Render stored Markdown without interpreting raw HTML. */
export function ShopMarkdown({ id, children, className, compact = false }: ShopMarkdownProps) {
  const components = useMemo(() => Object.fromEntries(tags.map((tag) => [tag,
    function MarkdownNode({ node: _node, className: elementClass, ...props }: HTMLAttributes<HTMLElement> & ExtraProps & { href?: string }) {
      const suffix = useId().replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
      const elementId = `${id}-${tag}-${suffix}`;
      const elementTag = compact && tag === "a" ? "span" : tag;
      if (compact && tag === "a") delete props.href;
      return createElement(elementTag, { ...props, id: elementId, className: `${elementId} shop-markdown-${tag} ${elementClass ?? ""}` });
    },
  ])) as Components, [id, compact]);

  return (
    <div id={id} className={`${className} shop-markdown min-w-0 break-words [&_p]:whitespace-pre-line [&_p+p]:mt-2 [&_h1]:mt-2 [&_h1]:text-xl [&_h2]:mt-2 [&_h2]:text-lg [&_h3]:mt-2 [&_h3]:text-base [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_h4]:font-semibold [&_h5]:font-semibold [&_h6]:font-semibold [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_img]:my-2 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded [&_table]:my-2 [&_table]:w-full [&_th]:border [&_th]:border-border [&_th]:p-1 [&_td]:border [&_td]:border-border [&_td]:p-1 [&_hr]:my-3`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>{children}</ReactMarkdown>
    </div>
  );
}
