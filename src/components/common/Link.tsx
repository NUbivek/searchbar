import NextLink from 'next/link'

export function Link({ href, ...props }: React.ComponentProps<typeof NextLink>) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const finalHref = href.startsWith('/') ? `${basePath}${href}` : href
  
  return <NextLink href={finalHref} {...props} />
}
