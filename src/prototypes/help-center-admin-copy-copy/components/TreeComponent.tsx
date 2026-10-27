import React, { useState, useRef, useCallback } from 'react';
import type { TreeNode } from '../types';

/**
 * 树形组件交互说明：
 * 
 * 【节点选中】
 * - 点击任意节点时，该节点高亮选中
 * - 右侧面板行为：
 *   - 有子节点的节点（父节点）：不显示富文本编辑器，显示空状态提示
 *   - 没有子节点的节点（叶节点）：显示富文本编辑器
 * 
 * 【删除按钮显示规则】
 * - 仅叶节点（没有子节点的节点）显示删除按钮
 * - 有子节点的父节点不显示删除按钮（需先删除所有子节点才能删除父节点）
 * 
 * 【关联帮助文档图标】
 * - 节点名称后显示 📄 图标表示该节点有关联帮助文档内容
 * - 仅当节点的 hasContent 属性为 true 时显示
 * 
 * 【添加子模块】
 * - 所有节点都显示"添加子模块"按钮
 * - 如果当前节点已有关联帮助文档（hasContent=true），点击时弹出提示：
 *   "当前节点已有关联帮助文档，如需添加子节点，请先删除关联的内容"
 * - 如果当前节点没有帮助文档，弹出输入框，输入名称后添加为子节点
 * - 添加子节点后，自动展开父节点
 * 
 * 【拖放逻辑】
 * - 所有节点都支持拖拽
 * - 拖放到有帮助文档的节点时：弹出提示"已经有关联帮助文档，如需拖放到该节点，需要先删除帮助文档"
 * - 拖拽位置判断：
 *   - 上方1/3区域：放置在目标节点之前
 *   - 中间1/3区域：放入目标节点内部（作为子节点）
 *   - 下方1/3区域：放置在目标节点之后
 * 
 * 【搜索功能】
 * - 输入关键词实时过滤节点
 * - 匹配节点名称或其子节点名称
 * - 点击×清除搜索内容
 */

interface TreeComponentProps {
    data: TreeNode[];
    selectedNodeId: string | null;
    expandedNodeIds: string[];
    searchKeyword: string;
    onSelect: (nodeId: string) => void;
    onToggleExpand: (nodeId: string) => void;
    onAddNode: (parentId: string | null, label: string) => void;
    onEditNode: (nodeId: string, label: string) => void;
    onDeleteNode: (nodeId: string) => void;
    onMoveNode: (nodeId: string, targetNodeId: string, position: 'before' | 'inside' | 'after') => void;
    onSearch: (keyword: string) => void;
    onAddChildClick: (nodeId: string) => void;
    onEditClick: (nodeId: string) => void;
    onDeleteClick: (nodeId: string) => void;
}

