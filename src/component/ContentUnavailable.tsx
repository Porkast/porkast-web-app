import { Link } from 'react-router-dom'
import { CONTENT_REPORT_EMAIL } from '../libs/contentFilter'

export default function ContentUnavailable() {
    return (
        <div className="w-full flex justify-center min-h-screen">
            <div className="w-full max-w-xl px-6 pt-16 text-center">
                <h1 className="text-2xl font-bold">Content unavailable</h1>
                <p className="mt-4 text-gray-500">
                    This podcast or episode is not available because it may contain adult or prohibited content that violates our Content Policy.
                </p>
                <div className="flex justify-center gap-3 mt-6">
                    <Link to="/content-policy" className="btn btn-primary">Content Policy</Link>
                    <a
                        href={`mailto:${CONTENT_REPORT_EMAIL}?subject=${encodeURIComponent('Content report')}`}
                        className="btn btn-outline"
                    >
                        Report content
                    </a>
                </div>
            </div>
        </div>
    )
}
