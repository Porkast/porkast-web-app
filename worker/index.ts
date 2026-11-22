interface AssetsBinding {
  fetch(input: Request | URL | string, init?: RequestInit): Promise<Response>
}

interface WorkerEnv {
  ASSETS: AssetsBinding
  API_BASE_URL?: string
}

interface WorkerExecutionContext {
  waitUntil(promise: Promise<unknown>): void
  passThroughOnException(): void
}

interface HTMLRewriterElement {
  setAttribute(name: string, value: string): HTMLRewriterElement
  setInnerContent(content: string, options?: { html?: boolean }): HTMLRewriterElement
  append(content: string, options?: { html?: boolean }): HTMLRewriterElement
}

interface HTMLRewriterElementHandler {
  element(element: HTMLRewriterElement): void | Promise<void>
}

declare class HTMLRewriter {
  on(selector: string, handlers: HTMLRewriterElementHandler): HTMLRewriter
  transform(response: Response): Response
}

interface EdgeCacheStorage extends CacheStorage {
  default: Cache
}

export interface OgMetadata {
  title: string
  description: string
  image: string
  siteName: string
  type: 'website' | 'article'
}

type ShareRoute =
  | { type: 'channel'; channelId: string }
  | { type: 'episode'; channelId: string; episodeId: string; search: string }
  | { type: 'subscription'; userRef: string; keyword: string }
  | { type: 'listenlater'; userRef: string }
  | { type: 'playlist'; userRef: string; playlistId: string }

const DEFAULT_API_BASE_URL = 'https://api.porkast.com/api'
const STATIC_ASSET_EXT_RE = /\.(?:js|mjs|css|png|jpe?g|gif|webp|svg|ico|json|map|woff2?|ttf|txt|xml|webmanifest)$/i

export function parseShareRoute(url: URL): ShareRoute | null {
  if (STATIC_ASSET_EXT_RE.test(url.pathname)) {
    return null
  }

  const segments = url.pathname.split('/').filter(Boolean)
  const root = segments[0]?.toLowerCase()

  switch (root) {
    case 'podcast':
      if (segments.length === 2 && segments[1]) {
        return { type: 'channel', channelId: segments[1] }
      }
      if (segments.length >= 4 && segments[2]?.toLowerCase() === 'episode' && segments[1]) {
        const episodeId = segments.slice(3).join('/')
        if (!episodeId) return null
        return {
          type: 'episode',
          channelId: segments[1],
          episodeId,
          search: url.search,
        }
      }
      return null

    case 'subscription':
      if (segments.length === 3 && segments[1] && segments[2]) {
        return {
          type: 'subscription',
          userRef: segments[1],
          keyword: segments[2],
        }
      }
      return null

    case 'listenlater':
      if (segments.length === 2 && segments[1]) {
        return {
          type: 'listenlater',
          userRef: segments[1],
        }
      }
      return null

    case 'playlist':
      if (segments.length === 3 && segments[1] && segments[2]) {
        return {
          type: 'playlist',
          userRef: segments[1],
          playlistId: segments[2],
        }
      }
      return null

    default:
      return null
  }
}

