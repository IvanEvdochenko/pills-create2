'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Service, Studio } from '@/lib/types';
import { ServiceCard } from '@/components/cards/ServiceCard';

export default function HomePage() {
    const [services, setServices] = useState<Service[]>([]);
    const [studios, setStudios] = useState<Studio[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            console.log('🔄 Начинаем загрузку данных...');
            console.log('🔑 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
            
            // Проверяем подключение к Supabase
            const { data: studiosData, error: studiosError } = await supabase
                .from('studios')
                .select('*')
                .order('name');

            console.log('📊 Студии:', studiosData);
            console.log('❌ Ошибка студий:', studiosError);

            if (studiosError) {
                setError(`Ошибка загрузки студий: ${studiosError.message}`);
                setLoading(false);
                return;
            }

            setStudios(studiosData || []);

            const { data: servicesData, error: servicesError } = await supabase
                .from('services')
                .select('*, studio:studios(*)')
                .eq('is_active', true)
                .order('name');

            console.log('📊 Услуги:', servicesData);
            console.log('❌ Ошибка услуг:', servicesError);

            if (servicesError) {
                setError(`Ошибка загрузки услуг: ${servicesError.message}`);
                setLoading(false);
                return;
            }

            setServices(servicesData || []);
        } catch (err: any) {
            console.error('🔥 Критическая ошибка:', err);
            setError(`Ошибка: ${err.message || 'Неизвестная ошибка'}`);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки данных</h2>
                <p className="text-muted-foreground">{error}</p>
                <p className="text-sm text-muted-foreground mt-4">Проверь консоль браузера (F12) для подробностей</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <section className="text-center py-12 mb-8">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Pillz Create
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Студия медиаконтента для создания твоего звука, видео и монтажа
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    🎵 {studios.length} студий • {services.length} услуг
                </p>
            </section>

            <section>
                {services.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Услуги не найдены</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Проверь данные в Supabase (таблица services)
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}