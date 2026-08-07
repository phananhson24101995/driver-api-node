import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Account, AccountDocument } from './domain/entities/account.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  console.log('Khởi tạo ứng dụng NestJS...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const accountModel = app.get<Model<AccountDocument>>(
      getModelToken(Account.name),
    );

    const accountsToSeed = [
      { username: 'khanhtm', role: 'teacher' },
      { username: 'thaodd', role: 'teacher' },
      { username: 'giangnv', role: 'teacher' },
      { username: 'sonpa', role: 'teacher' },
      { username: 'duynd', role: 'teacher' },
      { username: 'tuanpa', role: 'teacher' },
      { username: 'caucuong', role: 'teacher' },
      { username: 'supperadmin', role: 'superp_admin' },
      { username: 'admin', role: 'admin' },
    ];

    const defaultPassword = '12345678'; // Mật khẩu mặc định cho các tài khoản
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    for (const acc of accountsToSeed) {
      const exists = await accountModel.findOne({ username: acc.username });
      if (exists) {
        console.log(`⚠️ Tài khoản '${acc.username}' đã tồn tại. Bỏ qua.`);
      } else {
        const newAccount = new accountModel({
          username: acc.username,
          password_hash: hashedPassword,
          role: acc.role,
        });
        await newAccount.save();
        console.log(`✅ Đã tạo tài khoản: ${acc.username}`);
      }
    }

    console.log('🎉 Hoàn tất quá trình seed dữ liệu Accounts!');
    console.log(`Mật khẩu mặc định cho các tài khoản là: ${defaultPassword}`);
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu Accounts:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
