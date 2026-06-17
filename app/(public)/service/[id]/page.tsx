'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Service } from '@/lib/types';
import { BookingForm } from '@/components/forms/BookingForm';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';

export default function ServicePage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const serviceId = params.id as string;

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchService();
    }, [serviceId]);

    async function fetchService() {
        try {
            const { data } = await supabase
                .from('services')
                .select('*, studio:studios(*)')
                .eq('id', serviceId)
                .single();

            setService(data);
        } catch (error) {
            console.error('Error fetching service:', error);
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

    if (!service) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold">Услуга не найдена</h2>
                <button 
                    onClick={() => router.push('/')}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                    Вернуться в каталог
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Информация об услуге */}
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant={service.is_offline ? 'default' : 'secondary'}>
                            {service.is_offline ? 'Офлайн' : 'Онлайн'}
                        </Badge>
                        <Badge variant="outline">{service.studio?.name}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {service.duration_minutes} мин
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {service.studio?.name || 'Студия'}
                        </span>
                    </div>
                    <p className="text-lg text-muted-foreground mb-6">
                        {service.description}
                    </p>
                    <div className="p-4 bg-muted rounded-lg mb-6">
                        <span className="text-3xl font-bold text-primary">
                            {service.price.toLocaleString()} ₽
                        </span>
                        {service.is_offline && (
                            <span className="text-sm text-muted-foreground ml-2">
                                + предоплата 50% при бронировании
                            </span>
                        )}
                    </div>
                </div>

                {/* Форма записи */}
                <div className="lg:col-span-1">
                    <BookingForm serviceId={service.id} />
                </div>
            </div>
        </div>
    );
}