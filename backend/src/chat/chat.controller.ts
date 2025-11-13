import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkMessagesReadDto } from './dto/mark-read.dto';
import { AuthGuard } from '../auth/auth.guard';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(@Request() req, @Body() createChatDto: CreateChatDto) {
    return this.chatService.createChat(req.user.sub, createChatDto);
  }

  @Get()
  async getUserChats(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.chatService.getUserChats(req.user.sub, pageNum, limitNum, search);
  }

  @Get(':id')
  async getChatById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.chatService.getChatById(req.user.sub, id);
  }

  @Get(':id/messages')
  async getChatMessages(
    @Request() req,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('lastMessageId') lastMessageId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const lastMsgId = lastMessageId ? parseInt(lastMessageId, 10) : undefined;
    return this.chatService.getChatMessages(req.user.sub, id, pageNum, limitNum, lastMsgId);
  }

  @Post(':id/messages')
  async sendMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(req.user.sub, id, sendMessageDto);
  }

  @Post(':id/read')
  async markMessagesAsRead(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() markReadDto: MarkMessagesReadDto,
  ) {
    return this.chatService.markMessagesAsRead(req.user.sub, id, markReadDto);
  }

  @Delete(':chatId/messages/:messageId')
  async deleteMessage(
    @Request() req,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    return this.chatService.deleteMessage(req.user.sub, chatId, messageId);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(process.cwd(), 'uploads', 'chat');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      fileUrl: `/uploads/chat/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  @Get('users/search')
  async getUsers(
    @Query('search') search?: string,
    @Query('exclude') exclude?: string,
    @Query('limit') limit?: string,
  ) {
    const excludeIds = exclude ? exclude.split(',').map(id => parseInt(id, 10)) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.chatService.getUsers(search, excludeIds, limitNum);
  }


  @Post('status')
  async updateUserStatus(@Request() req, @Body() { isOnline }: { isOnline: boolean }) {
    return this.chatService.updateUserStatus(req.user.sub, isOnline);
  }
}
