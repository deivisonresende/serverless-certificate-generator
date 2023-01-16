import type { AWS } from '@serverless/typescript';
import 'dotenv/config';

const serverlessConfiguration: AWS = {
  service: 'certificate-generator',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-dynamodb-local',
    'serverless-offline'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
      S3_BUCKET_URL: process.env.S3_BUCKET_URL,
      S3_BUCKET_ACL: process.env.S3_BUCKET_ACL,
      DYNAMODB_TABLE_CERTIFICATES: process.env.DYNAMODB_TABLE_CERTIFICATES
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['dynamodb:*'],
        Resource: ['*']
      },
      {
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: ['*']
      }
    ]
  },
  functions: {
    generateCertificate: {
      handler: 'src/functions/generateCertificate.handler',
      events: [
        {
          http: {
            path: 'generateCertificate',
            method: 'post',
            cors: true
          }
        }
      ]
    },
    verifyCertificate: {
      handler: 'src/functions/verifyCertificate.handler',
      events: [
        {
          http: {
            path: 'verifyCertificate/{id}',
            method: 'get',
            cors: true
          }
        }
      ]
    }
  },
  package: { individually: false, include: ['./src/templates/**'] },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
      external: ['chrome-aws-lambda']
    },
    dynamodb: {
      stages: ['dev', 'local'],
      start: {
        port: 8080,
        inMemory: true,
        migrate: true
      }
    }
  },
  resources: {
    Resources: {
      dbCertificateUsers: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: process.env.DYNAMODB_TABLE_CERTIFICATES,
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          },
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S'
            }
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH'
            }
          ]
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
