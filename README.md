# Serverless - AWS Node.js Typescript

This project has been generated using the `aws-nodejs-typescript` template from the [Serverless framework](https://www.serverless.com/).

For detailed instructions, please refer to the [documentation](https://www.serverless.com/framework/docs/providers/aws/).


1. [Installation/deployment instructions](#Installation/deployment)
2. [Services](#Services)
3. [Techs](#techs-used)


## Installation/deployment

</br>

> **Requirements**: NodeJS `lts/fermium (v.14.15.0)`. If you're using [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to ensure you're using the same Node version in local and in your lambda's runtime.

</br>


- Run `npm i` to install the project dependencies
- Create an `.env` file with the variables declared in `serverless.ts` at line *20*.
- Run `npm run dynamodb:install` to create a local dynamodb server.
- Run `npm run dynamodb:start` to start the local dynamodb server.
- Run `npm run dev` to make functions listen to _http_ triggers.
- Go to [AWS IAM management console](https://aws.amazon.com/pt/iam/) and create an user with **AdministratorAccess** role.
- Copy the **access key id** and **access key** and run `serverless config credentials --provider aws --key={your_access_key_id} --secret={your_secret_key} -o`
- Run `npm run deploy` to deploy this stack to AWS

</br>

> **Warning** : After deploying this application, open an endpoint on your AWS account resources and an S3 bucket in a **public** way. Anyone with the URL can actively run the API Gateway endpoint and the corresponding lambda. You should secure this endpoint with the authentication method of your choice to avoid billing surprises.

## Services

### Generate a certificate

This function has a single responsibility to generate certificates. 

You can be call this service by  HTTP request  made on the provisioned API Gateway REST API `/generateCertificate` route with `POST` method. 
The request body must be provided as `application/json` with the following format:

```TypeScript
{
    "id": "User unique id",
    "user_name": "User name",
    "grade": 0
}
```

Sending the request with required payload, this service returns with `200` HTTP status code and body containing the generated certificate url to download or share:

```TypeScript
{
    "url": "https://{your_s3_bucket_name}.s3.amazonaws.com/{user_id}"
}
```

Running locally, this service will generate a certificate.pdf file at the root of the project.

### Verify a certificate

This function has a single responsibility to validate certificates. 

You can be call this service by  HTTP request  made on the provisioned API Gateway REST API `/generateCertificate/{id}` route with `GET` method.

If valid, this service returns with `200` HTTP status code and body containing the certificate data and certificate_status key as 'Válido'. See an sample:

```TypeScript
{
    "id": "df446858-921c-11ed-a1eb-0242ac120002",
    "grade": 10,
    "created_at": "2023-01-15T19:28:55.865Z",
    "certificate_status": "Válido",
    "url": "https://ignite-node-certificates.s3.amazonaws.com/df446858-921c-11ed-a1eb-0242ac120002.pdf"
}
```

Otherwise, returns with `200` HTTP status code and body containing only certificate_status key as 'Inválido'.

## Techs used

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![AmazonDynamoDB](https://img.shields.io/badge/Amazon%20DynamoDB-4053D6?style=for-the-badge&logo=Amazon%20DynamoDB&logoColor=white)](https://aws.amazon.com/pt/dynamodb/)
[![Serverless](https://img.shields.io/badge/Serverless-black?style=for-the-badge&logo=Serverless)](https://serverless.com)
[![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-f8991d?style=for-the-badge&logo=AWS+Lambda&logoColor=white)](https://aws.amazon.com/pt/lambda/)
[![Amazon S3](https://img.shields.io/badge/Amazon_S3-red?style=for-the-badge&logo=Amazon+S3&logoColor=white)](https://aws.amazon.com/pt/s3/?nc2=h_ql_prod_fs_s3)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-white?style=for-the-badge&logo=Puppeteer)](https://pptr.dev/)