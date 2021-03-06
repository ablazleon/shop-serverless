# Serverless shop

Serverless shop app

<img src="http://yuml.me/diagram/plain/class/[Frontend]<->[Backend], [Backend]<->[Auth, CreateItem, UpdateTodo, GetTodos, DeleteTodo, GenerateUploadUrl{bg:wheat}], [Backend]<->[DB (Dynamo DB, TODOs)]" >


***Credits***
Udacity Cloud Developer Nanodegree Program

## Intro

## What I learnt

## What I did: rubric accomplishment

-----------

## Intro

This app implements the use case of a shop in which each business can have a listof all the items that it is offering with each price.

# Functionality of the application

This application will allow creating/removing/updating/fetching items. Each item can optionally have an attachment image. Each user only has access to items that he/she has created.

# TODO items

The application should store items, and each item contains the following fields:

* `itemId` (string) - a unique id for an item
* `createdAt` (string) - date and time when an item was created
* `name` (string) - name of an item (e.g. "Carrots 100g")
* `price` (string) - item price
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to an item

You might also store an id of a user who created a item.


# Functions to be implemented

To implement this project, you need to implement the following functions and configure them in the `serverless.yml` file:

* `Auth` - this function should implement a custom authorizer for API Gateway that should be added to all other functions.

* `GetItems` - should return all items for a current user. A user id can be extracted from a JWT token that is sent by the frontend

It should return data that looks like this:

```json
{
  "items": [
    {
      "itemId": "123",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "name": "Carrots 100g",
      "price": "0.5",
      "attachmentUrl": "http://example.com/image.png"
    },
    {
      "todoId": "456",
      "createdAt": "2019-07-27T20:01:45.424Z",
      "name": "Chicken steaks 200g",
      "price": "2",
      "attachmentUrl": "http://example.com/image.png"
    }
  ]
}
```

* `CreateItem` - should create a new item for a current user. A shape of data send by a client application to this function can be found in the `CreateItemRequest.ts` file

It receives a new item to be created in JSON format that looks like this:

```json
{
  "createdAt": "2019-07-27T20:01:45.424Z",
  "name": "Buy milk",
  "dueDate": "2019-07-29T20:01:45.424Z",
  "done": false,
  "attachmentUrl": "http://example.com/image.png"
}
```

It should return a new TODO item that looks like this:

```json

{
  "todoId": "456",
  "createdAt": "2019-07-27T20:01:45.424Z",
  "name": "Chicken steaks 200g",
  "price": "2",
  "attachmentUrl": "http://example.com/image.png"
}

```

* `UpdateItem` - should update an item created by a current user. A shape of data send by a client application to this function can be found in the `UpdateItemRequest.ts` file

It receives an object that contains three fields that can be updated in a TODO item:

```json
{
  "name": "Bread",
  "dueDate": "2019-07-29T20:01:45.424Z",
  "price": "1"
}
```

The id of an item that should be updated is passed as a URL parameter.

It should return an empty body.

* `DeleteItem` - should delete a item created by a current user. Expects an id of a item to remove.

It should return an empty body.

* `GenerateUploadUrl` - returns a pre-signed URL that can be used to upload an attachment file for a item.

It should return a JSON object that looks like this:

```json
{
  "uploadUrl": "https://s3-bucket-name.s3.eu-west-2.amazonaws.com/image.png"
}
```

All functions are already connected to appropriate events from API Gateway.

An id of a user can be extracted from a JWT token passed by a client.

You also need to add any necessary resources to the `resources` section of the `serverless.yml` file such as DynamoDB table and S3 bucket.


# Frontend

The `client` folder contains a web application that can use the API that should be developed in the project.

This frontend should work with your serverless application once it is developed, you don't need to make any changes to the code. The only file that you need to edit is the `config.ts` file in the `client` folder. This file configures your client application just as it was done in the course and contains an API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## Authentication

To implement authentication in your application, you would have to create an Auth0 application and copy "domain" and "client id" to the `config.ts` file in the `client` folder. We recommend using asymmetrically encrypted JWT tokens.

# Best practices

To complete this exercise, please follow the best practices from the 6th lesson of this course.

## Logging

