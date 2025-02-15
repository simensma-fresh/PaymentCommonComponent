/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { InjectAwsService } from 'nest-aws-sdk';

@Injectable()
export class S3ManagerService {
  constructor(@InjectAwsService(S3) public readonly s3: S3) {}

  async listBucketContents(bucket: string) {
    const response = await this.s3.listObjectsV2({ Bucket: bucket }).promise();
    return response.Contents?.map((c) => c.Key);
  }

  async getObject(bucket: string, key: string) {
    const response = await this.s3
      .getObject({ Bucket: bucket, Key: key })
      .promise();
    return response;
  }

  async getObjectStream(bucket: string, key: string) {
    const response = await this.s3
      .getObject({ Bucket: bucket, Key: key })
      .createReadStream();
    return response;
  }

  async putObject(bucket: string, key: string, body: Buffer) {
    const response = await this.s3
      .putObject({ Bucket: bucket, Key: key, Body: body })
      .promise();
    return response;
  }
}
