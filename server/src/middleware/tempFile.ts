import { Request, Response, NextFunction } from 'express';
import fs from 'fs';

export const cleanupTempFile = (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error('Error deleting temporary file:', err);
                } else {
                    console.log(`Successfully deleted temporary file: ${req.file?.path}`);
                }
            });
        }
    });
    next();
};