The starter code comes with a configured [Winston](https://github.com/winstonjs/winston) logger that creates [JSON formatted](https://stackify.com/what-is-structured-logging-and-why-developers-need-it/) log statements. You can use it to write log messages like this:

```ts
import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')

// You can provide additional information with every log statement
// This information can then be used to search for log statements in a log storage system
logger.info('User was authorized', {
  // Additional information stored with a log statement
  key: 'value'
})
```


# Grading the submission

Once you have finished developing your application, please set `apiId` and Auth0 parameters in the `config.ts` file in the `client` folder. A reviewer would start the React development server to run the frontend that should be configured to interact with your serverless application.

**IMPORTANT**

*Please leave your application running until a submission is reviewed. If implemented correctly it will cost almost nothing when your application is idle.*

# Suggestions

To store items, you might want to use a DynamoDB table with local secondary index(es). A create a local secondary index you need to create a DynamoDB resource like this:

```yml

TodosTable:
  Type: AWS::DynamoDB::Table
  Properties:
    AttributeDefinitions:
      - AttributeName: partitionKey
        AttributeType: S
      - AttributeName: sortKey
        AttributeType: S
      - AttributeName: indexKey
        AttributeType: S
    KeySchema:
      - AttributeName: partitionKey
        KeyType: HASH
      - AttributeName: sortKey
        KeyType: RANGE
    BillingMode: PAY_PER_REQUEST
    TableName: ${self:provider.environment.TODOS_TABLE}
    LocalSecondaryIndexes:
      - IndexName: ${self:provider.environment.INDEX_NAME}
        KeySchema:
          - AttributeName: partitionKey
            KeyType: HASH
          - AttributeName: indexKey
            KeyType: RANGE
        Projection:
          ProjectionType: ALL # What attributes will be copied to an index

```

To query an index you need to use the `query()` method like:

```ts
await this.dynamoDBClient
  .query({
    TableName: 'table-name',
    IndexName: 'index-name',
    KeyConditionExpression: 'paritionKey = :paritionKey',
    ExpressionAttributeValues: {
      ':paritionKey': partitionKeyValue
    }
  })
  .promise()
```

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.




## What I learnt

In this project I learnt how to implement a webapp in serverless framework. Which maybe much cheaper than using containers on a deployed kubernetes cluster.

THe steps I did were the following:

1. Run frontend: it is checked it is needed to implement initial login
2. Setup serverless framework
    a. npm install -g serverless
    b. Set up a new user in IAM named "serverless" and save the access key and secret key
    c. sls config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY --profile serverless
3. Set up a custom authorizer
    a. Create an app in autho 0.
    b. PUt the certificate into the jwturl of the handler implemented
4. Set the serverless.yml resources
5. Create the CRUD functions


## What I did: rubric accomplishment


- [x] ***The application allows users to create, update, delete TODO items***: 

- A user of the web application can use the interface to create, delete and complete a TODO item.

- [x] ***The application allows users to upload a file.***: 

- A user of the web interface can click on a "pencil" button, then select and upload a file. A file should appear in the list of TODO items on the home page.

- [x] ***The application only displays TODO items for a logged in user***:

- If you log out from a current user and log in as a different user, the application should not show TODO items created by the first account.

- [x] ***Authentication is implemented and does not allow unauthenticated access.***:

- A user needs to authenticate in order to use an application.

### 2) Code Base

- [x] ***The code is split into multiple layers separating business logic from I/O related code.***:

- Code of Lambda functions is split into multiple files/classes. The business logic of an application is separated from code for database access, file storage, and code related to AWS Lambda.

- [x] ***Code is implemented using async/await and Promises without using callbacks.***:

- To get results of asynchronous operations, a student is using async/await constructs instead of passing callbacks.

### 3) Best practices

- [x] ***All resources in the application are defined in the "serverless.yml" file***:

- All resources needed by an application are defined in the "serverless.yml". A developer does not need to create them manually using AWS console.

- [x] ***Each function has its own set of permissions.***:

- Instead of defining all permissions under provider/iamRoleStatements, permissions are defined per function in the functions section of the "serverless.yml".

- [x] ***Application has sufficient monitoring.***:

Application has at least some of the following:

- Distributed tracing is enabled
- It has a sufficient amount of log statements
- It generates application level metrics

- [x] ***HTTP requests are validated***:

- Incoming HTTP requests are validated either in Lambda handlers or using request validation in API Gateway. The latter can be done either using the serverless-reqvalidator-plugin or by providing request schemas in function definitions.

### 4) Architecture

- [x] ***Data is stored in a table with a composite key.***:

- 1:M (1 to many) relationship between users and TODO items is modeled using a DynamoDB table that has a composite key with both partition and sort keys. Should be defined similar to this:

   KeySchema:
      - AttributeName: partitionKey
        KeyType: HASH
      - AttributeName: sortKey
        KeyType: RANGE

- [x] ***Scan operation is not used to read data from a database.***:
    
- TODO items are fetched using the "query()" method and not "scan()" method (which is less efficient on large datasets)



