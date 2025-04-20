import * as cheerio from "cheerio"

import type { BoothItem } from "./types"
import { mockItems } from "./utils"

// 最終更新日時を保存するための変数
const lastUpdateTimes: { [shopUrl: string]: number } = {}

// キャッシュ用の変数
let cachedItems: BoothItem[] | null = null
const cachedItemsByShop: { [shopName: string]: BoothItem[] } = {}
let lastFetchTime = 0
const CACHE_DURATION = 1000 * 60 * 15 // 15分

// BOOTHのショップURLからアイテムをスクレイピングする関数
export async function scrapeBoothShop(shopUrl: string): Promise<{ items: BoothItem[]; updated: boolean }> {
  try {
    // ショップ名を取得
    const shopName = shopUrl.split("//")[1].split(".")[0]

    // ページを取得
    const response = await fetch(shopUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
        Referer: "https://booth.pm/",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
      },
      next: { revalidate: 0 }, // キャッシュを無効化
    })

    if (!response.ok) {
      console.error(`Failed to fetch ${shopUrl}: ${response.status} ${response.statusText}`)
      // このショップのモックデータをフィルタリングして返す
      return {
        items: mockItems.filter((item) => item.shop === shopName),
        updated: false,
      }
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Cloudflareのセキュリティチェックが表示されているか確認
    if (html.includes("Cloudflare") && html.includes("security challenge")) {
      console.error(`Cloudflare security challenge detected for ${shopUrl}`)
      // このショップのモックデータをフィルタリングして返す
      return {
        items: mockItems.filter((item) => item.shop === shopName),
        updated: false,
      }
    }

    // 最終更新日時を取得（メタデータやページ内の日付から）
    let lastModified = null

    // 最終更新日時を取得する方法1: Last-Modified ヘッダー
    const lastModifiedHeader = response.headers.get("last-modified")
    if (lastModifiedHeader) {
      lastModified = new Date(lastModifiedHeader).getTime()
    }

    // 最終更新日時を取得する方法2: ページ内のタイムスタンプ
    if (!lastModified) {
      const timeElement = $(".shop-introduction time").attr("datetime")
      if (timeElement) {
        lastModified = new Date(timeElement).getTime()
      }
    }

    // 最終更新日時を取得する方法3: 現在時刻を使用
    if (!lastModified) {
      lastModified = Date.now()
    }

    // 前回の更新日時と比較
    const previousUpdateTime = lastUpdateTimes[shopUrl] || 0
    const isUpdated = lastModified > previousUpdateTime

    // 更新がない場合は前回のデータを使用
    if (!isUpdated && cachedItemsByShop[shopName] && cachedItemsByShop[shopName].length > 0) {
      return {
        items: cachedItemsByShop[shopName],
        updated: false,
      }
    }

    // 更新日時を保存
    lastUpdateTimes[shopUrl] = lastModified

    const items: BoothItem[] = []

    // 商品リストの各アイテムを処理
    $(".item-card").each((_, element) => {
      // 商品ID
      const itemUrl = $(element).find("a.item-card__title-anchor").attr("href") || ""
      const id = itemUrl.split("/").pop() || Math.random().toString(36).substring(7)

      // 商品タイトル
      const title = $(element).find(".item-card__title").text().trim()

      // 商品画像URL
      let imageUrl = $(element).find(".item-card__thumbnail-image").attr("src") || ""
      // 画像URLがdata-srcにある場合（遅延読み込み）
      if (!imageUrl) {
        imageUrl = $(element).find(".item-card__thumbnail-image").attr("data-src") || ""
      }

      // 商品価格
      const price = $(element).find(".price").text().trim()

      // タグ（カテゴリ）
      const tags: string[] = []
      $(element)
        .find(".item-card__category")
        .each((_, tagElement) => {
          const tag = $(tagElement).text().trim()
          if (tag) tags.push(tag)
        })

      // デフォルトタグがない場合は「イラスト」を追加
      if (tags.length === 0) {
        tags.push("イラスト")
      }

      // アイテムを追加
      items.push({
        id,
        title,
        imageUrl,
        url: itemUrl,
        price,
        shop: shopName,
        tags,
      })
    })

    // 商品が見つからなかった場合はモックデータを返す
    if (items.length === 0) {
      console.warn(`No items found for ${shopUrl}, using mock data`)
      return {
        items: mockItems.filter((item) => item.shop === shopName),
        updated: false,
      }
    }

    // ショップごとのキャッシュを更新
    cachedItemsByShop[shopName] = items

    return { items, updated: true }
  } catch (error) {
    console.error(`Error scraping ${shopUrl}:`, error)
    // エラーが発生した場合はこのショップのモックデータを返す
    return {
      items: mockItems.filter((item) => item.shop === shopName),
      updated: false,
    }
  }
}

// 複数のショップからアイテムをスクレイピングする関数
export async function scrapeAllShops(shopUrls: string[]): Promise<{ items: BoothItem[]; updatedShops: string[] }> {
  try {
    const promises = shopUrls.map((url) => scrapeBoothShop(url))
    const results = await Promise.all(promises)

    const allItems: BoothItem[] = []
    const updatedShops: string[] = []

    results.forEach((result, index) => {
      allItems.push(...result.items)

      if (result.updated) {
        const shopName = shopUrls[index].split("//")[1].split(".")[0]
        updatedShops.push(shopName)
      }
    })

    // すべてのショップでスクレイピングが失敗した場合
    if (allItems.length === 0) {
      console.warn("All scraping attempts failed, using all mock data")
      return { items: mockItems, updatedShops: [] }
    }

    return { items: allItems, updatedShops }
  } catch (error) {
    console.error("Error scraping all shops:", error)
    return { items: mockItems, updatedShops: [] }
  }
}

// キャッシュを考慮してアイテムを取得する関数
export async function getBoothItems(
  shopUrls: string[],
  forceUpdate = false,
): Promise<{
  items: BoothItem[]
  updatedShops: string[]
  lastUpdated: number
}> {
  const now = Date.now()

  // 強制更新でない場合、かつキャッシュが有効な場合はキャッシュを返す
  if (!forceUpdate && cachedItems && now - lastFetchTime < CACHE_DURATION) {
    return {
      items: cachedItems,
      updatedShops: [],
      lastUpdated: lastFetchTime,
    }
  }

  // キャッシュがない場合またはキャッシュが古い場合は新しいデータを取得
  const { items, updatedShops } = await scrapeAllShops(shopUrls)

  // キャッシュを更新
  cachedItems = items
  lastFetchTime = now

  return {
    items,
    updatedShops,
    lastUpdated: now,
  }
}

// 最終更新日時を取得する関数
export function getLastUpdateTime(): number {
  return lastFetchTime
}

// 特定のショップの最終更新日時を取得する関数
export function getShopLastUpdateTime(shopUrl: string): number {
  return lastUpdateTimes[shopUrl] || 0
}
