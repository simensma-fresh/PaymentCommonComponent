import * as fs from 'fs';
import path from 'path';
import { createMock } from '@golevelup/ts-jest';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileTypes } from '../../../src/constants';
import { FileIngestionRulesEntity } from '../../../src/parse/entities/file-ingestion-rules.entity';
import { FileUploadedEntity } from '../../../src/parse/entities/file-uploaded.entity';
import { ProgramDailyUploadEntity } from '../../../src/parse/entities/program-daily-upload.entity';
import { ParseService } from '../../../src/parse/parse.service';
import { PaymentMethodService } from '../../../src/transaction/payment-method.service';
import { FileIngestionRulesMock } from '../../mocks/classes/file_ingestion_rules_mock';
import { FileUploadedMock } from '../../mocks/classes/file_upload_mock';

describe('ParseService', () => {
  let service: ParseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParseService,
        {
          provide: PaymentMethodService,
          useValue: createMock<PaymentMethodService>(),
        },
        {
          provide: Logger,
          useValue: createMock<Logger>(),
        },
        {
          provide: getRepositoryToken(FileIngestionRulesEntity),
          useValue: createMock<Repository<FileIngestionRulesEntity>>(),
        },
        {
          provide: getRepositoryToken(ProgramDailyUploadEntity),
          useValue: createMock<Repository<ProgramDailyUploadEntity>>(),
        },
        {
          provide: getRepositoryToken(FileUploadedEntity),
          useValue: createMock<Repository<FileUploadedEntity>>(),
        },
      ],
    }).compile();

    service = module.get<ParseService>(ParseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('determines whether a daily upload is successful', () => {
    it('should be successful if all files are present', () => {
      const rule = new FileIngestionRulesMock(
        'SBC',
        'tdi17',
        'tdi34',
        'sbc_sales'
      );
      const tdi17 = new FileUploadedMock(
        FileTypes.TDI17,
        '2023-01-01-tdi17.dat'
      );
      const tdi34 = new FileUploadedMock(
        FileTypes.TDI34,
        '2023-01-01-tdi34.dat'
      );
      const sales = new FileUploadedMock(
        FileTypes.SBC_SALES,
        '2023-01-01-sbc_sales.dat'
      );
      const successful = service.determineDailySuccess(rule, [
        tdi17,
        tdi34,
        sales,
      ]);
      expect(successful).toBe(true);
    });

    it('should be successful if all required files are present - not necessarily all 3', () => {
      const rule = new FileIngestionRulesMock(
        'SBC',
        'tdi17',
        'tdi34',
        undefined
      );
      const tdi17 = new FileUploadedMock(
        FileTypes.TDI17,
        '2023-01-01-tdi17.dat'
      );
      const tdi34 = new FileUploadedMock(
        FileTypes.TDI34,
        '2023-01-01-tdi34.dat'
      );
      const successful = service.determineDailySuccess(rule, [tdi17, tdi34]);
      expect(successful).toBe(true);
    });

    it('should fail if one or more of the required files are not present', () => {
      const rule = new FileIngestionRulesMock(
        'SBC',
        'tdi17',
        'tdi34',
        undefined
      );
      const tdi17 = new FileUploadedMock(
        FileTypes.TDI17,
        '2023-01-01-tdi17.dat'
      );
      const successful = service.determineDailySuccess(rule, [tdi17]);
      expect(successful).toBe(false);
    });
  });

  describe('parsers should throw errors when necessary', () => {
    it('should parse garms transaction json files and pass validation if necessary fields are present', async () => {
      const transactionFile = fs.readFileSync(
        path.join(__dirname, '../../../sample-files/garms.json')
      );
      expect(
        (
          await service.parseGarmsFile(
            transactionFile.toString(),
            'filename.json'
          )
        )[0].total_transaction_amount
      ).toEqual(100);
    });

    it('should parse garms transaction json files and not pass validation if the dto is not met', async () => {
      const transactionFile = fs.readFileSync(
        path.join(__dirname, '../../../sample-files/invalid-files/garms.json')
      );
      expect(
        service.parseGarmsFile(transactionFile.toString(), 'filename.json')
      ).rejects.toThrow();
    });

    it('should parse tdi17 dat files and pass validation if necessary fields are present', async () => {
      const tdi17File = fs.readFileSync(
        path.join(__dirname, '../../../sample-files/TDI17.TXT')
      );
      expect(
        (await service.parseTDICashFile('filename.DAT', 'SBC', tdi17File))[0]
          .deposit_amt_curr
      ).toEqual(558.31);
    });

    it('should parse tdi17 dat files and not pass validation if the dto is not met', async () => {
      const tdi17File = fs.readFileSync(
        path.join(__dirname, '../../../sample-files/invalid-files/TDI17.TXT')
      );
      expect(
        service.parseTDICashFile('filename.DAT', 'SBC', tdi17File)
      ).rejects.toThrow();
    });

    it('should parse tdi34 dat files and pass validation if necessary fields are present', async () => {
      const tdi34File = fs.readFileSync(
        path.join(__dirname, '../../../sample-files/TDI34.TXT')
      );
      expect(
        (await service.parseTDICardsFile('filename.DAT', 'SBC', tdi34File))[0]
          .transaction_amt
      ).toEqual(17);
    });

    it('should parse tdi34 dat files and not pass validation if the dto is not met', async () => {
      const tdi34File = fs.readFileSync(
        path.join(__dirname, '../../../sample-files/invalid-files/TDI34.TXT')
      );
      expect(
        service.parseTDICardsFile('filename.DAT', 'SBC', tdi34File)
      ).rejects.toThrow();
    });
  });
});