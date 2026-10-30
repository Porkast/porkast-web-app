import { useUnsubscribeKeyword } from "../hooks/useUnsubscribeKeyword";

type UnsubscribeKeywordButtonProps = {
    userId: string;
    keyword: string;
}

export default function UnsubscribeKeywordButton(props: UnsubscribeKeywordButtonProps) {

    const { userId, keyword } = props
    const { isUnsubscribing, unsubscribe } = useUnsubscribeKeyword(userId, keyword)

    return (
        <>
            <button 
                className={`btn btn-neutral ml-2 btn-sm flex items-center rounded-lg ${isUnsubscribing ? 'loading' : ''}`} 
                onClick={unsubscribe}
                disabled={isUnsubscribing}
            >
                {isUnsubscribing ? (
                    <span className="loading loading-spinner"></span>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
                        <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                )}
            </button>
        </>
    )
}
