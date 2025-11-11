import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import * as fs from 'fs';
import * as crypto from 'crypto';

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

@Injectable()
export class FileUploadService {
  private readonly uploadPath = join(process.cwd(), 'uploads');

  async ensureUploadsDir() {
    if (!(await exists(this.uploadPath))) {
      await mkdir(this.uploadPath, { recursive: true });
    }
  }

  generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = originalName.split('.').pop();
    return `${timestamp}-${randomString}.${extension}`;
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    await this.ensureUploadsDir();
    
    const fileName = this.generateUniqueFileName(file.originalname);
    const filePath = join(this.uploadPath, fileName);
    
    return new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath);
      
      writeStream.on('finish', () => {
        // Return the relative path that can be used to serve the file
        resolve(`/uploads/${fileName}`);
      });
      
      writeStream.on('error', (error) => {
        reject(error);
      });
      
      writeStream.write(file.buffer);
      writeStream.end();
    });
  }
}
