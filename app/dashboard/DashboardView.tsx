// components/dashboard/DashboardView.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QuickLink {
    _id?: string;
    id?: string;
    name: string;
    url: string;
}

interface Category {
    _id: string;
    id?: string;
    categoryName: string;
    name?: string;
    apps: QuickLink[];
    links?: QuickLink[];
}

const SortableLinkItem: React.FC<{
    link: QuickLink;
    isDarkMode: boolean;
}> = ({ link, isDarkMode }) => {
    const linkId = link._id || link.id || '';
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: linkId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getFaviconUrl = (url: string) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch {
            return null;
        }
    };

    const favicon = getFaviconUrl(link.url);

    return (
        <div ref={setNodeRef} style={style}>
            <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                }}
            >
                <div style={{
                    background: isDarkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '14px',
                    padding: '0.9rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'grab',
                }}
                    {...attributes}
                    {...listeners}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: favicon ? 'transparent' : '#667eea',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {favicon ? (
                            <img src={favicon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                {link.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '1rem', color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>
                            {link.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                            {link.url.replace(/^https?:\/\//, '')}
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
};

const SortableCategoryColumn: React.FC<{
    category: Category;
    onDeleteCategory: (id: string) => void;
    onEditCategory: (id: string, name: string) => void;
    onAddLink: (categoryId: string, link: Omit<QuickLink, '_id' | 'id'>) => void;
    onDeleteLink: (categoryId: string, linkId: string) => void;
    isDarkMode: boolean;
}> = ({ category, onDeleteCategory, onEditCategory, onAddLink, onDeleteLink, isDarkMode }) => {
    const [showAddLink, setShowAddLink] = useState(false);
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');

    const categoryId = category._id || category.id || '';
    const categoryName = category.categoryName || category.name || '';
    const apps = category.apps || category.links || [];

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: categoryId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const addLink = () => {
        if (!newName.trim() || !newUrl.trim()) return;
        const formattedUrl = newUrl.startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`;
        onAddLink(categoryId, {
            name: newName.trim(),
            url: formattedUrl,
        });
        setNewName('');
        setNewUrl('');
        setShowAddLink(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-opacity-60"
        >
            <div style={{
                background: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(248, 250, 252, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '1.2rem',
                minWidth: '280px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                opacity: isDragging ? 0.6 : 1,
            }}>
                {/* Header cột */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    paddingBottom: '0.8rem',
                    borderBottom: `1px dashed ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                }}>
                    <h3
                        style={{
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            color: isDarkMode ? '#f1f5f9' : '#1e293b',
                            cursor: 'grab',
                        }}
                        {...attributes}
                        {...listeners}
                    >
                        {categoryName} ({apps.length})
                    </h3>
                    <button
                        onClick={() => onDeleteCategory(categoryId)}
                        style={{
                            color: '#ef4444',
                            background: 'none',
                            border: 'none',
                            fontSize: '1.3rem',
                            cursor: 'pointer',
                            padding: '0.4rem',
                            borderRadius: '8px',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                        ×
                    </button>
                </div>

                {/* Danh sách link */}
                <SortableContext items={apps.map(app => app._id || app.id || '')} strategy={verticalListSortingStrategy}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minHeight: '80px' }}>
                        {apps.map((link) => (
                            <div key={link._id || link.id} style={{ position: 'relative' }}>
                                <SortableLinkItem link={link} isDarkMode={isDarkMode} />
                                <button
                                    onClick={() => onDeleteLink(categoryId, link._id || link.id || '')}
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        color: '#ef4444',
                                        border: 'none',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        fontSize: '0.9rem',
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </SortableContext>

                {/* Nút thêm link */}
                {showAddLink ? (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Tên ứng dụng"
                            style={{
                                padding: '0.6rem',
                                borderRadius: '8px',
                                border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                                background: isDarkMode ? '#1e293b' : '#ffffff',
                                color: isDarkMode ? '#f1f5f9' : '#1e293b',
                                fontSize: '0.9rem',
                            }}
                        />
                        <input
                            type="text"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="URL (ví dụ: youtube.com)"
                            style={{
                                padding: '0.6rem',
                                borderRadius: '8px',
                                border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                                background: isDarkMode ? '#1e293b' : '#ffffff',
                                color: isDarkMode ? '#f1f5f9' : '#1e293b',
                                fontSize: '0.9rem',
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => setShowAddLink(false)} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: 'transparent', border: 'none', color: isDarkMode ? '#cbd5e1' : '#64748b', cursor: 'pointer' }}>
                                Hủy
                            </button>
                            <button onClick={addLink} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer' }}>
                                Thêm
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowAddLink(true)}
                        style={{
                            marginTop: '1rem',
                            width: '100%',
                            padding: '0.7rem',
                            borderRadius: '12px',
                            background: 'transparent',
                            border: `2px dashed ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                            color: isDarkMode ? '#94a3b8' : '#64748b',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        + Thêm ứng dụng
                    </button>
                )}
            </div>
        </div>
    );
};

const DashboardView: React.FC = () => {
    const { isDarkMode } = useDarkMode();

    const [categories, setCategories] = useState<Category[]>([]);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // Fetch categories from API
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch categories');

            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find categories
        const activeCategory = categories.find(cat => 
            cat.apps.some(app => (app._id || app.id) === activeId)
        );
        const overCategory = categories.find(cat => 
            (cat._id || cat.id) === overId || cat.apps.some(app => (app._id || app.id) === overId)
        );

        if (!activeCategory || !overCategory) return;

        const activeCatId = activeCategory._id || activeCategory.id || '';
        const overCatId = overCategory._id || overCategory.id || '';

        if (activeCatId === overCatId) {
            // Same category - just reorder (local only for now)
            const apps = activeCategory.apps;
            const oldIndex = apps.findIndex(app => (app._id || app.id) === activeId);
            const newIndex = apps.findIndex(app => (app._id || app.id) === overId);

            setCategories(categories.map(cat =>
                (cat._id || cat.id) === activeCatId
                    ? { ...cat, apps: arrayMove(apps, oldIndex, newIndex) }
                    : cat
            ));
        } else {
            // Different category - move via API
            try {
                const token = localStorage.getItem('token');
                await fetch(`${API_URL}/dashboard/move-app`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        fromGroupId: activeCatId,
                        toGroupId: overCatId,
                        appId: activeId,
                    }),
                });

                // Refresh data
                await fetchCategories();
            } catch (err) {
                console.error('Error moving app:', err);
                alert('Không thể di chuyển ứng dụng');
            }
        }

        setActiveId(null);
    };

    const addCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/dashboard/group`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    categoryName: newCategoryName.trim(),
                }),
            });

            if (!response.ok) throw new Error('Failed to create category');

            await fetchCategories();
            setNewCategoryName('');
            setShowAddCategory(false);
        } catch (err) {
            console.error('Error creating category:', err);
            alert('Không thể tạo nhóm mới');
        } finally {
            setLoading(false);
        }
    };

    const deleteCategory = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa nhóm này?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/dashboard/group/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete category');

            setCategories(categories.filter(cat => (cat._id || cat.id) !== id));
        } catch (err) {
            console.error('Error deleting category:', err);
            alert('Không thể xóa nhóm');
        }
    };

    const addLinkToCategory = async (categoryId: string, link: Omit<QuickLink, '_id' | 'id'>) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/dashboard/${categoryId}/app`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(link),
            });

            if (!response.ok) throw new Error('Failed to add app');

            await fetchCategories();
        } catch (err) {
            console.error('Error adding app:', err);
            alert('Không thể thêm ứng dụng');
        }
    };

    const deleteLinkFromCategory = async (categoryId: string, linkId: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/dashboard/${categoryId}/app/${linkId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete app');

            setCategories(categories.map(cat =>
                (cat._id || cat.id) === categoryId
                    ? { ...cat, apps: cat.apps.filter(app => (app._id || app.id) !== linkId) }
                    : cat
            ));
        } catch (err) {
            console.error('Error deleting app:', err);
            alert('Không thể xóa ứng dụng');
        }
    };

    const handleCategoryDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setCategories(arrayMove(
            categories,
            categories.findIndex(c => (c._id || c.id) === active.id),
            categories.findIndex(c => (c._id || c.id) === over.id)
        ));
    };

    if (loading && categories.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                <div style={{ fontSize: '1.2rem' }}>Đang tải...</div>
            </div>
        );
    }

    return (
        <>
            {error && (
                <div style={{
                    background: '#FEE2E2',
                    color: '#991B1B',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '1rem',
                    textAlign: 'center',
                }}>
                    {error}
                </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{
                    fontSize: '2.6rem',
                    fontWeight: 800,
                    margin: '0 0 1rem',
                    color: isDarkMode ? '#f1f5f9' : '#1e293b'
                }}>
                    Quản lý ứng dụng
                </h1>
                <p style={{
                    fontSize: '1.1rem',
                    opacity: 0.8,
                    color: isDarkMode ? '#94a3b8' : '#64748b'
                }}>
                    Kéo thả cột để sắp xếp • Kéo ứng dụng để di chuyển giữa các nhóm
                </p>
            </div>

            {/* Danh sách cột theo chiều ngang, có thể kéo thả cột */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={(event) => {
                    const activeIdStr = event.active.id as string;
                    if (categories.some(cat => (cat._id || cat.id) === activeIdStr)) {
                        handleCategoryDragEnd(event);
                    } else {
                        handleDragEnd(event);
                    }
                }}
            >
                <SortableContext items={categories.map(c => c._id || c.id || '')} strategy={horizontalListSortingStrategy}>
                    <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        overflowX: 'auto',
                        padding: '0 1rem 2rem',
                        scrollbarWidth: 'thin',
                    }}>
                        {categories.map((category) => (
                            <SortableCategoryColumn
                                key={category._id || category.id}
                                category={category}
                                onDeleteCategory={deleteCategory}
                                onEditCategory={() => { }}
                                onAddLink={addLinkToCategory}
                                onDeleteLink={deleteLinkFromCategory}
                                isDarkMode={isDarkMode}
                            />
                        ))}

                        {/* Nút thêm category */}
                        <div style={{
                            minWidth: '280px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {showAddCategory ? (
                                <div style={{
                                    background: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(248, 250, 252, 0.9)',
                                    borderRadius: '20px',
                                    padding: '1.5rem',
                                    width: '100%',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                }}>
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="Tên nhóm mới..."
                                        autoFocus
                                        disabled={loading}
                                        style={{
                                            width: '100%',
                                            padding: '0.8rem',
                                            borderRadius: '12px',
                                            border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                                            background: isDarkMode ? '#1e293b' : '#ffffff',
                                            color: isDarkMode ? '#f1f5f9' : '#1e293b',
                                            marginBottom: '0.8rem',
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            onClick={() => setShowAddCategory(false)} 
                                            disabled={loading}
                                            style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', background: 'transparent', border: 'none', color: isDarkMode ? '#cbd5e1' : '#64748b', cursor: loading ? 'not-allowed' : 'pointer' }}
                                        >
                                            Hủy
                                        </button>
                                        <button 
                                            onClick={addCategory} 
                                            disabled={loading}
                                            style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', background: loading ? '#94A3B8' : '#3b82f6', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
                                        >
                                            {loading ? 'Đang tạo...' : 'Tạo'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAddCategory(true)}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        borderRadius: '20px',
                                        background: 'transparent',
                                        border: `3px dashed ${isDarkMode ? '#475569' : '#cbd5e1'}`,
                                        color: isDarkMode ? '#94a3b8' : '#64748b',
                                        fontSize: '1.8rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? 'rgba(71, 85, 105, 0.2)' : 'rgba(203, 213, 225, 0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    + Thêm nhóm mới
                                </button>
                            )}
                        </div>
                    </div>
                </SortableContext>

                <DragOverlay>
                    {activeId ? (
                        categories.some(cat => (cat._id || cat.id) === activeId) ? (
                            <div style={{ opacity: 0.8, transform: 'rotate(5deg)' }}>
                                <div style={{
                                    background: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255,255,255,0.95)',
                                    padding: '1rem',
                                    borderRadius: '16px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                    fontWeight: 'bold',
                                    color: isDarkMode ? '#f1f5f9' : '#1e293b'
                                }}>
                                    {categories.find(c => (c._id || c.id) === activeId)?.categoryName}
                                </div>
                            </div>
                        ) : (
                            <div style={{ opacity: 0.8 }}>
                                {(() => {
                                    const link = categories.flatMap(c => c.apps).find(l => (l._id || l.id) === activeId);
                                    return link ? <SortableLinkItem link={link} isDarkMode={isDarkMode} /> : null;
                                })()}
                            </div>
                        )) : null}
                </DragOverlay>
            </DndContext>
        </>
    );
};

export default DashboardView;