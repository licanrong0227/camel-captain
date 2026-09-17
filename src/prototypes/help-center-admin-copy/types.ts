// ====== 树节点数据结构 ======
export interface TreeNode {
    id: string;
    label: string;
    children?: TreeNode[];
    hasContent?: boolean;
    content?: string;
    disabled?: boolean;
}

// ====== 页面状态 ======
export interface PageState {
    treeData: TreeNode[];
    selectedNodeId: string | null;
    expandedNodeIds: string[];
    searchKeyword: string;
}

// ====== 弹窗类型 ======
export type DialogType = 'add' | 'edit' | 'delete' | null;

// ====== 弹窗状态 ======
export interface DialogState {
    type: DialogType;
    nodeId: string | null;
    value: string;
    enabled?: boolean;
}
