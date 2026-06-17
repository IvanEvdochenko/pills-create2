'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon, Clock, Mail, User, Phone } from 'lucide-react';

type OrderStatus = 'new' | 'confirmed' | 'in_progress' | 'done' | 'cancelled';

const statusColors: Record<OrderStatus, string> = {
    new: 'bg-blue-500',
    confirmed: 'bg-green-500',
    in_progress: 'bg-yellow-500',
    done: 'bg-gray-500',
    cancelled: 'bg-red-500'
};

const statusLabels: Record<OrderStatus, string> = {
    new: 'Новая',
    confirmed: 'Подтверждена',
    in_progress: 'В работе',
    done: 'Выполнена',
    cancelled: 'Отменена'
};

interface Order {
    id: string;
    service: { name: string; price: number };
    order_date: string;
    status: OrderStatus;
}

export default function ProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            // Получаем текущего пользователя
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                router.push('/login');
                return;
            }

            // Получаем данные профиля из таблицы users
            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            setUser({ ...authUser, ...profile });

            // Получаем заявки пользователя
            const { data: ordersData } = await supabase
                .from('orders')
                .select('*, service:services(name, price)')
                .eq('client_id', authUser.id)
                .order('created_at', { ascending: false });

            setOrders(ordersData || []);
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold">Пожалуйста, войдите</h2>
                <Button onClick={() => router.push('/login')} className="mt-4">
                    Войти
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Информация о пользователе */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Профиль
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Имя</p>
                            <p className="font-medium">{user.full_name || 'Не указано'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                {user.email}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Роль</p>
                            <Badge>
                                {user.role === 'client' && 'Клиент'}
                                {user.role === 'worker' && 'Работник'}
                                {user.role === 'admin' && 'Администратор'}
                            </Badge>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleLogout}>
                            Выйти
                        </Button>
                    </CardContent>
                </Card>

                {/* Заявки пользователя */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5" />
                            Мои заявки
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {orders.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">У вас пока нет заявок</p>
                                <Button asChild className="mt-4">
                                    <a href="/">Перейти в каталог</a>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <Card key={order.id}>
                                        <CardContent className="pt-4">
                                            <div className="flex flex-wrap items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">
                                                            {order.service?.name || 'Услуга'}
                                                        </p>
                                                        <Badge className={statusColors[order.status]}>
                                                            {statusLabels[order.status]}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <CalendarIcon className="w-4 h-4" />
                                                            {format(new Date(order.order_date), 'dd MMMM yyyy', { locale: ru })}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {format(new Date(order.order_date), 'HH:mm')}
                                                        </span>
                                                        <span>
                                                            {order.service?.price?.toLocaleString()} ₽
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}