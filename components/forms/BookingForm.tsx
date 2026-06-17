'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BookingFormProps {
    serviceId: string;
}

export function BookingForm({ serviceId }: BookingFormProps) {
    const router = useRouter();
    const supabase = createClient();

    const [user, setUser] = useState<any>(null);
    const [orderDate, setOrderDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [success, setSuccess] = useState(false);

    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', '13:00',
        '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    }, []);

    useEffect(() => {
        if (orderDate) {
            fetchBookedSlots();
        }
    }, [orderDate]);

    async function fetchBookedSlots() {
        if (!orderDate) return;

        const dateStr = format(orderDate, 'yyyy-MM-dd');

        const { data } = await supabase
            .from('orders')
            .select('order_date')
            .eq('service_id', serviceId)
            .gte('order_date', `${dateStr} 00:00:00`)
            .lt('order_date', `${dateStr} 23:59:59`)
            .not('status', 'eq', 'cancelled');

        if (data) {
            const booked = data.map(o => format(new Date(o.order_date), 'HH:mm'));
            setBookedSlots(booked);
        }
    }

    async function handleSubmit() {
        if (!user) {
            router.push('/login');
            return;
        }

        if (!orderDate || !selectedTime) {
            alert('Выберите дату и время');
            return;
        }

        setSubmitting(true);

        try {
            const dateTime = new Date(orderDate);
            const [hours, minutes] = selectedTime.split(':').map(Number);
            dateTime.setHours(hours, minutes, 0, 0);

            const orderData = {
                client_id: user.id,
                service_id: serviceId,
                order_date: dateTime.toISOString(),
                client_comment: comment || null,
                status: 'new'
            };

            const { data, error } = await supabase
                .from('orders')
                .insert(orderData)
                .select()
                .single();

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.push('/profile');
            }, 3000);

        } catch (error: any) {
            alert('Ошибка при создании заявки: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (success) {
        return (
            <Card>
                <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-4">✅</div>
                    <h3 className="text-lg font-bold mb-2">Заявка создана!</h3>
                    <p className="text-sm text-muted-foreground">
                        Статус: <Badge>Новая</Badge>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Перенаправление в профиль...
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Записаться на услугу</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Выбор даты */}
                <div className="space-y-2">
                    <Label>Дата записи *</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {orderDate ? format(orderDate, 'dd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={orderDate}
                                onSelect={setOrderDate}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                locale={ru}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Выбор времени */}
                <div className="space-y-2">
                    <Label>Время записи *</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите время" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeSlots.map((time) => (
                                <SelectItem
                                    key={time}
                                    value={time}
                                    disabled={bookedSlots.includes(time)}
                                >
                                    {time} {bookedSlots.includes(time) && '🔴 (занято)'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {bookedSlots.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            🔴 Занятые слоты отмечены красным
                        </p>
                    )}
                </div>

                {/* Комментарий */}
                <div className="space-y-2">
                    <Label>Комментарий</Label>
                    <Textarea
                        placeholder="Дополнительные пожелания..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={500}
                        rows={3}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                        {comment.length}/500
                    </p>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={submitting || !orderDate || !selectedTime}
                    className="w-full"
                >
                    {submitting ? 'Отправка...' : 'Записаться'}
                </Button>

                {!user && (
                    <p className="text-xs text-muted-foreground text-center">
                        Для записи необходимо <a href="/login" className="text-primary hover:underline">войти</a>
                    </p>
                )}
            </CardContent>
        </Card>
    );
}