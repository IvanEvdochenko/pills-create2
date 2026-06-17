'use client';

import { Service } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Clock, MapPin } from 'lucide-react';

export function ServiceCard({ service }: { service: Service }) {
    const router = useRouter();

    return (
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    <Badge variant={service.is_offline ? 'default' : 'secondary'}>
                        {service.is_offline ? 'Офлайн' : 'Онлайн'}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                </p>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{service.duration_minutes} минут</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{service.studio?.name || 'Студия не указана'}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-4 border-t">
                <span className="text-xl font-bold text-primary">
                    {service.price.toLocaleString()} ₽
                </span>
                <Button onClick={() => router.push(`/service/${service.id}`)}>
                    Подробнее →
                </Button>
            </CardFooter>
        </Card>
    );
}