export function TreeComponent({
    data,
    selectedNodeId,
    expandedNodeIds,
    searchKeyword,
    onSelect,
    onToggleExpand,
    onAddNode,
    onMoveNode,
    onSearch,
    onAddChildClick,
    onEditClick,
    onDeleteClick,
}: TreeComponentProps) {
    const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
    const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);
    const [dragPosition, setDragPosition] = useState<'before' | 'inside' | 'after'>('after');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleDragStart = (e: React.DragEvent, nodeId: string) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', nodeId);
        setDraggedNodeId(nodeId);
    };

    const handleDragOver = (e: React.DragEvent, nodeId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const y = e.clientY;

        if (y < midY - 10) {
            setDragPosition('before');
        } else if (y > midY + 10) {
            setDragPosition('after');
        } else {
            setDragPosition('inside');
        }

        setDragOverNodeId(nodeId);
    };

    const handleDragLeave = () => {
        setDragOverNodeId(null);
        setDragPosition('after');
    };

    const handleDrop = (e: React.DragEvent, targetNodeId: string) => {
        e.preventDefault();
        const sourceNodeId = e.dataTransfer.getData('text/plain');

        if (sourceNodeId === targetNodeId) {
            setDraggedNodeId(null);
            setDragOverNodeId(null);
            return;
        }

        // 传递拖放位置：before, inside, after
        onMoveNode(sourceNodeId, targetNodeId, dragPosition);
        setDraggedNodeId(null);
        setDragOverNodeId(null);
        setDragPosition('after');
    };

    const handleDragEnd = () => {
        setDraggedNodeId(null);
        setDragOverNodeId(null);
        setDragPosition('after');
    };

    const hasChildren = (node: TreeNode): boolean => {
        return !!(node.children && node.children.length > 0);
    };

    const isLeaf = (node: TreeNode): boolean => {
        return !hasChildren(node);
    };

    const matchesSearch = (node: TreeNode): boolean => {
        if (!searchKeyword) return true;
        const keyword = searchKeyword.toLowerCase();
        if (node.label.toLowerCase().includes(keyword)) return true;
        if (node.children) {
            return node.children.some(child => matchesSearch(child));
        }
        return false;
    };

    const renderNode = (node: TreeNode, level: number = 0) => {
        if (!matchesSearch(node)) return null;

        const isExpanded = expandedNodeIds.includes(node.id);
        const isSelected = selectedNodeId === node.id;
        const isDragged = draggedNodeId === node.id;
        const isDragOver = dragOverNodeId === node.id;
        const nodeHasChildren = hasChildren(node);
        const nodeIsLeaf = isLeaf(node);

        return (
            <div key={node.id} className="tree-node-container">
                <div
                    className={`tree-node ${isSelected ? 'is-selected' : ''} ${isDragged ? 'is-dragged' : ''} ${isDragOver ? `is-drag-over drag-${dragPosition}` : ''} ${node.disabled ? 'tree-node-disabled' : ''}`}
                    style={{ paddingLeft: `${12 + level * 20}px` }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.id)}
                    onDragOver={(e) => handleDragOver(e, node.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, node.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelect(node.id)}
                >
                    <span className="tree-node-drag-handle">⋮⋮</span>
                    {nodeHasChildren && (
                        <span
                            className={`tree-node-expand ${isExpanded ? 'is-expanded' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleExpand(node.id);
                            }}
                        >
                            ▶
                        </span>
                    )}
                    {!nodeHasChildren && <span className="tree-node-expand-placeholder" />}
                    <span className="tree-node-label">{node.label}</span>
                    {node.hasContent && <span className="tree-node-content-badge">📄</span>}
                    <span className="tree-node-actions">
                        <button
                            className="tree-node-action-btn"
                            title="添加子模块"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddChildClick(node.id);
                            }}
                        >
                            添加子模块
                        </button>
                        <button
                            className="tree-node-action-btn"
                            title="编辑"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditClick(node.id);
                            }}
                        >
                            编辑
                        </button>
                        {nodeIsLeaf && (
                            <button
                                className="tree-node-action-btn tree-node-action-btn--danger"
                                title="删除"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteClick(node.id);
                                }}
                            >
                                删除
                            </button>
                        )}
                    </span>
                </div>
                {isExpanded && nodeHasChildren && (
                    <div className="tree-node-children">
                        {node.children!.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="tree-component">
            <div className="tree-search">
                <input
                    ref={searchInputRef}
                    className="tree-search-input"
                    type="text"
                    placeholder="搜索节点..."
                    value={searchKeyword}
                    onChange={(e) => onSearch(e.target.value)}
                />
                {searchKeyword && (
                    <button
                        className="tree-search-clear"
                        onClick={() => {
                            onSearch('');
                            searchInputRef.current?.focus();
                        }}
                    >
                        ×
                    </button>
                )}
            </div>
            <div className="tree-content">
                {data.map(node => renderNode(node, 0))}
                {data.length === 0 && (
                    <div className="tree-empty">暂无数据</div>
                )}
            </div>
        </div>
    );
}
