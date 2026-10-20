import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// GET /api/auth: Check if ACCESS_CODE is required by the server
export async function GET() {
  const serverAccessCode = process.env.ACCESS_CODE?.trim();
  return NextResponse.json({
    requiresAuth: Boolean(serverAccessCode),
  });
}

// POST /api/auth: Verify the client provided access code
export async function POST(req: NextRequest) {
  try {
    const serverAccessCode = process.env.ACCESS_CODE?.trim();

    // If server has no ACCESS_CODE set, auth is always valid
    if (!serverAccessCode) {
      return NextResponse.json({ success: true, requiresAuth: false });
    }

    const body = await req.json().catch(() => ({}));
    const clientCode = body?.accessCode?.trim();

    if (!clientCode) {
      return NextResponse.json(
        { success: false, error: "请输入访问密码" },
        { status: 400 }
      );
    }

    if (clientCode === serverAccessCode) {
      return NextResponse.json({ success: true, requiresAuth: true });
    }

    return NextResponse.json(
      { success: false, error: "访问密码错误，请重新输入" },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "鉴权异常" },
      { status: 500 }
    );
  }
}
