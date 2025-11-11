import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Create a subdirectory for quiz images if it doesn't exist
      const quizImagesDir = path.join(uploadDir, 'quiz-images');
      if (!fs.existsSync(quizImagesDir)) {
        fs.mkdirSync(quizImagesDir, { recursive: true });
      }
      
      cb(null, quizImagesDir);
    },
    filename: (req, file, cb) => {
      // Generate a unique filename with original extension
      const randomName = uuidv4();
      cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
};
