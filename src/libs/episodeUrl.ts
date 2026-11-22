function safeDecodeURIComponent(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

/**
 * Double-encodes an episode GUID for URL path segments so `%2F` becomes `%252F`
 * and is not collapsed into `/` by Cloudflare Workers Static Assets normalization.
 */
export function encodeEpisodeId(itemId: string | number | null | undefined): string {
    if (itemId === null || itemId === undefined) return '';
    const str = String(itemId);
    if (!str) return '';
    return encodeURIComponent(encodeURIComponent(str));
}

/**
 * Builds the canonical frontend route path for a podcast episode detail page.
 */
export function buildPodcastEpisodePath(
    channelId: string | number | null | undefined,
    itemId: string | number | null | undefined
): string {
    return `/podcast/${encodeURIComponent(String(channelId ?? ''))}/episode/${encodeEpisodeId(itemId)}`;
}

/**
 * Generates deduplicated candidate GUID strings from a raw route parameter and
 * optional query string, handling single/double encoding and collapsed protocol slashes.
 */
export function getEpisodeIdCandidates(rawParam: string, search: string = ''): string[] {
    if (!rawParam) return [];

    const candidates = new Set<string>();
    const addVariants = (value: string) => {
        if (!value) return;
        candidates.add(value);
        const restoredProtocol = value.replace(/^(https?):\/(?!\/)/i, '$1://');
        candidates.add(restoredProtocol);
        if (search) {
            candidates.add(`${value}${search}`);
            candidates.add(`${restoredProtocol}${search}`);
        }
    };

    let current = rawParam;
    for (let i = 0; i < 3; i++) {
        addVariants(current);
        const decoded = safeDecodeURIComponent(current);
        if (decoded === current) break;
        current = decoded;
    }

    return Array.from(candidates);
}

/**
 * Checks whether an episode GUID matches a raw route parameter (and optional query string).
 */
export function matchesEpisodeId(guid: string, rawParam: string, search: string = ''): boolean {
    if (!guid || !rawParam) return false;
    const encodedGuid = encodeURIComponent(guid);
    return getEpisodeIdCandidates(rawParam, search).some(
        (candidate) => candidate === guid || candidate === encodedGuid
    );
}
