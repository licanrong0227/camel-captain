/**
 * @name 帮助中心目录 - Admin管理系统
 * @mode axure
 *
 * 参考资料：
 * - rules/axure-export-workflow.md
 * - rules/prototype-development-guide.md
 * - rules/axure-api-guide.md
 */

import React, { useState, useRef, useCallback } from 'react';
import './style.css';
import { Breadcrumb } from './components/Breadcrumb';
import { TreeComponent } from './components/TreeComponent';
import { RichTextEditor } from './components/RichTextEditor';
import { Dialog } from './components/Dialog';
import type { TreeNode, DialogState } from './types';
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

// ====== SVG Icons ======
const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const BellIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
);

// ====== Navigation Data ======
const headerNavItems = [
    { id: 'home', label: '首页' },
    { id: 'system', label: '系统管理' },
    { id: 'member', label: '会员中心' },
    { id: 'tenant', label: '租户' },
    { id: 'logistics', label: '物流' },
    { id: 'operations', label: '运营', children: [
        { id: 'help-center', label: '帮助中心' },
    ]},
    { id: 'menu-user', label: '菜单及用户' },
    { id: 'settings', label: '设置' },
];

// ====== 初始树数据 ======
const initialTreeData: TreeNode[] = [
    {
        id: '1',
        label: '入门指南',
        children: [
            { id: '1-1', label: '快速开始' },
            { id: '1-2', label: '基础配置' },
        ],
    },
    {
        id: '2',
        label: '功能说明',
        children: [
            { id: '2-1', label: '订单管理' },
            { id: '2-2', label: '商品管理' },
            { id: '2-3', label: '用户管理' },
        ],
    },
    {
        id: '3',
        label: '常见问题',
        children: [
            { id: '3-1', label: '登录问题' },
            { id: '3-2', label: '支付问题' },
        ],
    },
];

// ====== 生成唯一ID ======
let idCounter = 100;
const generateId = () => String(++idCounter);

