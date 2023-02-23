import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { AwsSdkModule } from 'nest-aws-sdk';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { DepositModule } from './deposits/deposit.module';
import { ExceptionModule } from './exception/exception.module';
import { LocationModule } from './location/location.module';
import { LoggerModule } from './logger/logger.module';
import { ParseModule } from './parse/parse.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { ReportingModule } from './reporting/reporting.module';
import { S3ManagerModule } from './s3-manager/s3-manager.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    S3ManagerModule,
    ReconciliationModule,
    DepositModule,
    TransactionModule,
    ParseModule,
    LocationModule,
    ExceptionModule,
    ReportingModule,
    ConfigModule.forRoot({
      ignoreEnvFile:
        process.env.RUNTIME_ENV === 'local' || process.env.RUNTIME_ENV === 'ci'
          ? false
          : true
    }),
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        ...(process.env.RUNTIME_ENV === 'local' || process.env.RUNTIME_ENV === 'ci'
          ? {
              endpoint: process.env.AWS_ENDPOINT || 'http://localhost:9000',
              region: 'ca-central-1',
              s3ForcePathStyle: true
            }
          : {})
      },
      services: [S3]
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
