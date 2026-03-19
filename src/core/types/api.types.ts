export interface BaseResponse<T = any> {
    statusCode: number;
    isSuccessful: boolean;
    message: string;
    payload: T;
    details: string;
}
