/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  LARK_BOT_URL: string;
}
async function sendLarkMessage(larkBotUrl: string, body: Object) {
  return await fetch(larkBotUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
function generateLarkCard({
  event,
  action,
  type,
  body,
  createdAt,
  url,
  userId,
}: {
  event: string;
  action: string;
  type: string;
  body: string;
  createdAt: string;
  url: string;
  userId: string;
}) {
  return {
    header: {
      template: "blue",
      title: {
        content: `${action} ${event}`,
        tag: "plain_text",
      },
    },
    elements: [
      {
        fields: [
          {
            is_short: true,
            text: {
              content: `**👤 提交人：**\n ${userId}`,
              tag: "lark_md",
            },
          },
          {
            is_short: true,
            text: {
              content: `**📄 Event：**\n${event}`,
              tag: "lark_md",
            },
          },
        ],
        tag: "div",
      },
      {
        fields: [
          {
            is_short: true,
            text: {
              content: `**🗂️ Type ：**\n${type}`,
              tag: "lark_md",
            },
          },
          {
            is_short: true,
            text: {
              content: `**📚 body：**\n${body}`,
              tag: "lark_md",
            },
          },
          {
            is_short: false,
            text: {
              content: "",
              tag: "lark_md",
            },
          },
          {
            is_short: false,
            text: {
              content: `**📅 CreateTime：**\n ${createdAt}`,
              tag: "lark_md",
            },
          },
        ],
        tag: "div",
      },
      {
        actions: [
          {
            tag: "button",
            text: {
              content: "Open URL",
              tag: "plain_text",
            },
            type: "primary",
            url: url,
          },
        ],
        tag: "action",
      },
    ],
  };
}
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const linearEvent = request.headers.get("linear-event") || "";
    const requestData: any = await request.json();
    console.log(requestData);
    const { action, type, createdAt, data, url, updatedFrom } = requestData;
    const mesasge_body = generateLarkCard({
      event: linearEvent,
      action,
      type,
      body: data.body,
      createdAt,
      url,
      userId: data.userId,
    });
    const response = await sendLarkMessage(env.LARK_BOT_URL as string, {
      msg_type: "interactive",
      card: mesasge_body,
    });
    return response;
  },
};
