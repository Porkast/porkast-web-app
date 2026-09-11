import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppProvider, useAppContext } from '../component/AppContext'
import Footer from '../component/Footer'
import Header from '../component/Header'
import { MsgAlertType } from '../component/MsgAlert'
import {
    createMembershipCheckout,
    formatKeywordUsage,
    formatTier,
    getMembershipPortalUrl,
    getUserMembershipStatus,
} from '../libs/Membership'
import { getUserSessionInfo, isUserLoggedIn } from '../libs/User'
import { PAYMENTS_ENABLED } from '../libs/Constants'
import type { MembershipPlan, MembershipStatusResult, MembershipTier } from '../types/membership'

type PlanCard = {
    key: MembershipTier
    name: string
    price: string
    period: string
    tagline: string
    features: string[]
    highlight?: boolean
}

const PLANS: PlanCard[] = [
    {
        key: 'free',
        name: 'Free',
        price: '$0',
        period: 'forever',
        tagline: 'Everything you need to start discovering podcasts.',
        features: [
            '5 search keywords',
            'Listen Later & playlists',
            'No ads',
        ],
    },
    {
        key: 'pro',
        name: 'Podcast Search Pro',
        price: '$2.99',
        period: 'per month',
        tagline: 'More topics with real-time updates.',
        features: [
            'Up to 20 search keywords',
            'Real-time RSS updates',
            'Listen Later & playlists',
        ],
        highlight: true,
    },
    {
        key: 'unlimited',
        name: 'Podcast Search Unlimited',
        price: '$9.99',
        period: 'per month',
        tagline: 'No limits, priority crawling.',
        features: [
            'Unlimited search keywords',
            'Priority crawling',
            'Real-time RSS updates',
        ],
    },
]

async function fetchMembershipStatus(): Promise<MembershipStatusResult | null> {
    const session = await getUserSessionInfo()
    if (!session.userId) {
        return null
    }
    return await getUserMembershipStatus(session.userId)
}

