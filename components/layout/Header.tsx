'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function Header() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <header className="border-b">
            <div className="container mx-auto px-4 flex h-16 items-center justify-between">
                <Link href="/" className="text-xl font-bold">
                    🎵 Pillz Create
                </Link>

                <nav className="flex items-center gap-4">
                    <Link href="/" className="text-sm hover:text-primary">
                        Услуги
                    </Link>

                    {user ? (
                        <>
                            <Link href="/profile" className="text-sm hover:text-primary">
                                Профиль
                            </Link>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                Выйти
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Войти</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Регистрация</Button>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}