import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowDown } from 'lucide-react';
import { RoleNode } from './types';

interface Props {
  node: RoleNode;
  depth?: number;
}

export default function HierarchyNode({ node, depth = 0 }: Props) {
  return (
    <div className="flex flex-col items-center">
      {/* Node card */}
      <div className={`relative rounded-xl border-2 ${node.border} ${node.bg} p-4 w-full max-w-xs text-center shadow-sm`}>
        <p className={`text-sm font-bold ${node.color}`}>{node.label}</p>
        <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
        <div className="mt-2 flex flex-wrap gap-1 justify-center">
          {node.features.map((f) => (
            <Badge key={f} variant="secondary" className="text-[10px] px-1.5 py-0">{f}</Badge>
          ))}
        </div>
      </div>

      {/* Connector + children */}
      {node.children && node.children.length > 0 && (
        <>
          <div className="w-px h-6 bg-border" />
          <ArrowDown className="w-4 h-4 text-muted-foreground -mt-1 -mb-1" />
          <div className="w-px h-2 bg-border" />
          {node.children.map((child) => (
            <HierarchyNode key={child.role} node={child} depth={depth + 1} />
          ))}
        </>
      )}
    </div>
  );
}
