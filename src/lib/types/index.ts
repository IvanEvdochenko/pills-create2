// Типы для сущностей из ПР-03

export type UserRole = 'client' | 'worker' | 'admin';

export type OrderStatus = 'new' | 'confirmed' | 'in_progress' | 'done' | 'cancelled';

export interface User {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: UserRole;
    created_at: string;
}

export interface Studio {
    id: string;
    name: string;
    description: string | null;
    type: 'audio1' | 'audio2' | 'video' | 'editing';
}

export interface Service {
    id: string;
    studio_id: string;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    is_offline: boolean;
    is_active: boolean;
    studio?: Studio;
}

export interface Order {
    id: string;
    client_id: string;
    worker_id: string | null;
    service_id: string;
    status: OrderStatus;
    order_date: string;
    client_comment: string | null;
    worker_comment: string | null;
    created_at: string;
    updated_at: string;
    service?: Service;
}

export interface CreateOrderInput {
    service_id: string;
    order_date: string;
    client_comment?: string;
}