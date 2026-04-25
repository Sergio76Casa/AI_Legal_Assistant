import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export type ServiceStatus = 'operational' | 'degraded' | 'down' | 'timeout';

export interface HealthLog {
    id: string;
    timestamp: Date;
    service: string;
    status: ServiceStatus;
    latency: number;
    message: string;
}

export interface ServiceState {
    name: string;
    status: ServiceStatus;
    latency: number;
    lastChecked: Date;
    history: number[]; // Last 20 latency points
}

export const useHealthCheck = (intervalMs: number = 60000) => {
    const [services, setServices] = useState<Record<string, ServiceState>>({
        'Supabase Gateway': { name: 'Supabase Gateway', status: 'operational', latency: 0, lastChecked: new Date(), history: [] },
        'Stark Intelligence': { name: 'Stark Intelligence', status: 'operational', latency: 0, lastChecked: new Date(), history: [] },
        'Email Relay': { name: 'Email Relay', status: 'operational', latency: 0, lastChecked: new Date(), history: [] },
    });
    const [logs, setLogs] = useState<HealthLog[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Previous statuses for delta logging
    const prevStatuses = useRef<Record<string, ServiceStatus>>({});

    const addLog = (service: string, status: ServiceStatus, latency: number, message: string) => {
        const newLog: HealthLog = {
            id: Math.random().toString(36).substring(7),
            timestamp: new Date(),
            service,
            status,
            latency,
            message
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50));

        // Persistence: Log only on state change
        if (prevStatuses.current[service] !== status) {
            logStateChange(service, prevStatuses.current[service], status, latency);
            prevStatuses.current[service] = status;
        }
    };

    const logStateChange = async (service: string, prev: ServiceStatus | undefined, current: ServiceStatus, latency: number) => {
        try {
            await supabase.from('system_events').insert({
                service_name: service,
                previous_status: prev || 'unknown',
                current_status: current,
                latency: latency,
                metadata: { timestamp: new Date().toISOString() }
            });
        } catch (err) {
            console.error('Failed to persist health event:', err);
        }
    };

    const checkService = async (name: string, checkFn: () => Promise<number>) => {
        const start = Date.now();
        let status: ServiceStatus = 'operational';
        let latency = 0;
        let message = 'Signal stabilized';

        try {
            // Strict 5s Timeout
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('TIMEOUT')), 5000)
            );

            latency = await Promise.race([checkFn(), timeoutPromise]) as number;
            
            if (latency > 800) {
                status = 'degraded';
                message = 'High latency detected';
            }
        } catch (error: any) {
            latency = Date.now() - start;
            if (error.message === 'TIMEOUT') {
                status = 'timeout';
                message = 'Gateway timeout (5000ms)';
            } else {
                status = 'down';
                message = error.message || 'Signal lost';
            }
        }

        setServices(prev => {
            const current = prev[name];
            const newHistory = [...current.history, latency].slice(-20);
            return {
                ...prev,
                [name]: { ...current, status, latency, lastChecked: new Date(), history: newHistory }
            };
        });

        addLog(name, status, latency, message);
    };

    const performAllChecks = useCallback(async () => {
        setIsRefreshing(true);
        
        await Promise.all([
            // 1. Supabase Check
            checkService('Supabase Gateway', async () => {
                const start = Date.now();
                const { error } = await supabase.from('app_settings').select('id').limit(1);
                if (error) throw error;
                return Date.now() - start;
            }),

            // 2. AI Engine Check (vía list-models)
            checkService('Stark Intelligence', async () => {
                const start = Date.now();
                const { error } = await supabase.functions.invoke('list-models');
                if (error) throw error;
                return Date.now() - start;
            }),

            // 3. Email Check
            checkService('Email Relay', async () => {
                // Check if edge function exists/responsive
                const start = Date.now();
                await supabase.functions.invoke('invite-user', { body: { probe: true } });
                // We ignore the error if it's just 'missing body params' but the function responded
                return Date.now() - start;
            })
        ]);

        setIsRefreshing(false);
    }, []);

    useEffect(() => {
        performAllChecks();
        const interval = setInterval(performAllChecks, intervalMs);
        return () => clearInterval(interval);
    }, [performAllChecks, intervalMs]);

    return { services, logs, isRefreshing, refreshAll: performAllChecks };
};
