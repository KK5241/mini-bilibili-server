import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('uploads')
export class UploadsController {
  @UseGuards(JwtAuthGuard)
  @Post('cover')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/covers',
      filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('只允许上传图片文件!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB限制
    }
  }))
  uploadCoverImage(@UploadedFile() file) {
    return {
      filename: file.filename,
      url: `/uploads/covers/${file.filename}`
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('只允许上传图片文件!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 2 * 1024 * 1024 // 2MB限制
    }
  }))
  uploadAvatar(@UploadedFile() file) {
    return {
      filename: file.filename,
      url: `/uploads/avatars/${file.filename}`
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('video')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/videos',
      filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(mp4|webm|ogg|mov)$/)) {
        return cb(new Error('只允许上传视频文件!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 100 * 1024 * 1024 // 100MB限制
    }
  }))
  uploadVideo(@UploadedFile() file) {
    return {
      filename: file.filename,
      path: `/uploads/videos/${file.filename}`
    };
  }
} 