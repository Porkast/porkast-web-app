export type MembershipTier = 'free' | 'pro' | 'unlimited'

export type MembershipPlan = 'pro' | 'unlimited'

export interface MembershipStatusResult {
    tier: MembershipTier
    productId: string | null
    expiresDate: string | null
    isActive: boolean
    willRenew: boolean
    keywordsLimit: number | null
    keywordsUsed: number
}

export interface MembershipCheckoutResult {
    checkoutUrl: string | null
    alreadySubscribed: boolean
    currentPlan: MembershipPlan | null
}
