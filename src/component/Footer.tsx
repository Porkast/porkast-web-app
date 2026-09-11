import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="footer items-center justify-between p-4 bg-neutral text-neutral-content flex flex-col sm:flex-row gap-4">
            <div className="items-center grid-flow-col">
                <p>Copyright © 2023 - 2026 Porkast. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-medium">
                <Link to="/guide/apple-podcast" className="link link-hover">Apple Podcasts Guide</Link>
                <Link to="/content-policy" className="link link-hover">Content Policy</Link>
                <Link to="/privacy" className="link link-hover">Privacy</Link>
                <Link to="/terms" className="link link-hover">Terms</Link>
            </div>
        </footer>
    )
}
