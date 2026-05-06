import React from 'react';
import { Tag, Palette, Trash2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export const SettingsPage = ({ tasks, tagColors, onUpdateTagColor }) => {
    // Собираем все уникальные теги из всех существующих задач
    const uniqueTags = React.useMemo(() => {
        const tags = tasks.flatMap(t => t.tags || []);
        return [...new Set(tags)];
    }, [tasks]);

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto w-full overflow-y-auto h-full custom-scrollbar">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">Настройки</h1>
                <p className="text-white/40">Управление категориями и персонализация интерфейса</p>
            </header>

            <section className="space-y-6">
                <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <Tag size={20} />
                    <Palette size={20} />
                    <h2 className="text-lg font-semibold uppercase tracking-wider">Цвета тегов</h2>
                </div>

                <div className="grid gap-3">
                    {uniqueTags.length > 0 ? (
                        uniqueTags.map(tag => (
                            <GlassCard
                                key={tag}
                                className="flex items-center justify-between p-4 border border-white/5 hover:border-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Индикатор цвета */}
                                    <div
                                        className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                        style={{ backgroundColor: tagColors[tag] || '#a855f7' }}
                                    />
                                    <span className="text-white/90 font-medium text-lg">#{tag}</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <input
                                        type="color"
                                        value={tagColors[tag] || '#a855f7'}
                                        onChange={(e) => onUpdateTagColor(tag, e.target.value)}
                                        className="w-10 h-10 bg-transparent border-none cursor-pointer rounded-lg overflow-hidden"
                                        title="Выбрать цвет"
                                    />
                                </div>
                            </GlassCard>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <p className="text-white/30">Теги еще не созданы.</p>
                            <p className="text-white/20 text-sm">Добавьте задачу с тегом, например: "Купить молоко #продукты"</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Можно добавить секцию аккаунта в будущем */}
            <section className="mt-12 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity">
                    <div>
                        <h3 className="text-white font-medium">Версия системы</h3>
                        <p className="text-xs text-white/40">v1.2.4 (Stable Release)</p>
                    </div>
                </div>
            </section>
        </div>
    );
};