export class AddResourceDto {
  title!: string; 
  type!: 'pdf' | 'word' | 'video' | 'quiz';

  file?: Express.Multer.File;

  url?: string;

}


