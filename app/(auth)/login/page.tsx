'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (searchParams.get('registered')) {
            setSuccessMessage('Регистрация прошла успешно! Войдите в систему.');
        }
    }, [searchParams]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-md">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Вход</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {successMessage && (
                            <p className="text-sm text-green-500">{successMessage}</p>
                        )}
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
                                placeholder="Введите пароль"
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Вход...' : 'Войти'}
                        </Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Нет аккаунта?{' '}
                            <Link href="/register" className="text-primary hover:underline">
                                Зарегистрироваться
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}