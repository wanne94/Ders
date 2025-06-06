export declare const API_ENDPOINTS: {
    readonly AUTH: {
        readonly LOGIN: "/auth/login";
        readonly REGISTER: "/auth/register";
        readonly LOGOUT: "/auth/logout";
        readonly REFRESH: "/auth/refresh";
        readonly PROFILE: "/auth/profile";
    };
    readonly USERS: {
        readonly LIST: "/users";
        readonly CREATE: "/users";
        readonly UPDATE: "/users";
        readonly DELETE: "/users";
    };
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const STORAGE_KEYS: {
    readonly AUTH_TOKEN: "auth_token";
    readonly USER_DATA: "user_data";
    readonly THEME: "theme";
    readonly LANGUAGE: "language";
};
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 10;
    readonly MAX_LIMIT: 100;
};
export declare const VALIDATION: {
    readonly MIN_PASSWORD_LENGTH: 8;
    readonly MAX_PASSWORD_LENGTH: 128;
    readonly MIN_NAME_LENGTH: 2;
    readonly MAX_NAME_LENGTH: 50;
};
//# sourceMappingURL=index.d.ts.map