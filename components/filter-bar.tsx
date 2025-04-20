"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface FilterBarProps {
  tags: string[]
  shops: string[]
  selectedTags: string[]
  selectedShops: string[]
  onTagsChange: (tags: string[]) => void
  onShopsChange: (shops: string[]) => void
  onClearFilters: () => void
}

export function FilterBar({
  tags,
  shops,
  selectedTags,
  selectedShops,
  onTagsChange,
  onShopsChange,
  onClearFilters,
}: FilterBarProps) {
  const [tagsOpen, setTagsOpen] = useState(false)
  const [shopsOpen, setShopsOpen] = useState(false)

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const toggleShop = (shop: string) => {
    if (selectedShops.includes(shop)) {
      onShopsChange(selectedShops.filter((s) => s !== shop))
    } else {
      onShopsChange([...selectedShops, shop])
    }
  }

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0 p-4 bg-white border-b">
      <div className="flex items-center space-x-2">
        <DropdownMenu open={tagsOpen} onOpenChange={setTagsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center justify-between w-40">
              タグ
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>タグでフィルター</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => toggleTag(tag)}
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu open={shopsOpen} onOpenChange={setShopsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center justify-between w-40">
              ショップ
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>ショップでフィルター</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {shops.map((shop) => (
              <DropdownMenuCheckboxItem
                key={shop}
                checked={selectedShops.includes(shop)}
                onCheckedChange={() => toggleShop(shop)}
              >
                {shop}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {(selectedTags.length > 0 || selectedShops.length > 0) && (
          <Button variant="ghost" onClick={onClearFilters} className="h-9 px-2 lg:px-3">
            クリア
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-3 py-1">
            {tag}
            <button
              className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => toggleTag(tag)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag} filter</span>
            </button>
          </Badge>
        ))}
        {selectedShops.map((shop) => (
          <Badge key={shop} variant="outline" className="flex items-center gap-1 px-3 py-1">
            {shop}
            <button
              className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => toggleShop(shop)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {shop} filter</span>
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}

function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
