import { NextResponse } from "next/server"
import { getBoothItems } from "@/lib/scraper"
import { shops } from "@/lib/utils"

export const dynamic = "force-dynamic" // キャッシュを無効化

// このAPIエンドポイントは、外部のクロンジョブサービスから定期的に呼び出されることを想定しています
export async function GET(request: Request) {
  try {
    // 認証トークンの確認（本番環境では適切な認証を実装してください）
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    // 簡易的な認証（本番環境ではより強固な認証を実装してください）
    if (!token || token !== "your-secret-token") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // スクレイピング対象のショップURL
    const shopUrls = Object.values(shops)

    // 強制的に更新
    const { items, updatedShops, lastUpdated } = await getBoothItems(shopUrls, true)

    // 更新されたショップがあるかどうか
    const isUpdated = updatedShops.length > 0

    return NextResponse.json({
      success: true,
      isUpdated,
      updatedShops,
      itemCount: items.length,
      lastUpdated: new Date(lastUpdated).toISOString(),
      message: isUpdated
        ? `${updatedShops.length}つのショップのデータが更新されました: ${updatedShops.join(", ")}`
        : "更新されたショップはありません",
    })
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json(
      {
        error: "Failed to run cron job",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
