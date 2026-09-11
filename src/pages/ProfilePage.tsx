import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppProvider } from '../component/AppContext'
import Footer from '../component/Footer'
import Header from '../component/Header'
import { getUserSessionInfo, getUserInfoFromServer, updateNicknameToServer, setUserSessionInfo } from '../libs/User'
import { formatKeywordUsage, formatTier, getUserMembershipStatus } from '../libs/Membership'
import type { MembershipStatusResult } from '../types/membership'
import Loading from '../component/Loading'

const NICKNAME_PATTERN = /^[^\s%\/?#&=+]{1,32}$/u

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState('')
    const [nicknameInput, setNicknameInput] = useState('')
    const [savedNickname, setSavedNickname] = useState('')
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })
    const [membership, setMembership] = useState<MembershipStatusResult | null>(null)

    useEffect(() => {
        const load = async () => {
            const session = await getUserSessionInfo()
            setEmail(session.email)
            if (session.userId) {
                const resp = await getUserInfoFromServer(session.userId)
                if (resp.code === 0 && resp.data) {
                    const nick = resp.data.nickname || ''
                    setSavedNickname(nick)
                    setNicknameInput(nick)
                }
                const membershipStatus = await getUserMembershipStatus(session.userId)
                setMembership(membershipStatus)
            }
            setLoading(false)
        }
        load()
    }, [])

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ text: '', type: '' })

        const trimmed = nicknameInput.trim().toLowerCase()
        if (trimmed !== '' && !NICKNAME_PATTERN.test(trimmed)) {
            setMessage({ text: 'Nickname may not contain spaces or URL-reserved characters, and is limited to 32 characters', type: 'error' })
            setSaving(false)
            return
        }

        const resp = await updateNicknameToServer(trimmed)
        if (resp.code === 0) {
            const session = await getUserSessionInfo()
            setUserSessionInfo({ ...session, username: trimmed })
            setSavedNickname(trimmed)
            setNicknameInput(trimmed)
            setMessage({ text: 'Nickname updated!', type: 'success' })
        } else {
            setMessage({ text: resp.message || 'Failed to update nickname', type: 'error' })
        }
        setSaving(false)
    }

    if (loading) return <Loading />

    const shareRef = savedNickname || '[your userId]'

    return (
        <>
            <AppProvider>
                <Header title="Profile">
                    <div className="w-full flex justify-center min-h-screen">
                        <div className="w-full max-w-md pt-12 pl-6 pr-6">
                            <div className="bg-base-200 p-8 rounded-xl shadow-lg">
                                <h2 className="text-2xl font-bold mb-6 text-center text-base-content">Profile</h2>

                                <div className="mb-6 text-sm text-gray-500">
                                    <div>Email: <span className="font-medium text-base-content">{email}</span></div>
                                    <div className="mt-1">Share RSS: <span className="font-medium text-base-content">porkast.com/share/listenlater/{shareRef}</span></div>
                                    <div className="mt-2">Your nickname is the public identifier used in your share links, e.g. <span className="font-medium text-base-content">porkast.com/share/listenlater/{savedNickname || '...'}</span>. Chinese/unicode letters are allowed; spaces and URL-reserved characters are not. It must be unique.</div>
                                </div>

                                {message.text && (
                                    <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                        {message.text}
                                    </div>
                                )}

                                <form onSubmit={onSave} className="space-y-4">
                                    <div>
                                        <label className="label">
                                            <span className="label-text">Nickname</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={nicknameInput}
                                            onChange={(e) => setNicknameInput(e.target.value)}
                                            placeholder="e.g. john_tan"
                                            className="input input-bordered w-full bg-base-100"
                                            maxLength={32}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-full"
                                        disabled={saving}
                                    >
                                        {saving ? <span className="loading loading-spinner"></span> : 'Save'}
                                    </button>
                                </form>

                                <div className="text-xs text-gray-500 text-center mt-4">Leave empty and save to clear your nickname (share links fall back to a long user ID)</div>
                            </div>

                            {membership && (
                                <div className="bg-base-200 p-8 rounded-xl shadow-lg mt-6">
                                    <h2 className="text-xl font-bold mb-4 text-center text-base-content">Membership</h2>
                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                        <div>
                                            <div className="badge badge-primary badge-lg">{formatTier(membership.tier)}</div>
                                            <div className="text-sm text-gray-500 mt-2">{formatKeywordUsage(membership)}</div>
                                            {membership.isActive && membership.expiresDate && (
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {membership.willRenew ? 'Renews' : 'Expires'}: {new Date(membership.expiresDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <Link
                                            to="/pricing"
                                            className="btn btn-primary btn-sm"
                                        >
                                            {membership.isActive && membership.tier !== 'free' ? 'Manage' : 'Upgrade'}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Header>
                <Footer />
            </AppProvider>
        </>
    )
}
