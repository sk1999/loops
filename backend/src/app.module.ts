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

// Database configuration with production environment variables
let dbHost, dbPort, dbUsername, dbPassword, dbDatabase;

// Check if DATABASE_URL is provided (preferred for production)
if (process.env.DATABASE_URL) {
  const dbUrl = new URL(process.env.DATABASE_URL);
  dbHost = dbUrl.hostname || 'localhost';
  dbPort = parseInt(dbUrl.port) || 3306;
  dbUsername = dbUrl.username || 'loops_user';
  dbPassword = dbUrl.password || 'password';
  dbDatabase = dbUrl.pathname.slice(1) || 'loops'; // Remove leading slash
} else {
  // Fallback to individual environment variables
  dbHost = process.env.DATABASE_HOST || 'localhost';
  dbPort = parseInt(process.env.DATABASE_PORT || '3306');
  dbUsername = process.env.DATABASE_USER || 'hr_user';
  dbPassword = process.env.DATABASE_PASSWORD || 'hr_password';
  dbDatabase = process.env.DATABASE_NAME || 'hr_payroll';
}

// Log database connection details in development only
if (process.env.NODE_ENV !== 'production') {
  console.log('\n========================================');
  console.log('📊 Database Connection Configuration:');
  console.log('========================================');
  console.log(`Host: ${dbHost}`);
  console.log(`Port: ${dbPort}`);
  console.log(`Database: ${dbDatabase}`);
  console.log(`Username: ${dbUsername}`);
  console.log('========================================\n');
}

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

