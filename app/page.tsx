import { BoothGallery } from "@/components/booth-gallery"
import { mockItems } from "@/lib/utils"

export const dynamic = "force-dynamic" // キャッシュを無効化

export default async function Home() {
  let items = []

  try {
    // APIからデータを取得
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/booth`, {
      cache: "no-store",
      next: { revalidate: 3600 }, // 1時間ごとに再検証
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    items = data.items

    // データが空の場合はモックデータを使用
    if (!items || items.length === 0) {
      console.warn("No items returned from API, using mock data")
      items = mockItems
    }
  } catch (error) {
    console.error("Error fetching data:", error)
    // エラーが発生した場合はモックデータを使用
    items = mockItems
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-pink-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">BOOTH作品ギャラリー</h1>
          <p className="mt-2">複数のBOOTHアカウントの作品を一つのページで閲覧できます</p>
        </div>
      </header>

      <BoothGallery initialItems={items} />

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>このサイトは非公式のファンサイトです。BOOTHとは関係ありません。</p>
          <p className="mt-2">
            データ元:
            <a
              href="https://hentai365.booth.pm/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:underline ml-2"
            >
              hentai365
            </a>
            <a
              href="https://hentai366.booth.pm/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:underline ml-2"
            >
              hentai366
            </a>
            <a
              href="https://hentai367.booth.pm/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:underline ml-2"
            >
              hentai367
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}
