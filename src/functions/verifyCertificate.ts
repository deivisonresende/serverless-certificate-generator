import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from '../utils/dynamodbClient'
import 'dotenv/config'

const certificatesTableName = process.env.DYNAMODB_TABLE_CERTIFICATES

interface IUserCertificate {
  id: string;
  name: string;
  grade: string;
  created_at: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const { id } = event.pathParameters

  const { Items } = await document
  .query({
    TableName: certificatesTableName,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': id
    }
  })
  .promise();

  const certificate = Items[0] as IUserCertificate

  if(!certificate)  return { statusCode: 200, body: JSON.stringify({ certificate_status: 'Inválido' })}

  return {
    statusCode: 200,
    body: JSON.stringify({
      id: certificate.id,
      name: certificate.name,
      grade: certificate.grade,
      created_at: new Date(certificate.created_at).toISOString(),
      certificate_status: 'Válido',
      url: `${process.env.S3_BUCKET_URL}/${certificate.id}.pdf`
    })
  }
}