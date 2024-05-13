export function createConnection(conf?: {}): any;
export function init(conf: any): void;
export const config: {};
export function withConnection(cb: any): Promise<{
    isError: boolean;
    result: any;
}>;