// ====== 查找节点 ======
const findNode = (data: TreeNode[], id: string): TreeNode | null => {
    for (const node of data) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNode(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

// ====== 查找父节点 ======
const findParentNode = (data: TreeNode[], id: string): TreeNode | null => {
    for (const node of data) {
        if (node.children) {
            if (node.children.some(child => child.id === id)) {
                return node;
            }
            const found = findParentNode(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

// ====== 删除节点 ======
const removeNode = (data: TreeNode[], id: string): TreeNode[] => {
    return data.filter(node => {
        if (node.id === id) return false;
        if (node.children) {
            node.children = removeNode(node.children, id);
        }
        return true;
    });
};

// ====== 添加节点 ======
const addNode = (data: TreeNode[], parentId: string | null, newNode: TreeNode): TreeNode[] => {
    if (parentId === null) {
        return [...data, newNode];
    }
    return data.map(node => {
        if (node.id === parentId) {
            return {
                ...node,
                children: [...(node.children || []), newNode],
            };
        }
        if (node.children) {
            return {
                ...node,
                children: addNode(node.children, parentId, newNode),
            };
        }
        return node;
    });
};

// ====== 更新节点 ======
const updateNode = (data: TreeNode[], id: string, updates: Partial<TreeNode>): TreeNode[] => {
    return data.map(node => {
        if (node.id === id) {
            return { ...node, ...updates };
        }
        if (node.children) {
            return {
                ...node,
                children: updateNode(node.children, id, updates),
            };
        }
        return node;
    });
};

// ====== 移动节点 ======
const moveNode = (data: TreeNode[], sourceId: string, targetId: string, position: 'before' | 'inside' | 'after'): TreeNode[] => {
    const sourceNode = findNode(data, sourceId);
    if (!sourceNode) return data;

    let newData = removeNode(data, sourceId);

    if (position === 'inside') {
        newData = addNode(newData, targetId, sourceNode);
    } else {
        const targetParent = findParentNode(data, targetId);
        if (targetParent) {
            const targetIndex = targetParent.children!.findIndex(c => c.id === targetId);
            const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
            targetParent.children!.splice(insertIndex, 0, sourceNode);
        } else {
            const targetIndex = newData.findIndex(n => n.id === targetId);
            const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
            newData.splice(insertIndex, 0, sourceNode);
        }
    }

    return newData;
};

// ====== 递归禁用所有子孙节点 ======
const disableAllDescendants = (children: TreeNode[] | undefined): TreeNode[] | undefined => {
    if (!children) return undefined;
    return children.map(child => ({
        ...child,
        disabled: true,
        children: disableAllDescendants(child.children),
    }));
};

const disableChildren = (data: TreeNode[], nodeId: string): TreeNode[] => {
    return data.map(node => {
        if (node.id === nodeId) {
            return {
                ...node,
                disabled: true,
                children: disableAllDescendants(node.children),
            };
        }
        if (node.children) {
            return {
                ...node,
                children: disableChildren(node.children, nodeId),
            };
        }
        return node;
    });
};

// ====== 递归启用所有父节点 ======
const enableParents = (data: TreeNode[], nodeId: string): TreeNode[] => {
    // 找到节点的所有父节点
    const findParentIds = (nodes: TreeNode[], targetId: string, parents: string[] = []): string[] | null => {
        for (const node of nodes) {
            if (node.id === targetId) {
                return parents;
            }
            if (node.children) {
                const result = findParentIds(node.children, targetId, [...parents, node.id]);
                if (result) return result;
            }
        }
        return null;
    };

    const parentIds = findParentIds(data, nodeId);
    if (!parentIds) return data;

    // 启用所有父节点
    let newData = data;
    for (const parentId of parentIds) {
        newData = updateNode(newData, parentId, { disabled: false });
    }
    return newData;
};

const Component = function App() {
    const [activeNav, setActiveNav] = useState('operations');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 树状态
    const [treeData, setTreeData] = useState<TreeNode[]>(initialTreeData);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>(['1', '2', '3']);
    const [searchKeyword, setSearchKeyword] = useState('');

    // 弹窗状态
    const [dialogState, setDialogState] = useState<DialogState>({
        type: null,
        nodeId: null,
        value: '',
    });

    // 拖拽提示弹窗
    const [dragAlertVisible, setDragAlertVisible] = useState(false);
    const [dragAlertMessage, setDragAlertMessage] = useState('');

    // 当前选中节点的内容
    const [nodeContents, setNodeContents] = useState<Record<string, string>>({});

    const handleNavMouseEnter = (itemId: string) => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        const item = headerNavItems.find(n => n.id === itemId);
        if (item?.children) {
            setOpenDropdown(itemId);
        }
    };

    const handleNavMouseLeave = () => {
        hoverTimerRef.current = setTimeout(() => setOpenDropdown(null), 150);
    };

    const handleDropdownMouseEnter = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };

    const handleDropdownMouseLeave = () => {
        hoverTimerRef.current = setTimeout(() => setOpenDropdown(null), 150);
    };

    // 树操作
    const handleSelectNode = useCallback((nodeId: string) => {
        setSelectedNodeId(nodeId);
    }, []);

    const handleToggleExpand = useCallback((nodeId: string) => {
        setExpandedNodeIds(prev =>
            prev.includes(nodeId)
                ? prev.filter(id => id !== nodeId)
                : [...prev, nodeId]
        );
    }, []);

    const handleAddNode = useCallback((parentId: string | null, label: string) => {
        const newNode: TreeNode = { id: generateId(), label };
        setTreeData(prev => addNode(prev, parentId, newNode));
        if (parentId) {
            setExpandedNodeIds(prev =>
                prev.includes(parentId) ? prev : [...prev, parentId]
            );
        }
    }, []);

    const handleEditNode = useCallback((nodeId: string, label: string) => {
        setTreeData(prev => updateNode(prev, nodeId, { label }));
    }, []);

    const handleDeleteNode = useCallback((nodeId: string) => {
        setTreeData(prev => removeNode(prev, nodeId));
        if (selectedNodeId === nodeId) {
            setSelectedNodeId(null);
        }
    }, [selectedNodeId]);

    /**
     * 拖放节点处理逻辑：
     * 
     * 【校验规则】
     * 1. 如果目标节点有关联帮助文档 → 弹窗提示"已经有关联帮助文档，如需拖放到该节点，需要先删除帮助文档"
     * 
     * 【允许的操作】
     * - 有帮助文档的叶节点可以在同级或不同级之间移动（作为兄弟节点）
     * - 没有帮助文档的节点可以移动到任何位置（作为兄弟或子节点）
     */
    const handleMoveNode = useCallback((nodeId: string, targetNodeId: string, position: 'before' | 'inside' | 'after') => {
        // 检查目标节点是否有内容（当作为子节点放入时）
        if (position === 'inside') {
            const targetNode = findNode(treeData, targetNodeId);
            if (targetNode?.hasContent) {
                setDragAlertMessage('已经有关联帮助文档，如需拖放到该节点，需要先删除帮助文档');
                setDragAlertVisible(true);
                return;
            }
        }

        // 对于 before/after，需要找到目标节点的父节点
        if (position === 'before' || position === 'after') {
            const targetParent = findParentNode(treeData, targetNodeId);
            const targetParentId = targetParent?.id || null;
            
            // 如果目标父节点有内容，不允许放入
            if (targetParentId) {
                const parentNode = findNode(treeData, targetParentId);
                if (parentNode?.hasContent) {
                    setDragAlertMessage('已经有关联帮助文档，如需拖放到该节点，需要先删除帮助文档');
                    setDragAlertVisible(true);
                    return;
                }
            }
        }

        setTreeData(prev => moveNode(prev, nodeId, targetNodeId, position));
    }, [treeData]);

    const handleSearch = useCallback((keyword: string) => {
        setSearchKeyword(keyword);
    }, []);

    /**
     * 弹窗操作说明：
     * 
     * 【添加子模块】
     * - 点击节点的"添加子模块"按钮时触发
     * - 如果当前节点有帮助文档 → 弹出提示弹窗"当前节点已有关联帮助文档，如需添加子节点，请先删除关联的内容"
     * - 如果当前节点没有帮助文档 → 弹出输入框，输入名称后添加为子节点
     * 
     * 【编辑节点】
     * - 点击节点的"编辑"按钮时触发
     * - 弹出输入框，预填当前节点名称，修改后保存
     * 
     * 【删除节点】
     * - 仅叶节点（没有子节点的节点）显示删除按钮
     * - 点击后弹出二次确认弹窗，确认后删除节点
     */
    const handleAddChildClick = useCallback((nodeId: string) => {
        const node = findNode(treeData, nodeId);
        if (node?.hasContent) {
            setDialogState({ type: 'confirm', nodeId, value: '' });
        } else {
            setDialogState({ type: 'add', nodeId, value: '' });
        }
    }, [treeData]);

    const handleEditClick = useCallback((nodeId: string) => {
        const node = findNode(treeData, nodeId);
        setDialogState({ type: 'edit', nodeId, value: node?.label || '', enabled: node?.disabled !== true });
    }, [treeData]);

    const handleDeleteClick = useCallback((nodeId: string) => {
        setDialogState({ type: 'delete', nodeId, value: '' });
    }, []);

    const handleAddRootClick = useCallback(() => {
        setDialogState({ type: 'add', nodeId: null, value: '' });
    }, []);

    const handleDialogConfirm = useCallback((value?: string, enabled?: boolean) => {
        if (dialogState.type === 'add' && value) {
            handleAddNode(dialogState.nodeId, value);
        } else if (dialogState.type === 'edit' && value && dialogState.nodeId) {
            handleEditNode(dialogState.nodeId, value);
            // 更新启用/禁用状态
            if (enabled !== undefined) {
                const newDisabled = !enabled;
                setTreeData(prev => {
                    let newData = updateNode(prev, dialogState.nodeId!, { disabled: newDisabled });
                    // 如果禁用父节点，连同子节点一起禁用
                    if (newDisabled) {
                        newData = disableChildren(newData, dialogState.nodeId!);
                    }
                    // 如果启用子节点，所有父级节点需要全部启用
                    if (!newDisabled) {
                        newData = enableParents(newData, dialogState.nodeId!);
                    }
                    return newData;
                });
            }
        } else if (dialogState.type === 'delete' && dialogState.nodeId) {
            handleDeleteNode(dialogState.nodeId);
        }
        setDialogState({ type: null, nodeId: null, value: '' });
    }, [dialogState, handleAddNode, handleEditNode, handleDeleteNode]);

    const handleDialogCancel = useCallback(() => {
        setDialogState({ type: null, nodeId: null, value: '' });
    }, []);

    // 富文本编辑器操作
    const handleSaveContent = useCallback((content: string) => {
        if (selectedNodeId) {
            setNodeContents(prev => ({ ...prev, [selectedNodeId]: content }));
            setTreeData(prev => updateNode(prev, selectedNodeId, { hasContent: true, content }));
        }
    }, [selectedNodeId]);

    const handleDeleteContent = useCallback(() => {
        if (selectedNodeId) {
            setNodeContents(prev => {
                const newContents = { ...prev };
                delete newContents[selectedNodeId];
                return newContents;
            });
            setTreeData(prev => updateNode(prev, selectedNodeId, { hasContent: false, content: undefined }));
        }
    }, [selectedNodeId]);

    const selectedNode = selectedNodeId ? findNode(treeData, selectedNodeId) : null;
    const selectedNodeContent = selectedNodeId ? nodeContents[selectedNodeId] || '' : '';

    return (
        <>
          <div className="admin-shell">
                      {/* ===== Top Header ===== */}
                      <header className="admin-header">
                          <div className="admin-header-logo">
                              <img
                                  className="admin-header-logo-icon"
                                  src="https://yfg-saas-test.oss-cn-shenzhen.aliyuncs.com/images/34/2026-08/fb37c061-e967-4584-94a6-5fc4e316ad15.png"
                                  alt="logo"
                              />
                              <span className="admin-header-logo-text">骆驼队长后台管理系统</span>
                              <span className="admin-header-divider">|</span>
                          </div>
                          <nav className="admin-header-nav">
                              {headerNavItems.map(item => (
                                  <div
                                      key={item.id}
                                      className="admin-header-nav-item-wrap"
                                      onMouseEnter={() => handleNavMouseEnter(item.id)}
                                      onMouseLeave={handleNavMouseLeave}
                                  >
                                      <button
                                          className={`admin-header-nav-item ${activeNav === item.id ? 'is-active' : ''}`}
                                          onClick={() => {
                                              if (!item.children) {
                                                  setActiveNav(item.id);
                                                  setOpenDropdown(null);
                                              }
                                          }}
                                      >
                                          {item.label}
                                      </button>
                                      {openDropdown === item.id && item.children && (
                                          <div
                                              className="admin-header-dropdown"
                                              onMouseEnter={handleDropdownMouseEnter}
                                              onMouseLeave={handleDropdownMouseLeave}
                                          >
                                              <div className="admin-header-dropdown-title">帮助中心</div>
                                              <div className="admin-header-dropdown-menu">
                                                  {item.children.map(child => (
                                                      <div
                                                          key={child.id}
                                                          className="admin-header-dropdown-item is-active"
                                                          onClick={() => {
                                                              setActiveNav(item.id);
                                                              setOpenDropdown(null);
                                                          }}
                                                      >
                                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                                                          </svg>
                                                          {child.label}
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              ))}
                          </nav>
                          <div className="admin-header-right">
                              <button className="admin-header-icon-btn" title="搜索">
                                  <SearchIcon />
                              </button>
                              <button className="admin-header-icon-btn" title="通知">
                                  <BellIcon />
                                  <span className="admin-header-badge" />
                              </button>
                              <div className="admin-header-avatar">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                      <circle cx="12" cy="7" r="4" />
                                  </svg>
                              </div>
                          </div>
                      </header>
          
                      {/* ===== 面包屑 ===== */}
                      <Breadcrumb items={['运营', '帮助中心', '帮助中心']} />
          
                      {/* ===== 主内容区 ===== */}
                      <div className="admin-main-content">
                          {/* 左侧树形组件 */}
                          <div className="admin-tree-panel">
                              <div className="admin-tree-header">
                                  <button className="admin-btn admin-btn--primary admin-btn--small" onClick={handleAddRootClick}>
                                      + 添加模块
                                  </button>
                              </div>
                              <TreeComponent
                                  data={treeData}
                                  selectedNodeId={selectedNodeId}
                                  expandedNodeIds={expandedNodeIds}
                                  searchKeyword={searchKeyword}
                                  onSelect={handleSelectNode}
                                  onToggleExpand={handleToggleExpand}
                                  onAddNode={handleAddNode}
                                  onEditNode={handleEditNode}
                                  onDeleteNode={handleDeleteNode}
                                  onMoveNode={handleMoveNode}
                                  onSearch={handleSearch}
                                  onAddChildClick={handleAddChildClick}
                                  onEditClick={handleEditClick}
                                  onDeleteClick={handleDeleteClick}
                              />
                          </div>
          
                          {/* 右侧内容区
                              显示规则：
                              - 选中叶节点（没有子节点的节点）→ 显示富文本编辑器
                              - 选中父节点（有子节点的节点）或未选中任何节点 → 显示空状态提示
                          */}
                          <div className="admin-content-panel">
                              {selectedNode && !selectedNode.children?.length ? (
                                  <RichTextEditor
                                      content={selectedNodeContent}
                                      onSave={handleSaveContent}
                                      onDelete={handleDeleteContent}
                                      hasContent={!!selectedNode.hasContent}
                                  />
                              ) : (
                                  <div className="admin-content-empty">
                                      <div className="admin-content-empty-icon">📝</div>
                                      <p>请在左侧选择一个没有子模块的模块</p>
                                  </div>
                              )}
                          </div>
                      </div>
          
                      {/* ===== 弹窗 ===== */}
                      <Dialog
                          visible={dialogState.type !== null && dialogState.type !== 'confirm'}
                          type={dialogState.type as 'add' | 'edit' | 'delete'}
                          title={
                              dialogState.type === 'add' ? '添加节点' :
                              dialogState.type === 'edit' ? '编辑节点' :
                              '删除确认'
                          }
                          value={dialogState.value}
                          enabled={dialogState.enabled}
                          onConfirm={handleDialogConfirm}
                          onCancel={dialogState.type === 'confirm' ? handleDialogCancel : handleDialogCancel}
                          placeholder="请输入节点名称"
                      />
                      <Dialog
                          visible={dialogState.type === 'confirm'}
                          type="confirm"
                          title="提示"
                          onConfirm={handleDialogCancel}
                          onCancel={handleDialogCancel}
                      />
                      <Dialog
                          visible={dragAlertVisible}
                          type="confirm"
                          title="提示"
                          message={dragAlertMessage}
                          onConfirm={() => setDragAlertVisible(false)}
                          onCancel={() => setDragAlertVisible(false)}
                      />
                  </div>
          <AnnotationViewer
            source={annotationSourceDocument as unknown as AnnotationSourceDocument}
            options={{
              currentPageId: (() => {
                const hashPageId = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('page');
                const searchPageId = new URLSearchParams(window.location.search.replace(/^\?/, '')).get('page');
                const pageId = hashPageId || searchPageId;
                return typeof pageId === 'string' && /^[a-z0-9-]+$/u.test(pageId)
                  ? pageId
                  : "help-center-admin-copy";
              })(),
              onDirectoryRoute: (node) => {
                if (typeof node.route === 'string' && /^[a-z0-9-]+$/u.test(node.route)) {
                  window.location.hash = `page=${node.route}`;
                }
              },
              toolbarEdge: 'right',
              showToolbar: true,
              showThemeToggle: true,
              showColorFilter: true,
              emptyWhenNoData: true,
            }}
          />
        </>
    );
}

export default Component;
