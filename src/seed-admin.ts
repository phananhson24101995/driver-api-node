import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Account, AccountDocument } from './domain/entities/account.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  console.log('Initializing NestJS application context...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Lấy model Account với kiểu AccountDocument để sửa lỗi unsafe assignment of any
    const accountModel = app.get<Model<AccountDocument>>(
      getModelToken(Account.name),
    );

    const adminUsername = 'admin';
    const existingAdmin = await accountModel.findOne({
      username: adminUsername,
    });

    if (existingAdmin) {
      console.log(`⚠️ Admin account '${adminUsername}' already exists.`);
    } else {
      console.log(`Creating admin account '${adminUsername}'...`);
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new accountModel({
        username: adminUsername,
        password_hash: hashedPassword,
        role: 'admin',
      });
      await admin.save();
      console.log('✅ Admin account created successfully!');
      console.log('Username: admin');
      console.log('Password: admin123');
    }
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
