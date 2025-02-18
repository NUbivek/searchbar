import NextLink from 'next/link';
import { UrlObject } from 'url';

export function Link({ href, ...props }: React.ComponentProps<typeof NextLink>) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const finalHref = typeof href === 'string' && href.startsWith('/') ? `${basePath}${href}` : href;

  return <NextLink href={finalHref as string | UrlObject} {...props} />;
}