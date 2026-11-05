import React from 'react';

interface IconProps {
    size?: number;
    className?: string;
}

const base = (size: number) => ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
});

export function MenuIcon({ size = 19, className }: IconProps) {
    return (
        <svg {...base(size)} className={className}>
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="14" y2="18" />
        </svg>
    );
}

export function ChatIcon({ size = 19, className }: IconProps) {
    return (
        <svg {...base(size)} className={className}>
            <path d="M20 12.5a7.5 7.5 0 0 1-10.9 6.7L4 20.5l1.4-4.2A7.5 7.5 0 1 1 20 12.5z" />
        </svg>
    );
}

export function SearchIcon({ size = 19, className }: IconProps) {
    return (
        <svg {...base(size)} className={className}>
            <circle cx="10.8" cy="10.8" r="6.3" />
            <line x1="19.5" y1="19.5" x2="15.4" y2="15.4" />
        </svg>
    );
}

export function ExpandIcon({ size = 19, className }: IconProps) {
    return (
        <svg {...base(size)} className={className}>
            <path d="M4 9V4h5" />
            <path d="M20 15v5h-5" />
            <path d="M4 4l5 5" />
            <path d="M20 20l-5-5" />
        </svg>
    );
}

export function CaretDown({ size = 12, className }: IconProps) {
    return (
        <svg {...base(size)} className={className}>
            <polyline points="5 9 12 16 19 9" />
        </svg>
    );
}

export function HeadsetIcon({ size = 15, className }: IconProps) {
    return (
        <svg {...base(size)} className={className}>
            <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
            <rect x="3" y="13" width="3.4" height="6" rx="1.4" />
            <rect x="17.6" y="13" width="3.4" height="6" rx="1.4" />
            <path d="M19 19a4.5 4.5 0 0 1-4.5 3H13" />
        </svg>
    );
}

export function MegaphoneIcon({ size = 15, className }: IconProps) {
    return (
        <svg {...base(size)} className={className}>
            <path d="M4 10v4a1 1 0 0 0 1 1h2l9 5V4L7 9H5a1 1 0 0 0-1 1z" />
            <path d="M19 9a3 3 0 0 1 0 6" />
        </svg>
    );
}

export function DocIcon({ size = 15, className }: IconProps) {
    return (
        <svg {...base(size)} className={className}>
            <path d="M6 3.5h7l5 5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
            <polyline points="13 3.5 13 8.5 18 8.5" />
            <line x1="8" y1="13" x2="15" y2="13" />
            <line x1="8" y1="17" x2="13" y2="17" />
        </svg>
    );
}

export function ListIcon({ size = 15, className }: IconProps) {
    return (
        <svg {...base(size)} className={className}>
            <rect x="4" y="4" width="16" height="16" rx="1.5" />
            <line x1="8" y1="9" x2="16" y2="9" />
            <line x1="8" y1="12.5" x2="16" y2="12.5" />
            <line x1="8" y1="16" x2="13" y2="16" />
        </svg>
    );
}

export function TrendIcon({ size = 15, className }: IconProps) {
    return (
        <svg {...base(size)} className={className}>
            <polyline points="3.5 16.5 8.5 11 12.5 14.5 20.5 6.5" />
            <polyline points="15.5 6.5 20.5 6.5 20.5 11.5" />
        </svg>
    );
}

export function PackageIcon({ size = 15, className }: IconProps) {
    return (
        <svg {...base(size)} className={className}>
            <path d="M12 3.5l8 4.3v8.4l-8 4.3-8-4.3V7.8l8-4.3z" />
            <polyline points="4 7.8 12 12 20 7.8" />
            <line x1="12" y1="12" x2="12" y2="20.5" />
        </svg>
    );
}

export function ResetIcon({ size = 13, className }: IconProps) {
    return (
        <svg {...base(size)} className={className}>
            <path d="M20 11a8 8 0 1 0-2.1 5.7" />
            <polyline points="20 5 20 11 14 11" />
        </svg>
    );
}

export function ChevronLeft({ size = 12, className }: IconProps) {
    return (
        <svg {...base(size)} className={className}>
            <polyline points="14.5 6 8.5 12 14.5 18" />
        </svg>
    );
}

export function ChevronRight({ size = 12, className }: IconProps) {
    return (
        <svg {...base(size)} className={className}>
            <polyline points="9.5 6 15.5 12 9.5 18" />
        </svg>
    );
}

export function SortCaret({ dir }: { dir: 'asc' | 'desc' | null }) {
    return (
        <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden="true" className="ops-sort-caret">
            <path d="M4 0 8 5H0z" fill={dir === 'asc' ? '#409EFF' : '#C0C4CC'} />
            <path d="M4 12 0 7h8z" fill={dir === 'desc' ? '#409EFF' : '#C0C4CC'} />
        </svg>
    );
}

export function EmptyBoxIcon({ size = 44, className }: IconProps) {
    return (
        <svg {...base(size)} className={className} strokeWidth={1.1}>
            <path d="M4 8.5 12 4l8 4.5V17l-8 4.5L4 17V8.5z" />
            <polyline points="4 8.5 12 13 20 8.5" />
            <line x1="12" y1="13" x2="12" y2="21.5" />
        </svg>
    );
}
