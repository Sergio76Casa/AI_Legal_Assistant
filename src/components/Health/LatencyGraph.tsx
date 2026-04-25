import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

interface LatencyGraphProps {
    history: number[];
    color?: string;
}

export const LatencyGraph: React.FC<LatencyGraphProps> = ({ history, color = "#6366f1" }) => {
    // Transform history into Recharts data
    const data = history.map((val, i) => ({ time: i, value: val }));

    return (
        <div className="h-full w-full py-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#latencyGradient)"
                        isAnimationActive={false}
                    />
                    <YAxis hide domain={[0, 'auto']} />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg shadow-2xl">
                                        <p className="text-[10px] font-black text-white">{payload[0].value}ms</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