function PricingContent() {
    const navigate = useNavigate()
    const appContext = useAppContext()
    const appContextRef = useRef(appContext)
    const [loggedIn, setLoggedIn] = useState(false)
    const [loadingStatus, setLoadingStatus] = useState(true)
    const [status, setStatus] = useState<MembershipStatusResult | null>(null)
    const [checkoutPlan, setCheckoutPlan] = useState<MembershipPlan | null>(null)
    const [portalLoading, setPortalLoading] = useState(false)
    const mountedRef = useRef(true)

    const loadStatus = async () => {
        return await fetchMembershipStatus()
    }

    useEffect(() => {
        appContextRef.current = appContext
    })

    useEffect(() => {
        mountedRef.current = true

        const pollStatusUntilActive = async () => {
            for (let attempt = 0; attempt < 6; attempt++) {
                await new Promise((resolve) => setTimeout(resolve, 2500))
                const result = await fetchMembershipStatus()
                if (!mountedRef.current || !result) {
                    return
                }
                setStatus(result)
                if (result.isActive && result.tier !== 'free') {
                    appContextRef.current.showMsgAlert(`You are now on the ${formatTier(result.tier)} plan`, MsgAlertType.SUCCESS)
                    return
                }
            }
            if (mountedRef.current) {
                appContextRef.current.showMsgAlert('Payment is still processing. Refresh in a moment to see your plan.', MsgAlertType.INFO)
            }
        }

        const init = async () => {
            const isLogin = await isUserLoggedIn()
            setLoggedIn(isLogin)
            if (isLogin) {
                const result = await fetchMembershipStatus()
                if (mountedRef.current && result) {
                    setStatus(result)
                }
            }
            if (mountedRef.current) {
                setLoadingStatus(false)
            }
        }
        init()

        const params = new URLSearchParams(window.location.search)
        const checkout = params.get('checkout')
        if (checkout === 'success') {
            appContextRef.current.showMsgAlert('Payment successful! Activating your plan...', MsgAlertType.SUCCESS)
            pollStatusUntilActive()
        } else if (checkout === 'cancelled') {
            appContextRef.current.showMsgAlert('Checkout cancelled', MsgAlertType.INFO)
        }
        if (checkout) {
            window.history.replaceState({}, '', window.location.pathname)
        }

        return () => {
            mountedRef.current = false
        }
    }, [])

    const handleUpgrade = async (plan: MembershipPlan) => {
        if (!PAYMENTS_ENABLED) {
            appContext.showMsgAlert('Subscriptions are coming soon', MsgAlertType.INFO)
            return
        }
        const session = await getUserSessionInfo()
        if (!session.userId) {
            navigate('/signin')
            return
        }
        setCheckoutPlan(plan)
        const resp = await createMembershipCheckout(plan, session.token)
        setCheckoutPlan(null)

        if (resp.code !== 0) {
            appContext.showMsgAlert(resp.message || 'Failed to start checkout', MsgAlertType.FAILED)
            return
        }

        if (resp.data?.checkoutUrl) {
            window.location.href = resp.data.checkoutUrl
            return
        }

        if (resp.data?.alreadySubscribed) {
            appContext.showMsgAlert('You already have an active subscription. Use Manage subscription to change it.', MsgAlertType.INFO)
            const result = await loadStatus()
            if (result) {
                setStatus(result)
            }
            return
        }

        appContext.showMsgAlert('Failed to start checkout', MsgAlertType.FAILED)
    }

    const handleManage = async () => {
        const session = await getUserSessionInfo()
        if (!session.userId) {
            navigate('/signin')
            return
        }
        setPortalLoading(true)
        const resp = await getMembershipPortalUrl(session.token)
        setPortalLoading(false)
        if (resp.code === 0 && resp.url) {
            window.location.href = resp.url
            return
        }
        appContext.showMsgAlert(resp.message || 'Failed to open subscription management', MsgAlertType.FAILED)
    }

    const activePaid = !!status && status.isActive && status.tier !== 'free'

    const renderCta = (plan: PlanCard) => {
        if (plan.key === 'free') {
            if (!loggedIn) {
                return (
                    <Link to="/signin" className="btn btn-outline w-full">Sign up free</Link>
                )
            }
            const isCurrent = !activePaid && (status?.tier ?? 'free') === 'free'
            return (
                <button className="btn btn-outline w-full" disabled={isCurrent}>
                    {isCurrent ? 'Current plan' : 'Free'}
                </button>
            )
        }

        if (loadingStatus) {
            return (
                <button className="btn btn-primary w-full" disabled>
                    <span className="loading loading-spinner"></span>
                </button>
            )
        }

        const isCurrent = activePaid && status?.tier === plan.key
        if (isCurrent) {
            return (
                <button className="btn btn-outline w-full" disabled>Current plan</button>
            )
        }

        if (activePaid) {
            return (
                <button
                    className="btn btn-primary w-full"
                    disabled={portalLoading}
                    onClick={handleManage}
                >
                    {portalLoading ? <span className="loading loading-spinner"></span> : 'Change plan'}
                </button>
            )
        }

        if (!PAYMENTS_ENABLED) {
            return (
                <button className="btn btn-outline w-full" disabled>Coming soon</button>
            )
        }

        return (
            <button
                className="btn btn-primary w-full"
                disabled={checkoutPlan !== null}
                onClick={() => handleUpgrade(plan.key as MembershipPlan)}
            >
                {checkoutPlan === plan.key
                    ? <span className="loading loading-spinner"></span>
                    : `Upgrade to ${plan.key === 'pro' ? 'Pro' : 'Unlimited'}`}
            </button>
        )
    }

    return (
        <div className="w-full flex justify-center min-h-screen">
            <div className="w-full max-w-6xl px-6 pt-12 pb-16">
                <div className="text-center max-w-2xl mx-auto">
                    <div className="badge badge-primary badge-outline mb-4">Upgrade</div>
                    <h1 className="text-4xl font-bold">Unlock More Keywords</h1>
                    <p className="mt-4 text-gray-500">
                        Subscribe to more search topics and build a richer podcast discovery radar.
                    </p>
                </div>

                {!PAYMENTS_ENABLED && (
                    <div className="alert alert-info max-w-2xl mx-auto mt-8">
                        <span>Subscriptions are coming soon — we're completing our payment setup. Thanks for your patience!</span>
                    </div>
                )}

                {activePaid && status && (
                    <div className="mt-8 max-w-2xl mx-auto card bg-base-200 shadow-lg">
                        <div className="card-body flex-row items-center justify-between flex-wrap gap-4">
                            <div>
                                <div className="text-sm text-gray-500">Current plan</div>
                                <div className="text-xl font-bold">{formatTier(status.tier)}</div>
                                <div className="text-sm text-gray-500 mt-1">{formatKeywordUsage(status)}</div>
                                {!status.willRenew && (
                                    <div className="text-sm text-warning mt-1">Renewal cancelled — access until expiry</div>
                                )}
                            </div>
                            <button
                                className="btn btn-primary"
                                disabled={portalLoading}
                                onClick={handleManage}
                            >
                                {portalLoading ? <span className="loading loading-spinner"></span> : 'Manage subscription'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-3 mt-10">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.key}
                            className={`card bg-base-100 shadow-xl ${plan.highlight ? 'border-2 border-primary' : ''}`}
                        >
                            <div className="card-body">
                                <div className="flex items-center justify-between">
                                    <h2 className="card-title">{plan.name}</h2>
                                    {plan.highlight && <span className="badge badge-primary">Popular</span>}
                                </div>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold">{plan.price}</span>
                                    <span className="text-gray-500 ml-2">{plan.period}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">{plan.tagline}</p>
                                <ul className="mt-4 space-y-2 flex-1">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="card-actions mt-6">
                                    {renderCta(plan)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {status && status.tier !== 'free' && (
                    <div className="text-center text-sm text-gray-500 mt-8">{formatKeywordUsage(status)}</div>
                )}

                <p className="text-center text-xs text-gray-400 mt-8">
                    Prices in USD. Subscriptions renew monthly until cancelled. Cancel anytime from Manage subscription.
                </p>
            </div>
        </div>
    )
}

export default function PricingPage() {
    return (
        <AppProvider>
            <Header title="Pricing">
                <PricingContent />
            </Header>
            <Footer />
        </AppProvider>
    )
}
