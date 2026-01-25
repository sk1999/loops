import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './modules/employee/employee.module';
import { ClientModule } from './modules/client/client.module';
import { SiteModule } from './modules/site/site.module';
import { DeploymentModule } from './modules/deployment/deployment.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { ExcelModule } from './modules/excel/excel.module';
import { TradeCategoryModule } from './modules/trade-category/trade-category.module';
import { MonthLockModule } from './modules/month-lock/month-lock.module';
import { ProductivityModule } from './modules/productivity/productivity.module';

// Database configuration with logging
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306');
const dbUsername = process.env.DB_USERNAME || 'root';
const dbPassword = process.env.DB_PASSWORD || 'password';
const dbDatabase = process.env.DB_DATABASE || 'loops';

// Log database connection details
console.log('\n========================================');
console.log('📊 Database Connection Configuration:');
console.log('========================================');
console.log(`Host: ${dbHost}`);
console.log(`Port: ${dbPort}`);
console.log(`Database: ${dbDatabase}`);
console.log(`Username: ${dbUsername}`);
console.log(`Password: ${dbPassword} (length: ${dbPassword.length})`);
console.log(`Password from env: ${process.env.DB_PASSWORD ? `"${process.env.DB_PASSWORD}" (${process.env.DB_PASSWORD.length} chars)` : 'NOT SET - using default "root"'}`);
console.log(`Username from env: ${process.env.DB_USERNAME ? `"${process.env.DB_USERNAME}"` : 'NOT SET - using default "root"'}`);
console.log(`Database from env: ${process.env.DB_DATABASE ? `"${process.env.DB_DATABASE}"` : 'NOT SET - using default "hr_payroll"'}`);
console.log('========================================\n');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: dbHost,
      port: dbPort,
      username: dbUsername,
      password: dbPassword,
      database: dbDatabase,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev only
      logging: process.env.NODE_ENV === 'development',
      charset: 'utf8mb4',
    }),
    EmployeeModule,
    ClientModule,
    SiteModule,
    DeploymentModule,
    AttendanceModule,
    PayrollModule,
    ExcelModule,
    TradeCategoryModule,
    MonthLockModule,
    ProductivityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

