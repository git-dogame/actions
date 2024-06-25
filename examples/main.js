import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import {
  actionSpecOpenApiPostRequestBody,
  actionsSpecOpenApiGetResponse,
  actionsSpecOpenApiPostResponse,
} from '../openapi';
import {
  ActionsSpecErrorResponse,
  ActionsSpecGetResponse,
  ActionsSpecPostRequestBody,
  ActionsSpecPostResponse,
} from '../../spec/actions-spec';
import mallowApi from './mallow-api';

export const MALLOW_LOGO = 'https://mallow.com/logo.png';

const app = new OpenAPIHono();

app.openapi(
  createRoute({
    method: 'get',
    path: '/{auctionId}',
    tags: ['Mallow Auction'],
    request: {
      params: z.object({
        auctionId: z.string().openapi({
          param: {
            name: 'auctionId',
            in: 'path',
          },
          type: 'string',
          example: '9rWSJKHiRa1vTD5j2Hhht2hRMGmqadLuDHpcnuteEQvF',
        }),
      }),
    },
    responses: actionsSpecOpenApiGetResponse,
  }),
  async (c) => {
    const auctionId = c.req.param('auctionId');

    try {
      const auctionDetails = await mallowApi.getAuctionDetails(auctionId);

      const response: ActionsSpecGetResponse = {
        icon: MALLOW_LOGO,
        label: `Bid on ${auctionDetails.title}`,
        title: `Auction for ${auctionDetails.title}`,
        description: `Place a bid on ${auctionDetails.title}.`,
        links: {
          actions: [
            {
              label: 'Place Bid',
              href: `/api/mallow/bid/${auctionId}`,
            },
          ],
        },
      };

      return c.json(response);
    } catch (error) {
      return Response.json({
        icon: MALLOW_LOGO,
        label: 'Not Available',
        title: 'Auction Not Available',
        description: 'This auction is not available.',
        disabled: true,
        error: {
          message: 'Auction details not found.',
        },
      } satisfies ActionsSpecGetResponse);
    }
  },
);

app.openapi(
  createRoute({
    method: 'post',
    path: '/{auctionId}/bid',
    tags: ['Mallow Auction'],
    request: {
      params: z.object({
        auctionId: z.string().openapi({
          param: {
            name: 'auctionId',
            in: 'path',
          },
          type: 'string',
          example: '9rWSJKHiRa1vTD5j2Hhht2hRMGmqadLuDHpcnuteEQvF',
        }),
      }),
      body: actionSpecOpenApiPostRequestBody,
    },
    responses: actionsSpecOpenApiPostResponse,
  }),
  async (c) => {
    const auctionId = c.req.param('auctionId');
    const { account, bidAmount } = (await c.req.json()) as ActionsSpecPostRequestBody;

    try {
      const bidResponse = await mallowApi.placeBid({
        auctionId,
        userAccount: account,
        bidAmount,
      });

      const response: ActionsSpecPostResponse = {
        transaction: bidResponse.transaction,
      };
      return c.json(response);
    } catch (error) {
      return Response.json(
        {
          message: 'Failed to place bid.',
        } satisfies ActionsSpecErrorResponse,
        {
          status: 422,
        },
      );
    }
  },
);

export default app;
