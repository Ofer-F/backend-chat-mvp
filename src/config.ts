export interface Config {
    PORT: number;
    CORS_ORIGIN: string;
    DEFAULT_MESSAGES_LIMIT: number;
}

export const config: Config = {
    PORT: Number(process.env.PORT) || 3000,
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    DEFAULT_MESSAGES_LIMIT: 20,
};
