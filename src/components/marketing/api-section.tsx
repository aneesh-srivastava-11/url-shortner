'use client'

import { motion } from 'framer-motion'
import { Code } from 'lucide-react'

export function ApiSection() {
  const codeExample = `// Create a short link
const response = await fetch('/api/links', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com/very/long/url',
    customAlias: 'my-link',
  }),
})

const { data } = await response.json()
console.log(data.shortCode) // "my-link"`

  return (
    <section id="api" className="container space-y-6 py-8 md:py-12 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center"
      >
        <Code className="h-12 w-12 text-primary" />
        <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Developer API</h2>
        <p className="max-w-[85%] text-muted-foreground sm:text-lg">
          Integrate link shortening into your apps with our simple REST API.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-[58rem] overflow-hidden rounded-lg border bg-muted p-4"
      >
        <pre className="overflow-x-auto text-sm">
          <code className="language-javascript">{codeExample}</code>
        </pre>
      </motion.div>
    </section>
  )
}
