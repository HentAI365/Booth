"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { FilterBar } from "@/components/filter-bar"
import { RefreshCw, AlertTriangle, Info, Clock } from "lucide-react"
import type { BoothItem } from "@/lib/types"
import { getAllTags, getAllShops } from "@/lib/utils"

interface BoothGalleryProps {
  initialItems: BoothItem[]
}

export function BoothGallery({ initialItems }: BoothGalleryProps) {
  const [items, setItems] = useState<BoothItem[]>(initialItems)
  const [filteredItems, setFilteredItems] = useState<BoothItem[]>(initialItems)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedShops, setSelectedShops] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(
    "注意: BOOTHのセキュリティ対策により、一部またはすべてのデータがモックデータである可能性があります。",
  )
  const [isMockData, setIsMockData] = useState<boolean>(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [autoUpdate, setAutoUpdate] = useState<boolean>(false)
  const [updateInterval, setUpdateInterval] = useState<number>(5) // 分単位
  const autoUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const allTags = getAllTags(items)
  const allShops = getAllShops(items)

  // 自動更新の設定
  useEffect(() => {
    // 前回のインターバルをクリア
    if (autoUpdateIntervalRef.current) {
      clearInterval(autoUpdateIntervalRef.current)
      autoUpdateIntervalRef.current = null
    }

    // 自動更新が有効な場合、新しいインターバルを設定
    if (autoUpdate) {
      autoUpdateIntervalRef.current = setInterval(
        () => {
          console.log("Auto updating data...")
          refreshData(false) // 自動更新の場合は静かに更新
        },
        updateInterval * 60 * 1000,
      ) // 分をミリ秒に変換
    }

    // コンポーネントのアンマウント時にインターバルをクリア
    return () => {
      if (autoUpdateIntervalRef.current) {
        clearInterval(autoUpdateIntervalRef.current)
      }
    }
  }, [autoUpdate, updateInterval])

  useEffect(() => {
    let filtered = [...items]

    if (selectedTags.length > 0) {
      filtered = filtered.filter((item) => selectedTags.some((tag) => item.tags.includes(tag)))
    }

    if (selectedShops.length > 0) {
      filtered = filtered.filter((item) => selectedShops.includes(item.shop))
    }

    setFilteredItems(filtered)
  }, [items, selectedTags, selectedShops])

  const clearFilters = () => {
    setSelectedTags([])
    setSelectedShops([])
  }

  const refreshData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true)
    }
    setError(null)

    try {
      const response = await fetch(`/api/booth?forceUpdate=true`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      if (data.items && data.items.length > 0) {
        setItems(data.items)
        setMessage(data.message || null)
        setIsMockData(data.isPartiallyMock || false)
        setLastUpdated(data.lastUpdated || null)

        // 更新されたショップがある場合は通知
        if (data.isUpdated && data.updatedShops && data.updatedShops.length > 0) {
          const updatedMessage = `${data.updatedShops.length}つのショップのデータが更新されました: ${data.updatedShops.join(", ")}`
          setMessage(updatedMessage)
        }
      } else {
        setError("データが取得できませんでした")
      }
    } catch (err) {
      setError(`エラーが発生しました: ${(err as Error).message}`)
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

  // 最終更新日時を表示用にフォーマット
  const formatLastUpdated = (dateString: string | null) => {
    if (!dateString) return "未更新"

    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(date)
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold">作品一覧</h2>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="auto-update" checked={autoUpdate} onCheckedChange={setAutoUpdate} />
            <Label htmlFor="auto-update">自動更新 ({updateInterval}分ごと)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="1"
              max="60"
              value={updateInterval}
              onChange={(e) => setUpdateInterval(Number.parseInt(e.target.value))}
              className="w-24"
              disabled={!autoUpdate}
            />
          </div>

          <Button
            onClick={() => refreshData()}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "更新中..." : "データを更新"}
          </Button>
        </div>
      </div>

      {lastUpdated && (
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Clock className="h-4 w-4 mr-1" />
          <span>最終更新: {formatLastUpdated(lastUpdated)}</span>
        </div>
      )}

      {message && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>情報</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FilterBar
        tags={allTags}
        shops={allShops}
        selectedTags={selectedTags}
        selectedShops={selectedShops}
        onTagsChange={setSelectedTags}
        onShopsChange={setSelectedShops}
        onClearFilters={clearFilters}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {filteredItems.map((item) => (
          <Link href={item.url} key={item.id} target="_blank" rel="noopener noreferrer" className="group">
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Image
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-lg line-clamp-2 mb-2">{item.title}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-pink-600">{item.price}</p>
                  <Badge variant="outline">{item.shop}</Badge>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge key={`${item.id}-${tag}`} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">該当する作品が見つかりませんでした。</p>
          <button onClick={clearFilters} className="mt-4 text-pink-600 hover:underline">
            フィルターをクリア
          </button>
        </div>
      )}
    </div>
  )
}
