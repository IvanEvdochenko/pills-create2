'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Регистрируем пользователя в Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'client'
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Создаём запись в таблице users
                const { error: profileError } = await supabase
                    .from('users')
                    .insert({
                        id: authData.user.id,
                        email: email,
                        full_name: fullName,
                        role: 'client'
                    });

                if (profileError) {
                    console.error('Ошибка создания профиля:', profileError);
                    // Пользователь уже создан в Auth, но профиль не создался
                    // Можно показать ошибку, но пользователь уже существует
                }

                // 3. Перенаправляем на страницу входа
                router.push('/login?registered=true');
            }
        } catch (err: any) {
            setError(err.message || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-md">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Регистрация</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Имя</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Введите ваше имя"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@mail.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Пароль</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Минимум 6 символов"
                                required
                                minLength={6}
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Уже есть аккаунт?{' '}
                            <Link href="/login" className="text-primary hover:underline">
                                Войти
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}