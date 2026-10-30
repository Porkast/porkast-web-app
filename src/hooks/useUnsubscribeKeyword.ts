import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { unsubscribeKeyword } from '../libs/Subscription'

/**
 * Shared unsubscribe flow for a keyword subscription:
 * confirm -> call API -> navigate back to the subscription list.
 * Used by both the standalone button and the card action menu.
 */
export const useUnsubscribeKeyword = (userId: string, keyword: string) => {
    const [isUnsubscribing, setIsUnsubscribing] = useState(false)
    const navigate = useNavigate()

    const unsubscribe = async (): Promise<boolean> => {
        if (isUnsubscribing) {
            return false
        }
        if (!confirm(`Are you sure you want to unsubscribe from "${decodeURIComponent(keyword)}"?`)) {
            return false
        }

        setIsUnsubscribing(true)
        try {
            const result = await unsubscribeKeyword(userId, decodeURIComponent(keyword))
            if (result.code === 0) {
                navigate(`/subscription/${userId}`)
                return true
            }
            alert(result.message || 'Failed to unsubscribe. Please try again.')
        } catch (error) {
            console.error('Error unsubscribing:', error)
            alert('An error occurred while unsubscribing. Please try again.')
        } finally {
            setIsUnsubscribing(false)
        }
        return false
    }

    return { isUnsubscribing, unsubscribe }
}
