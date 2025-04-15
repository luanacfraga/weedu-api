declare const _default: (() => {
    port: number;
    nodeEnv: string;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    database: {
        url: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    nodeEnv: string;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    database: {
        url: string;
    };
}>;
export default _default;