function buildMetaQueryParams(route: ShareRoute): URLSearchParams {
  const params = new URLSearchParams({ type: route.type })
  switch (route.type) {
    case 'channel':
      params.set('channelId', route.channelId)
      break
    case 'episode':
      params.set('channelId', route.channelId)
      params.set('episodeId', route.episodeId)
      if (route.search) params.set('search', route.search)
      break
    case 'subscription':
      params.set('userRef', route.userRef)
      params.set('keyword', route.keyword)
      break
    case 'listenlater':
      params.set('userRef', route.userRef)
      break
    case 'playlist':
      params.set('userRef', route.userRef)
      params.set('playlistId', route.playlistId)
      break
  }
  return params
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function fetchOgMetadata(
  apiBaseUrl: string,
  route: ShareRoute,
  ctx: WorkerExecutionContext
): Promise<OgMetadata | null> {
  const params = buildMetaQueryParams(route)
  const cache = (caches as unknown as EdgeCacheStorage).default
  const cacheKey = new Request(`https://porkast.com/__og_meta_cache?${params.toString()}`, {
    method: 'GET',
  })

  try {
    const cached = await cache.match(cacheKey)
    if (cached) {
      return (await cached.json()) as OgMetadata
    }
  } catch {
    // continue without cache
  }

  const normalizedBase = apiBaseUrl.replace(/\/+$/, '')
  const metaUrl = `${normalizedBase}/meta/og?${params.toString()}`

  try {
    const resp = await fetch(metaUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(2500),
    })
    if (!resp.ok) {
      return null
    }
    const payload = (await resp.json()) as { code?: number; data?: OgMetadata }
    if (payload?.code !== 0 || !payload.data?.title) {
      return null
    }

    const cacheResponse = new Response(JSON.stringify(payload.data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800',
      },
    })
    ctx.waitUntil(cache.put(cacheKey, cacheResponse))
    return payload.data
  } catch {
    return null
  }
}

export default {
  async fetch(
    request: Request,
    env: WorkerEnv,
    ctx: WorkerExecutionContext
  ): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return env.ASSETS.fetch(request)
    }

    const url = new URL(request.url)
    const route = parseShareRoute(url)
    if (!route) {
      return env.ASSETS.fetch(request)
    }

    const indexRequest = new Request(new URL('/index.html', url.origin).toString(), {
      method: 'GET',
    })
    const baseResponse = await env.ASSETS.fetch(indexRequest)
    if (!baseResponse.ok) {
      return baseResponse
    }

    const apiBaseUrl = env.API_BASE_URL || DEFAULT_API_BASE_URL
    const meta = await fetchOgMetadata(apiBaseUrl, route, ctx)
    if (!meta) {
      return baseResponse
    }

    const canonicalUrl = url.toString()
    const rewriter = new HTMLRewriter()
      .on('title', {
        element(element) {
          element.setInnerContent(meta.title)
        },
      })
      .on('meta[name="description"]', {
        element(element) {
          element.setAttribute('content', meta.description)
        },
      })
      .on('meta[property="og:title"]', {
        element(element) {
          element.setAttribute('content', meta.title)
        },
      })
      .on('meta[property="og:description"]', {
        element(element) {
          element.setAttribute('content', meta.description)
        },
      })
      .on('meta[property="og:image"]', {
        element(element) {
          element.setAttribute('content', meta.image)
        },
      })
      .on('meta[property="og:type"]', {
        element(element) {
          element.setAttribute('content', meta.type)
        },
      })
      .on('meta[name="twitter:title"]', {
        element(element) {
          element.setAttribute('content', meta.title)
        },
      })
      .on('meta[name="twitter:description"]', {
        element(element) {
          element.setAttribute('content', meta.description)
        },
      })
      .on('meta[name="twitter:image"]', {
        element(element) {
          element.setAttribute('content', meta.image)
        },
      })
      .on('meta[name="apple-itunes-app"]', {
        element(element) {
          element.setAttribute('content', `app-id=6768356920, app-argument=${canonicalUrl}`)
        },
      })
      .on('head', {
        element(element) {
          element.append(`<meta property="og:url" content="${escapeHtmlAttr(canonicalUrl)}" />`, {
            html: true,
          })
        },
      })

    const rewritten = rewriter.transform(baseResponse)
    const headers = new Headers(rewritten.headers)
    headers.set('Content-Type', 'text/html; charset=UTF-8')
    headers.set('Cache-Control', 'public, max-age=300')

    return new Response(request.method === 'HEAD' ? null : rewritten.body, {
      status: rewritten.status,
      statusText: rewritten.statusText,
      headers,
    })
  },
}
