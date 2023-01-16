import { APIGatewayProxyHandler } from 'aws-lambda';
import { document } from '../utils/dynamodbClient';
import handlebars from 'handlebars';
import dayjs from 'dayjs';
import { join } from 'path';
import { readFileSync } from 'fs';
import chromium from 'chrome-aws-lambda';
import { S3 } from 'aws-sdk';
import 'dotenv/config'

const certificatesTableName = process.env.DYNAMODB_TABLE_CERTIFICATES

interface ICreateCertificate {
  id: string;
  name: string;
  grade: string;
}

interface ITemplate extends ICreateCertificate {
  medal: string;
  date: string;
}

const compile = (data: ITemplate) => {
  const file = join(process.cwd(), 'src', 'templates', 'certificate.hbs');

  const html = readFileSync(file, 'utf-8');

  return handlebars.compile(html)(data);
};

export const handler: APIGatewayProxyHandler = async event => {
  const { id, name, grade } = JSON.parse(event.body) as ICreateCertificate;

  const table = await document
    .query({
      TableName: certificatesTableName,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id
      }
    })
    .promise();

  const userAlreadyExists = table.Items[0];

  if (!userAlreadyExists) {
    await document
      .put({
        TableName: certificatesTableName,
        Item: {
          id,
          name,
          grade,
          created_at: new Date().getTime()
        }
      })
      .promise();
  }

  const medalPath = join(process.cwd(), 'src', 'templates', 'selo.png');

  const data: ITemplate = {
    id,
    name,
    grade,
    date: dayjs().format('DD/MM/YYYY'),
    medal: readFileSync(medalPath, 'base64')
  };

  const content = compile(data);

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    ignoreHTTPSErrors: true
  });

  const page = await browser.newPage();

  await page.setContent(content);

  const pdf = await page.pdf({
    format: 'a4',
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
    path: process.env.IS_OFFLINE ? './certificate.pdf' : null
  });

  await browser.close();

  const s3 = new S3();

  await s3
    .putObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${id}.pdf`,
      ACL: process.env.S3_BUCKET_ACL,
      Body: pdf,
      ContentType: 'application/pdf'
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      name,
      url: `${process.env.S3_BUCKET_URL}/${id}.pdf`
    })
  };
};
