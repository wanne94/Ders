import { ApiResponse } from '../types';
export declare class ApiClient {
    private baseURL;
    private token?;
    constructor(baseURL: string);
    setToken(token: string): void;
    private getHeaders;
    get<T>(endpoint: string): Promise<ApiResponse<T>>;
    post<T>(endpoint: string, data: any): Promise<ApiResponse<T>>;
    put<T>(endpoint: string, data: any): Promise<ApiResponse<T>>;
    delete<T>(endpoint: string): Promise<ApiResponse<T>>;
}
export declare const storage: {
    get: (key: string) => string | null;
    set: (key: string, value: string) => void;
    remove: (key: string) => void;
    clear: () => void;
};
//# sourceMappingURL=index.d.ts.map