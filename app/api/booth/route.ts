import { NextResponse } from "next/server"
import { getBoothItems } from "@/lib/scraper"
import { shops } from "@/lib/utils"

export const dynamic = "force-dynamic" // キャッシュを無効化

export async function GET(request: Request) {
  try {
    // 強制更新するかどうかのクエリパラメータを取得
    const { searchParams } = new URL(request.url)
    const forceUpdate = searchParams.get("forceUpdate") === "true"

    // スクレイピング対象のショップURL
    const shopUrls = Object.values(shops)

    // BOOTHからデータを取得
    const { items, updatedShops, lastUpdated } = await getBoothItems(shopUrls, forceUpdate)

    // 更新されたショップがあるかどうか
    const isUpdated = updatedShops.length > 0

    // データを返す
    return NextResponse.json({
      items,
      lastUpdated: new Date(lastUpdated).toISOString(),
      updatedShops,
      isUpdated,
      message: isUpdated
        ? `${updatedShops.length}つのショップのデータが更新されました: ${updatedShops.join(", ")}`
        : "注意: BOOTHのセキュリティ対策により、一部またはすべてのデータがモックデータである可能性があります。",
      isPartiallyMock: true,
    })
  } catch (error) {
    console.error("Error fetching booth items:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch booth items",
        details: (error as Error).message,
        items: [], // 空の配列を返す
      },
      { status: 500 },
    )
  }
}
