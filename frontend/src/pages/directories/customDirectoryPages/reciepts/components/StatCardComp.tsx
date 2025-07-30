import React from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { motion } from "framer-motion";

interface StatCardProps {
    title: string;
    amount: number | string;
    change?: number;
    icon: React.ElementType;
    positive?: boolean;
}

function StatCard({
    title,
    amount,
    change,
    icon: Icon,
    positive = true,
}: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-[#fff] rounded-3xl p-6 shadow-lg flex flex-col gap-4 w-full"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-slate-800 text-sm font-semibold tracking-wide">
                    {title}
                </h3>
                <span
                    className={`flex items-center justify-center min-w-10 min-h-10 rounded-full backdrop-blur-md ${
                        positive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                    }`}
                >
                    <Icon fontSize="small" />
                </span>
            </div>

            <div className="flex items-end justify-between">
                <span className="text-slate-800 font-extrabold text-4xl sm:text-4xl leading-none select-none">
                    {typeof amount === "number"
                        ? amount.toLocaleString("en-US")
                        : amount}
                </span>

                {change !== undefined && (
                    <span
                        className={`flex items-center gap-1 px-2 py-1 rounded-xl text-sm font-medium whitespace-nowrap ${
                            positive
                                ? "text-green-400 bg-green-500/10"
                                : "text-red-400 bg-red-500/10"
                        }`}
                    >
                        {positive ? (
                            <TrendingUpIcon fontSize="inherit" />
                        ) : (
                            <TrendingDownIcon fontSize="inherit" />
                        )}
                        {change}%
                    </span>
                )}
            </div>
        </motion.div>
    );
}

interface StatItem {
    title: string;
    amount: number;
    change?: number;
    icon: React.ElementType;
    positive?: boolean;
}

export default function StatCardComp() {
    const stats: StatItem[] = [
        {
            title: "Kirim (Income)",
            amount: 24500,
            change: 4.2,
            icon: TrendingUpIcon,
            positive: true,
        },
        {
            title: "Chiqim (Expense)",
            amount: 9700,
            change: 1.8,
            icon: TrendingDownIcon,
            positive: false,
        },
        {
            title: "Kutilayotgan (Pending)",
            amount: 5300,
            icon: AccessTimeIcon,
            positive: true,
        },
        {
            title: "Kutilayotgan (Pending)",
            amount: 5300,
            icon: AccessTimeIcon,
            positive: true,
        },
    ];

    return (
        <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 xl:gap-8 w-full">
            {stats.map((s) => (
                <StatCard key={s.title} {...s} />
            ))}
        </section>
    );
}

/*
 HOW TO USE:
 1. Fayl kengaytmasi `.tsx` boʻlishi kerak (masalan, `StatsDashboard.tsx`).
 2. MUI Icons ishlatilmoqda: `@mui/icons-material` o'rnatilgan bo'lishi shart.
 3. Tailwind, framer-motion avvaldan oʻrnatilgan boʻlishi kerak:
    npm i @mui/icons-material framer-motion
*/
