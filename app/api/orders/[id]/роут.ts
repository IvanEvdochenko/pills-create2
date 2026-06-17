import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    return NextResponse.json({ message: 'Order details' });
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const body = await request.json();
    return NextResponse.json({ message: 'Order updated' });
}