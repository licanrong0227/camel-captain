import React, { useRef, useState, useEffect } from 'react';
import { Dialog } from './Dialog';

/**
 * 富文本编辑器交互说明：
 * 
 * 【删除文档按钮显示规则】
 * - 仅当节点已有关联帮助文档（hasContent=true）时显示"删除文档"按钮
 * - 新创建的节点（无内容）不显示删除按钮
 * 
 * 【删除文档操作流程】
 * - 点击"删除文档"按钮后，弹出二次确认弹窗
 * - 弹窗显示"确定要删除此节点吗？删除后无法恢复。"
 * - 点击"确定"：删除节点的帮助文档内容，编辑器清空，删除按钮消失
 * - 点击"取消"：关闭弹窗，不做任何操作
 * 
 * 【保存按钮规则】
 * - 编辑内容后，保存按钮变为可点击状态
 * - 未修改内容时，保存按钮禁用
 * - 保存后，将内容存储到节点的 content 属性
 */

interface RichTextEditorProps {
    content: string;
    onSave: (content: string) => void;
    onDelete: () => void;
    hasContent: boolean;
}

export function RichTextEditor({ content, onSave, onDelete, hasContent }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const showToast = (message: string) => {
        setToastMessage(message);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2000);
    };

    useEffect(() => {
        if (editorRef.current && content !== undefined) {
            editorRef.current.innerHTML = content || '';
            setHasChanges(false);
        }
    }, [content]);

    const handleInput = () => {
        setHasChanges(true);
    };

    const handleSave = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            onSave(newContent);
            setHasChanges(false);
            showToast('保存成功');
        }
    };

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        onDelete();
        if (editorRef.current) {
            editorRef.current.innerHTML = '';
        }
        setShowDeleteDialog(false);
    };

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        setHasChanges(true);
    };

    const insertImage = () => {
        const url = prompt('请输入图片URL:');
        if (url) {
            execCommand('insertImage', url);
        }
    };

    const insertVideo = () => {
        alert('视频上传功能演示：在实际应用中，这里会打开视频上传对话框');
    };

    const insertLink = () => {
        const url = prompt('请输入链接URL:');
        if (url) {
            execCommand('createLink', url);
        }
    };

    return (
        <div className="rich-text-editor">
            <div className="editor-toolbar">
                <div className="editor-toolbar-group">
                    <button
                        className="editor-toolbar-btn"
                        title="加粗"
                        onClick={() => execCommand('bold')}
                    >
                        <strong>B</strong>
                    </button>
                    <button
                        className="editor-toolbar-btn"
                        title="斜体"
                        onClick={() => execCommand('italic')}
                    >
                        <em>I</em>
                    </button>
                    <button
                        className="editor-toolbar-btn"
                        title="下划线"
                        onClick={() => execCommand('underline')}
                    >
                        <u>U</u>
                    </button>
                    <button
                        className="editor-toolbar-btn"
                        title="删除线"
                        onClick={() => execCommand('strikeThrough')}
                    >
                        <s>S</s>
                    </button>
                </div>
                <div className="editor-toolbar-divider" />
                <div className="editor-toolbar-group">
                    <select
                        className="editor-toolbar-select"
                        onChange={(e) => execCommand('formatBlock', e.target.value)}
                    >
                        <option value="">格式</option>
                        <option value="h1">标题 1</option>
                        <option value="h2">标题 2</option>
                        <option value="h3">标题 3</option>
                        <option value="p">正文</option>
                    </select>
                </div>
                <div className="editor-toolbar-divider" />
                <div className="editor-toolbar-group">
                    <button
                        className="editor-toolbar-btn"
                        title="无序列表"
                        onClick={() => execCommand('insertUnorderedList')}
                    >
                        ☰
                    </button>
                    <button
                        className="editor-toolbar-btn"
                        title="有序列表"
                        onClick={() => execCommand('insertOrderedList')}
                    >
                        1.
                    </button>
                </div>
                <div className="editor-toolbar-divider" />
                <div className="editor-toolbar-group">
                    <button
                        className="editor-toolbar-btn"
                        title="左对齐"
                        onClick={() => execCommand('justifyLeft')}
                    >
                        ≡
                    </button>
                    <button
                        className="editor-toolbar-btn"
                        title="居中"
                        onClick={() => execCommand('justifyCenter')}
                    >
                        ≡
                    </button>
                    <button
                        className="editor-toolbar-btn"
                        title="右对齐"
                        onClick={() => execCommand('justifyRight')}
                    >
                        ≡
                    </button>
                </div>
                <div className="editor-toolbar-divider" />
                <div className="editor-toolbar-group">
                    <button
                        className="editor-toolbar-btn"
                        title="插入图片"
                        onClick={insertImage}
                    >
                        🖼️
                    </button>
                    <button
                        className="editor-toolbar-btn"
                        title="插入视频"
                        onClick={insertVideo}
                    >
                        🎬
                    </button>
                    <button
                        className="editor-toolbar-btn"
                        title="插入链接"
                        onClick={insertLink}
                    >
                        🔗
                    </button>
                </div>
                <div className="editor-toolbar-divider" />
                <div className="editor-toolbar-group">
                    <button
                        className="editor-toolbar-btn"
                        title="撤销"
                        onClick={() => execCommand('undo')}
                    >
                        ↩
                    </button>
                    <button
                        className="editor-toolbar-btn"
                        title="重做"
                        onClick={() => execCommand('redo')}
                    >
                        ↪
                    </button>
                </div>
            </div>
            <div
                ref={editorRef}
                className="editor-content"
                contentEditable
                onInput={handleInput}
                data-placeholder="请输入帮助文档内容..."
            />
            <div className="editor-footer">
                <button
                    className="admin-btn admin-btn--primary"
                    onClick={handleSave}
                    disabled={!hasChanges}
                >
                    保存
                </button>
                {hasContent && (
                    <button
                        className="admin-btn admin-btn--danger"
                        onClick={handleDelete}
                        style={{ marginLeft: '8px' }}
                    >
                        删除文档
                    </button>
                )}
            </div>
            <Dialog
                visible={showDeleteDialog}
                type="delete"
                title="删除确认"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteDialog(false)}
            />
            {toastVisible && (
                <div className="admin-toast">
                    <span className="admin-toast-icon">✓</span>
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
