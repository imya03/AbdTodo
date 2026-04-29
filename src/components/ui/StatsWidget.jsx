import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from "./GlassCard";

export const StatsWidget = ({ tasks }) => {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <GlassCard className="p-4 flex items-center gap-4">
            <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                    <motion.circle
                        cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent"
                        strokeDasharray={125.6}
                        initial={{ strokeDashoffset: 125.6 }}
                        animate={{ strokeDashoffset: 125.6 - (125.6 * percentage) / 100 }}
                        className="text-purple-500"
                    />
                </svg>
                <span className="absolute text-[10px] font-bold text-white">{percentage}%</span>
            </div>
            <div>
                <p className="text-white/50 text-xs uppercase tracking-wider font-medium">Прогресс</p>
                <p className="text-white text-sm font-semibold">{completed} из {total} сделано</p>
            </div>
        </GlassCard>
    );
};