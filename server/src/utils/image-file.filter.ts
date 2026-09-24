import { Request } from 'express';
import { FileFilterCallback } from 'multer';

export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    // @ts-ignore
    return cb(new Error('Only JPG, PNG, GIF files are allowed!'), false);
  }

  cb(null, true);
};
