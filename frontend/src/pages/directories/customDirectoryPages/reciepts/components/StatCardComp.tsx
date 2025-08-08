import React from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { motion } from "framer-motion";

interface ReceiptRecord {
    id: string;
    [key: string]: string | number | boolean | null | undefined;
}

interface GroupedRecords {
    [groupValue: string]: ReceiptRecord[];
}

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

interface StatCardCompProps {
    groupedRecords?: GroupedRecords;
    fields?: any[];
}

export default function StatCardComp({ groupedRecords, fields }: StatCardCompProps) {
    // Calculate statistics from grouped records
    const calculateStats = (): StatItem[] => {
        if (!groupedRecords || !fields) {
            return [
                {
                    title: "Kirim (Income)",
                    amount: 0,
                    change: 0,
                    icon: TrendingUpIcon,
                    positive: true,
                },
                {
                    title: "Chiqim (Expense)",
                    amount: 0,
                    change: 0,
                    icon: TrendingDownIcon,
                    positive: false,
                },
                {
                    title: "Kutilayotgan (Pending)",
                    amount: 0,
                    icon: AccessTimeIcon,
                    positive: true,
                },
                {
                    title: "Jami (Total)",
                    amount: 0,
                    icon: TrendingUpIcon,
                    positive: true,
                },
            ];
        }

        let totalIncome = 0;
        let totalExpense = 0;
        let totalPending = 0;
        let totalRecords = 0;

        // Find amount/income fields
        const amountFields = fields.filter(field => 
            field.name.toLowerCase().includes('amount') || 
            field.name.toLowerCase().includes('income') ||
            field.name.toLowerCase().includes('sum') ||
            field.name.toLowerCase().includes('total')
        );

        // Find status fields
        const statusFields = fields.filter(field => 
            field.name.toLowerCase().includes('status') ||
            field.name.toLowerCase().includes('type')
        );

        Object.values(groupedRecords).forEach(records => {
            records.forEach(record => {
                totalRecords++;

                // Calculate amounts
                amountFields.forEach(field => {
                    const value = record[field.name];
                    if (typeof value === 'number' && value > 0) {
                        totalIncome += value;
                    }
                });

                // Calculate status-based counts
                statusFields.forEach(field => {
                    const status = String(record[field.name]).toLowerCase();
                    if (status.includes('pending') || status.includes('waiting')) {
                        totalPending++;
                    } else if (status.includes('expense') || status.includes('outgoing')) {
                        totalExpense += Number(record[amountFields[0]?.name] || 0);
                    }
                });
            });
        });

        return [
            {
                title: "Kirim (Income)",
                amount: totalIncome,
                change: totalIncome > 0 ? 4.2 : 0,
                icon: TrendingUpIcon,
                positive: true,
            },
            {
                title: "Chiqim (Expense)",
                amount: totalExpense,
                change: totalExpense > 0 ? 1.8 : 0,
                icon: TrendingDownIcon,
                positive: false,
            },
            {
                title: "Kutilayotgan (Pending)",
                amount: totalPending,
                icon: AccessTimeIcon,
                positive: true,
            },
            {
                title: "Jami (Total)",
                amount: totalRecords,
                icon: TrendingUpIcon,
                positive: true,
            },
        ];
    };

    const stats = calculateStats();

    return (
        <section className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 xl:gap-8 w-full">
            {stats.map((s) => (
                <StatCard key={s.title} {...s} />
            ))}
        </section>
    );
}
