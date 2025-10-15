export class AddResourceDto {
  title!: string; // resource display name
  type!: 'pdf' | 'word' | 'video' | 'quiz';
  // When uploading a file (pdf/word), the controller/middleware can attach it
  file?: Express.Multer.File;
  // For link-based resources (e.g., video url)
  url?: string;
}


