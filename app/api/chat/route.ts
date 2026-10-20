import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, apiConfig, accessCode } = body;

    // 0. Enforce ACCESS_CODE if configured on the server
    const serverAccessCode = process.env.ACCESS_CODE?.trim();
    if (serverAccessCode) {
      const clientCode =
        accessCode?.trim() || req.headers.get("x-access-code")?.trim();
      if (clientCode !== serverAccessCode) {
        return new Response(
          JSON.stringify({ error: "访问密码错误或未授权，拒绝调用" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Determine API Key
    const apiKey =
      apiConfig?.apiKey?.trim() ||
      process.env.DEEPSEEK_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "未检测到 API Key。请在右上角【⚙️ 设置】中填写您的 API Key，或在 Vercel 环境变量中配置 DEEPSEEK_API_KEY。",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Determine Base URL
    let baseUrl =
      apiConfig?.baseUrl?.trim() ||
      process.env.DEEPSEEK_BASE_URL?.trim() ||
      process.env.OPENAI_BASE_URL?.trim() ||
      "https://api.deepseek.com";

    // Clean up trailing slash
    baseUrl = baseUrl.replace(/\/+$/, "");

    // Normalize endpoint url
    let endpoint = `${baseUrl}/chat/completions`;
    if (baseUrl.endsWith("/chat/completions")) {
      endpoint = baseUrl;
    }

    // 3. Determine Model
    const model =
      apiConfig?.model?.trim() ||
      process.env.DEEPSEEK_MODEL?.trim() ||
      "deepseek-flash";

    const payload = {
      model,
      messages,
      stream: true,
      temperature: 0.7,
    };

    const upstreamResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      let errorMessage = `上游平台返回错误 (${upstreamResponse.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson?.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        if (errorText) errorMessage += `: ${errorText.slice(0, 200)}`;
      }

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: upstreamResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return the SSE stream directly to client
    return new Response(upstreamResponse.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "服务器内部请求异常" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
