import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class UploadsService {
  // 获取文件完整URL
  getFileUrl(filePath: string): string {
    // 如果是空值则返回默认路径
    if (!filePath) {
      return '';
    }
    
    // 如果已经是完整URL，则直接返回
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    
    // 如果以uploads开头，意味着是上传路径，不需要再添加uploads前缀
    if (filePath.startsWith('/uploads/') || filePath.startsWith('uploads/')) {
      // 规范化路径
      const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
      
      // 获取环境变量中的服务器地址，默认为本地开发环境
      const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
      
      return `${serverUrl}${normalizedPath}`;
    }
    
    // 处理文件路径，确保添加uploads前缀
    // 可能的情况: "covers/filename.jpg" 或 "videos/filename.mp4"
    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
    return `${serverUrl}/uploads${normalizedPath}`;
  }
  
  // 检查文件路径是否为服务器上的文件
  isLocalFile(filePath: string): boolean {
    return !filePath.startsWith('http://') && !filePath.startsWith('https://');
  }
} 