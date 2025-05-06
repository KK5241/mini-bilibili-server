-- 创建数据库
CREATE DATABASE IF NOT EXISTS bilibili DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bilibili;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `bio` text,
  `followers` int DEFAULT '0',
  `following` int DEFAULT '0',
  `role` varchar(20) DEFAULT 'user',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户关注关系表
CREATE TABLE IF NOT EXISTS `user_followers` (
  `followerId` int NOT NULL,
  `followingId` int NOT NULL,
  PRIMARY KEY (`followerId`,`followingId`),
  KEY `IDX_follower` (`followerId`),
  KEY `IDX_following` (`followingId`),
  CONSTRAINT `FK_follower` FOREIGN KEY (`followerId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_following` FOREIGN KEY (`followingId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 视频表
CREATE TABLE IF NOT EXISTS `video` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `cover` varchar(255) NOT NULL,
  `videoUrl` varchar(255) NOT NULL,
  `duration` varchar(20) DEFAULT NULL,
  `views` int DEFAULT '0',
  `likes` int DEFAULT '0',
  `favorites` int DEFAULT '0',
  `shares` int DEFAULT '0',
  `isPremium` tinyint DEFAULT '0',
  `status` tinyint DEFAULT '1',
  `hasWisdomCourse` tinyint DEFAULT '0',
  `teacher` varchar(100) DEFAULT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_video_user` (`userId`),
  CONSTRAINT `FK_video_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论表
CREATE TABLE IF NOT EXISTS `comment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `likes` int DEFAULT '0',
  `userId` int NOT NULL,
  `videoId` int NOT NULL,
  `parentId` int DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_comment_user` (`userId`),
  KEY `FK_comment_video` (`videoId`),
  KEY `FK_comment_parent` (`parentId`),
  CONSTRAINT `FK_comment_parent` FOREIGN KEY (`parentId`) REFERENCES `comment` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_comment_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_comment_video` FOREIGN KEY (`videoId`) REFERENCES `video` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 弹幕表
CREATE TABLE IF NOT EXISTS `danmu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `time` float NOT NULL,
  `color` int DEFAULT '0',
  `type` int DEFAULT '0',
  `userId` int NOT NULL,
  `videoId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_danmu_user` (`userId`),
  KEY `FK_danmu_video` (`videoId`),
  CONSTRAINT `FK_danmu_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_danmu_video` FOREIGN KEY (`videoId`) REFERENCES `video` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入一些示例数据

-- 创建管理员用户 (密码为: admin123)
INSERT INTO `user` (`username`, `password`, `role`) VALUES 
('admin', '$2b$10$JqOqD4U8OYQh3kNdvO4Mxeih1YnB6gCfmnN6J/mKgqVDh1hiZlKOq', 'admin');

-- 创建普通用户 (密码为: password123)
INSERT INTO `user` (`username`, `password`, `avatar`, `bio`) VALUES 
('user1', '$2b$10$SJlr2mT8qQ5n8N6J3CzH5.4/pYREdUY0jkJ.zGRVjhCqmQxQb7iWe', 'https://picsum.photos/200/200?random=1', '热爱学习的普通用户'),
('user2', '$2b$10$SJlr2mT8qQ5n8N6J3CzH5.4/pYREdUY0jkJ.zGRVjhCqmQxQb7iWe', 'https://picsum.photos/200/200?random=2', '视频创作者'),
('user3', '$2b$10$SJlr2mT8qQ5n8N6J3CzH5.4/pYREdUY0jkJ.zGRVjhCqmQxQb7iWe', 'https://picsum.photos/200/200?random=3', '教育工作者');

-- 创建一些视频示例
INSERT INTO `video` (`title`, `description`, `cover`, `videoUrl`, `duration`, `userId`, `teacher`, `isPremium`) VALUES
('高等数学（一）', '本课程主要介绍微积分的基础知识', 'https://picsum.photos/300/200?random=1', 'https://example.com/videos/1.mp4', '45:21', 3, '朱键民', 1),
('机械设计基础（第三版）', '本课程系统介绍了机械设计的基本方法', 'https://picsum.photos/300/200?random=2', 'https://example.com/videos/2.mp4', '32:15', 3, '徐亮', 1),
('Python数据爬取与可视化', '从零开始学习Python数据爬取及可视化技术', 'https://picsum.photos/300/200?random=3', 'https://example.com/videos/3.mp4', '51:08', 2, '李晓昀', 0),
('线性代数', '本课程介绍线性代数的基本概念和应用', 'https://picsum.photos/300/200?random=4', 'https://example.com/videos/4.mp4', '42:17', 3, '秦静', 1),
('大数据导论', '大数据如何改变世界', 'https://picsum.photos/300/200?random=5', 'https://example.com/videos/5.mp4', '36:45', 2, '赵春辉', 1);

-- 创建一些评论示例
INSERT INTO `comment` (`content`, `userId`, `videoId`) VALUES
('讲解非常清晰，很好理解', 1, 1),
('老师讲得太棒了，终于理解了这个概念', 2, 1),
('这门课对我帮助很大', 1, 2),
('希望能有更详细的习题讲解', 3, 1),
('视频质量很高，声音也很清晰', 1, 3);

-- 创建子评论
INSERT INTO `comment` (`content`, `userId`, `videoId`, `parentId`) VALUES
('我也觉得，尤其是微分部分讲得特别好', 3, 1, 1),
('同意，希望能出第二部分', 2, 2, 3);

-- 创建一些弹幕示例
INSERT INTO `danmu` (`content`, `time`, `color`, `userId`, `videoId`) VALUES
('讲得真好！', 15.5, 16777215, 1, 1),
('这里没听懂...', 120.0, 16777215, 2, 1),
('这个公式很重要', 180.3, 16711680, 3, 1),
('我终于理解了', 200.5, 16777215, 1, 2),
('建议放慢速度', 45.0, 16777215, 2, 3); 