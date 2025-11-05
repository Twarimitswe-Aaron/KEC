// src/file-upload/file-upload.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Create uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'uploads/quiz-images');
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }

        return {
          storage: diskStorage({
            destination: uploadDir,
            filename: (req, file, cb) => {
              const randomName = Array(32)
                .fill(null)
                .map(() => Math.round(Math.random() * 16).toString(16))
                .join('');
              return cb(null, `${randomName}${extname(file.originalname)}`);
            },
          }),
          limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
          },
          fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
              cb(null, true);
            } else {
              cb(new Error('Only image files are allowed!'), false);
            }
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MulterModule],
})
export class FileUploadModule {}
