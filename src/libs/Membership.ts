import { API_URL } from './Constants'
import type {
    MembershipCheckoutResult,
    MembershipPlan,
    MembershipStatusResult,
    MembershipTier,
} from '../types/membership'

export const TIER_KEYWORDS_LIMIT: Record<MembershipTier, number | null> = {
    free: 5,
    pro: 20,
    unlimited: null,
}

const EMPTY_FREE_STATUS: MembershipStatusResult = {
    tier: 'free',
    productId: null,
    expiresDate: null,
    isActive: false,
    willRenew: false,
    keywordsLimit: TIER_KEYWORDS_LIMIT.free,
    keywordsUsed: 0,
}

export function formatTier(tier: MembershipTier): string {
    switch (tier) {
        case 'unlimited': return 'Unlimited'
        case 'pro': return 'Pro'
        default: return 'Free'
    }
}

export function formatKeywordUsage(status: MembershipStatusResult): string {
    if (status.keywordsLimit === null) {
        return `${status.keywordsUsed} keywords (unlimited)`
    }
    return `${status.keywordsUsed} of ${status.keywordsLimit} keywords used`
}

export async function getUserMembershipStatus(userId: string): Promise<MembershipStatusResult> {
    try {
        const resp = await fetch(`${API_URL}/membership/status?userId=${encodeURIComponent(userId)}`)
        const respJson = await resp.json()

        if (respJson.code === 0 && respJson.data) {
            const tier = (respJson.data.tier || 'free') as MembershipTier
            return {
                tier,
                productId: respJson.data.productId || null,
                expiresDate: respJson.data.expiresDate || null,
                isActive: respJson.data.isActive || false,
                willRenew: respJson.data.willRenew || false,
                keywordsLimit: TIER_KEYWORDS_LIMIT[tier] ?? null,
                keywordsUsed: respJson.data.keywordsUsed || 0,
            }
        }

        return {
            ...EMPTY_FREE_STATUS,
            keywordsUsed: respJson.data?.keywordsUsed || 0,
        }
    } catch {
        return { ...EMPTY_FREE_STATUS }
    }
}

export async function createMembershipCheckout(
    plan: MembershipPlan,
    token: string
): Promise<{ code: number; message: string; data?: MembershipCheckoutResult }> {
    try {
        if (!token) {
            return { code: 1, message: 'Unauthorized' }
        }
        const resp = await fetch(`${API_URL}/membership/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ plan }),
        })
        const respJson = await resp.json()
        return {
            code: respJson.code ?? 1,
            message: respJson.msg ?? respJson.message ?? '',
            data: respJson.data,
        }
    } catch (err) {
        console.log(err)
        return { code: 1, message: 'Network error' }
    }
}

export async function getMembershipPortalUrl(
    token: string
): Promise<{ code: number; message: string; url?: string }> {
    try {
        if (!token) {
            return { code: 1, message: 'Unauthorized' }
        }
        const resp = await fetch(`${API_URL}/membership/portal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        const respJson = await resp.json()
        return {
            code: respJson.code ?? 1,
            message: respJson.msg ?? respJson.message ?? '',
            url: respJson.data?.url,
        }
    } catch (err) {
        console.log(err)
        return { code: 1, message: 'Network error' }
    }
}
