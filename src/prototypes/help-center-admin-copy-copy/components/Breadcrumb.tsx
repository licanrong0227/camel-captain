import React from 'react';

interface BreadcrumbProps {
    items: string[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <div className="admin-breadcrumb">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <span className="admin-breadcrumb-separator">/</span>}
                    <span className={`admin-breadcrumb-item ${index === items.length - 1 ? 'is-active' : ''}`}>
                        {item}
                    </span>
                </React.Fragment>
            ))}
        </div>
    );
}
