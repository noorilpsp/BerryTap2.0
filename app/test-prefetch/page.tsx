import { Link } from '@/components/ui/link'

export default function TestPrefetchPage() {
  return (
    <div className="w-full p-4">
      <h1 className="text-xl font-semibold">Prefetch Test Page</h1>
      <div className="flex flex-row flex-wrap justify-center gap-2 border-b-2 py-4 sm:justify-start">
        <Link
          prefetch={true}
          className="flex w-[125px] flex-col items-center text-center"
          href="/test-prefetch/target"
        >
          <span className="text-xs">Go to Target Page</span>
        </Link>
      </div>
    </div>
  )
}