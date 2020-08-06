import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserIdFromEvent } from '../../auth/utils'
import {ItemAccess} from "../../utils/ItemAccess";

/**
 * Create a todo
 **/

const itemAccess = new ItemAccess();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newItem: CreateItemRequest = JSON.parse(event.body)

  const userId = getUserIdFromEvent(event);

  // TODO: Implement creating a new TODO item
  const itemId = await itemAccess.createItem(userId, newItem);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item:
          {
            todoId: itemId,
            ...newItem
          }
    })
  };
};
