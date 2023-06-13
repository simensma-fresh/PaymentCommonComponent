import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import { ProgramDailyUploadEntity } from './program-daily-upload.entity';
import { FileTypes } from '../../constants';

@Entity('file_uploaded')
export class FileUploadedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({
    enum: FileTypes,
    default: FileTypes.TDI17,
    name: 'source_file_type',
  })
  sourceFileType: FileTypes;

  @Column({ name: 'source_file_name' })
  sourceFileName: string;

  @Column({ type: 'int4', name: 'source_file_length' })
  sourceFileLength: number;

  @ManyToOne(
    () => ProgramDailyUploadEntity,
    (programDailyUpload) => programDailyUpload.files
  )
  @JoinColumn({ name: 'daily_upload_id' })
  dailyUpload: Relation<ProgramDailyUploadEntity>;
}