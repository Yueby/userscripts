export class BoothError extends Error {
    constructor(message: string, public details?: unknown) {
        super(message);
        this.name = 'BoothError';
    }
}

export function handleError(error: unknown, fallback?: () => void): void {
    console.error('Booth Helper Error:', error);
    if (fallback) {
        try {
            fallback();
        } catch (e) {
            console.error('Fallback handler failed:', e);
        }
    }
} 