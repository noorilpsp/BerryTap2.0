import Image from 'next/image'
import { Link } from '@/components/ui/link'

export default function TestPrefetchTargetPage() {
  return (
    <div className="container p-4">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/test-prefetch" className="text-blue-600 hover:underline">
          ← Back to Test Page
        </Link>
      </div>
      
      <h1 className="border-t-2 pt-1 text-xl font-bold">Target Page with Image</h1>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <Image
            loading="eager"
            decoding="sync"
            src="https://mlc4o7ewdhzlruqo.public.blob.vercel-storage.com/blob-HttYVUR4ap5kMNBZDa8EkCx9Zdo2Em"
            alt="Test Image"
            height={600}
            quality={80}
            width={800}
            className="h-56 w-56 flex-shrink-0 border-2 md:h-64 md:w-64"
          />
          <p className="flex-grow text-base">This page contains an image that should be prefetched when hovering over the link.</p>
        </div>
      </div>
    </div>
  )
}