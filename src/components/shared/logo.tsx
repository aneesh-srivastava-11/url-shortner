import { Link } from 'lucide-react'

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Link className="h-4 w-4 text-primary-foreground" />
      </div>
    </div>
  )
}
