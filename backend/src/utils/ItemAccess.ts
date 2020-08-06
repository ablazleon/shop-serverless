import * as AWS from "aws-sdk";

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {Item} from "../models/Item";
import * as uuid from 'uuid'
import { createLogger } from './logger'
import {CreateItemRequest} from "../requests/CreateItemRequest";
import {UpdateItemRequest} from "../requests/UpdateItemRequest";
const logger = createLogger('ItemAccess');

const bucketName = process.env.ITEM_S3_BUCKET_NAME;

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

/**
 * Access allow facing with the data resources as the db and image.
 */
export class ItemAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly itemTable = process.env.ITEM_TABLE,
        private readonly itemTableGsi = process.env.ITEM_TABLE_GSI ) {
    }

    async getTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Fetching all items for userId', {userId: userId})

        const result = await this.docClient.query({
            TableName: this.itemTable,
            IndexName: this.itemTableGsi,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        const items = result.Items

        logger.info("Fetching complete.", items)

        return items as Item[]
    }

    async createTodo(userId: string, newItem: CreateTodoRequest): Promise<string> {
        const itemId = uuid.v4();

        const newItemWithAdditionalInfo = {
            userId: userId,
            itemId: itemId,
            ...newItem
        }

        logger.info("Creating a new item object:", newItemWithAdditionalInfo);

        await this.docClient.put({
            TableName: this.itemTable,
            Item: newItemWithAdditionalInfo
        }).promise();

        logger.info("Creation complete.")

        return itemId;

    }

    async deleteItem(itemId: string) {
        logger.info("Deleting item:", {itemId: itemId});
        await this.docClient.delete({
            TableName: this.itemTable,
            Key: {
                "itemId": itemId
            }
        }).promise();
        logger.info("Delete complete.", {itemId: itemId});
    }

    async updateItem(itemId: string, updatedItem: UpdateItemRequest){

        logger.info("Updating item:", {
            itemId: itemId,
            updatedItem: updatedItem
        });
        await this.docClient.update({
            TableName: this.itemTable,
            Key: {
                "itemId": itemId
            },
            UpdateExpression: "set #itemName = :name, price = :price
            ExpressionAttributeNames: {
                "#itemName": "name"
            },
            ExpressionAttributeValues: {
                ":name": updatedItem.name,
                ":price": updatedItem.price
            }
        }).promise()

        logger.info("Update complete.")

    }

    async updateTodoAttachmentUrl(todoId: string, userId: string, attachmentUrl: string){

        logger.info(`Updating todoId ${todoId} with attachmentUrl ${attachmentUrl}`)

        await this.docClient.update({
            TableName: this.itemTable,
            Key: {
                "userId": userId,
                "itemId": itemId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": `https://${bucketName}.s3.amazonaws.com/${attachmentUrl}`
            }
        }).promise();
    }

}