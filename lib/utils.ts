import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { BoothItem } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const shops: { [key: string]: string } = {
  hentai365: "https://hentai365.booth.pm/",
  hentai366: "https://hentai366.booth.pm/",
  hentai367: "https://hentai367.booth.pm/",
}

// モックデータを拡充
export const mockItems: BoothItem[] = [
  {
    id: "1",
    title: "ファンタジーイラスト集 Vol.1",
    imageUrl: "/placeholder.svg?height=300&width=300",
    url: "https://hentai365.booth.pm/items/1",
    price: "¥500",
    shop: "hentai365",
    tags: ["イラスト集", "ファンタジー"],
  },
  {
    id: "2",
    title: "SF世界のキャラクターデザイン",
    imageUrl: "/placeholder.svg?height=300&width=300",
    url: "https://hentai366.booth.pm/items/2",
    price: "¥800",
    shop: "hentai366",
    tags: ["イラスト集", "SF"],
  },
  {
    id: "3",
    title: "魔法少女イラストコレクション",
    imageUrl: "/placeholder.svg?height=300&width=300",
    url: "https://hentai367.booth.pm/items/3",
    price: "¥1,000",
    shop: "hentai367",
    tags: ["イラスト集", "ファンタジー", "デジタル"],
  },
  {
    id: "4",
    title: "未来都市の風景画集",
    imageUrl: "/placeholder.svg?height=300&width=300",
    url: "https://hentai365.booth.pm/items/4",
    price: "¥1,500",
    shop: "hentai365",
    tags: ["イラスト集", "SF", "デジタル"],
  },
  {
    id: "5",
    title: "ドラゴンと騎士のイラスト集",
    imageUrl: "/placeholder.svg?height=300&width=300",
    url: "https://hentai366.booth.pm/items/5",
    price: "¥2,000",
    shop: "hentai366",
    tags: ["イラスト集", "ファンタジー"],
  },
  {
    id: "6",
    title: "宇宙船デザイン集",
    imageUrl: "/placeholder.svg?height=300&width=300",
    url: "https://hentai367.booth.pm/items/6",
    price: "¥1,200",
    shop: "hentai367",
    tags: ["イラスト集", "SF"],
  },
  {
    id: "7",
    title: "キャラクターポーズ集",
    imageUrl: "/placeholder.svg?height=300&width=300",
    url: "https://hentai365.booth.pm/items/7",
    price: "¥900",
    shop: "hentai365",
    tags: ["イラスト集", "デジタル", "ポーズ集"],
  },
  {
    id: "8",
    title: "エルフと妖精のイラスト集",
    imageUrl: "/placeholder.svg?height=300&width=300",
    url: "https://hentai366.booth.pm/items/8",
    price: "¥700",
    shop: "hentai366",
    tags: ["イラスト集", "ファンタジー", "デジタル"],
  },
  {
    id: "9",
    title: "ロボットデザイン集",
    imageUrl: "/placeholder.svg?height=300&width=300",
    url: "https://hentai367.booth.pm/items/9",
    price: "¥1,300",
    shop: "hentai367",
    tags: ["イラスト集", "SF", "メカ"],
  },
  {
    id: "10",
    title: "水彩風デジタルイラスト集",
    imageUrl: "/placeholder.svg?height=300&width=300",
    url: "https://hentai365.booth.pm/items/10",
    price: "¥1,100",
    shop: "hentai365",
    tags: ["イラスト集", "水彩", "デジタル"],
  },
  {
    id: "11",
    title: "魔法使いのキャラクターデザイン",
    imageUrl: "/placeholder.svg?height=300&width=300",
    url: "https://hentai366.booth.pm/items/11",
    price: "¥850",
    shop: "hentai366",
    tags: ["イラスト集", "ファンタジー", "キャラクターデザイン"],
  },
  {
    id: "12",
    title: "サイバーパンクイラスト集",
    imageUrl: "/placeholder.svg?height=300&width=300",
    url: "https://hentai367.booth.pm/items/12",
    price: "¥1,400",
    shop: "hentai367",
    tags: ["イラスト集", "SF", "サイバーパンク"],
  },
]

// 全てのタグを取得
export function getAllTags(items: BoothItem[]): string[] {
  const tagsSet = new Set<string>()

  items.forEach((item) => {
    item.tags.forEach((tag) => {
      tagsSet.add(tag)
    })
  })

  return Array.from(tagsSet)
}

// 全てのショップを取得
export function getAllShops(items: BoothItem[]): string[] {
  const shopsSet = new Set<string>()

  items.forEach((item) => {
    shopsSet.add(item.shop)
  })

  return Array.from(shopsSet)
}
