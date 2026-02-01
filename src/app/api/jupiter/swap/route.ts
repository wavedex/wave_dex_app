import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { quoteResponse, userPublicKey, wrapAndUnwrapSol = true } = body;

        if (!quoteResponse || !userPublicKey) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const apiKey = process.env.JUPITER_API_KEY;
        // Using the robust V1 Swap API
        const baseUrl = 'https://api.jup.ag/swap/v1';

        const response = await fetch(`${baseUrl}/swap`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { 'x-api-key': apiKey } : {}),
            },
            body: JSON.stringify({
                quoteResponse,
                userPublicKey,
                wrapAndUnwrapSol,
                dynamicComputeUnitLimit: true,
                // Using a numeric value or 'auto' if supported by the plan
                prioritizationFeeLamports: 'auto'
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Jupiter Swap API Error:', errorData);
            
            // Fallback attempt without prioritization fee if 'auto' fails on some plans
            if (errorData.message?.includes('prioritizationFeeLamports')) {
                const fallbackResponse = await fetch(`${baseUrl}/swap`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(apiKey ? { 'x-api-key': apiKey } : {}),
                    },
                    body: JSON.stringify({
                        quoteResponse,
                        userPublicKey,
                        wrapAndUnwrapSol,
                        dynamicComputeUnitLimit: true
                    }),
                });
                const fallbackData = await fallbackResponse.json();
                return NextResponse.json(fallbackData, { status: fallbackResponse.status });
            }
            
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Jupiter Swap Route Error:', error);
        return NextResponse.json({ 
            error: 'Failed to build swap transaction',
            message: error.message 
        }, { status: 500 });
    }
}
