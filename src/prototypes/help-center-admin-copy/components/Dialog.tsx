import React, { useState, useEffect } from 'react';

interface DialogProps {
    visible: boolean;
    type: 'add' | 'edit' | 'delete' | 'confirm';
    title: string;
    value?: string;
    message?: string;
    enabled?: boolean;
    onConfirm: (value?: string, enabled?: boolean) => void;
    onCancel: () => void;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
}

export function Dialog({
    visible,
    type,
    title,
    value = '',
    message = '',
    enabled = true,
    onConfirm,
    onCancel,
    placeholder = '请输入',
    confirmText = '确定',
    cancelText = '取消',
}: DialogProps) {
    const [inputValue, setInputValue] = useState(value);
    const [isEnabled, setIsEnabled] = useState(enabled);

    useEffect(() => {
        if (visible) {
            setInputValue(value);
            setIsEnabled(enabled);
        }
    }, [visible, value, enabled]);

    if (!visible) return null;

    const handleConfirm = () => {
        if (type === 'add' || type === 'edit') {
            if (inputValue.trim()) {
                onConfirm(inputValue.trim(), isEnabled);
            }
        } else {
            onConfirm();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleConfirm();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div className="admin-dialog-overlay" onClick={onCancel}>
            <div className="admin-dialog" onClick={e => e.stopPropagation()}>
                <div className="admin-dialog-header">
                    <span className="admin-dialog-title">{title}</span>
                    <button className="admin-dialog-close" onClick={onCancel}>×</button>
                </div>
                <div className="admin-dialog-body">
                    {(type === 'add' || type === 'edit') && (
                        <>
                            <input
                                className="admin-dialog-input"
                                type="text"
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                placeholder={placeholder}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                            {type === 'edit' && (
                                <div className="admin-dialog-switch-row">
                                    <span className="admin-dialog-switch-label">启用</span>
                                    <label className="admin-switch">
                                        <input
                                            type="checkbox"
                                            checked={isEnabled}
                                            onChange={e => setIsEnabled(e.target.checked)}
                                        />
                                        <span className="admin-switch-slider"></span>
                                    </label>
                                </div>
                            )}
                        </>
                    )}
                    {type === 'delete' && (
                        <p className="admin-dialog-message">确定要删除此节点吗？删除后无法恢复。</p>
                    )}
                    {type === 'confirm' && (
                        <p className="admin-dialog-message">{message || '当前节点已有关联帮助文档，如需添加子节点，请先删除关联的内容。'}</p>
                    )}
                </div>
                <div className="admin-dialog-footer">
                    <button className="admin-btn" onClick={onCancel}>{cancelText}</button>
                    {type === 'delete' ? (
                        <button className="admin-btn admin-btn--danger" onClick={handleConfirm}>{confirmText}</button>
                    ) : (
                        <button className="admin-btn admin-btn--primary" onClick={handleConfirm}>{confirmText}</button>
                    )}
                </div>
            </div>
        </div>
    );
}
