
export interface Schema{
    tags?: string[];
    body?: object;
    data?: object;
    params?: object;
    response?: any;
    description?: string;
    summary?: string;
    url?: string;
}