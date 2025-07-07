import { Request, Response } from 'express';

export const handleError = (err: any, req: Request, res: Response) => {
    console.error(err); // Log the error for debugging

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
};