// src/app/api/matches/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Client ဆီကနေ date parameter ကို ယူမယ်
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || '1';

  try {
    // 🟢 ဒီနေရာက Server Side ဖြစ်တဲ့အတွက် Secret Key ကို User တွေ လုံးဝ မမြင်ရတော့ပါ
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}api/v1/matches?date=${date}`, {
      headers: {
        'X-App-Key': process.env.APP_SECRET_KEY || '',
      }
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}