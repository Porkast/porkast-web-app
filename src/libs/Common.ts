import { v5 as uuidv5 } from 'uuid';
import { v4 as uuidv4 } from 'uuid';

export const replaceWithBr = (text: string): string => {
    return text.replace(/\n/g, "<br/>")
}

export const addLinkTagToUrl = (text: string): string => {
    return text.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a className="link" href="$1" target="_blank">$1</a>'
    )
}

export const removeTextColorStyles = (html: string): string => {
    const updatedHtml = html.replace(/color:[^;]*;/g, '');
    return updatedHtml;
}

export const convertMillsTimeToDuration = (mills: number): string => {
    if (mills >= 1000 && mills < 10000) {
        mills *= 1000;
    }

    const hours = Math.floor(mills / 3600000);
    const minutes = Math.floor((mills % 3600000) / 60000);
    const seconds = Math.floor(((mills % 3600000) % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export const formatDateTime = (dateTime: string): string => {
    const date = new Date(dateTime)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
}

export const parseHtmlStrinText = (htmlString: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const textContent = doc.body.textContent;
    return textContent ?? '';
}

export const generateFeedItemId = async (feedUrl: string, title: string): Promise<string> => {
    const uniqueId = uuidv5(feedUrl + title, uuidv5.DNS);
    return uniqueId
}

export const generateID = async (): Promise<string> => {
    const uniqueId = uuidv4();
    return uniqueId
}

export const generatePlaylistId = async (name: string, userId: string): Promise<string> => {
    const uniqueId = uuidv5(name + userId, uuidv5.DNS);
    return uniqueId
}

export const generatePlaylistItemId = async (playlistId: string, itemId: string): Promise<string> => {
    const uniqueId = uuidv5(playlistId + itemId, uuidv5.DNS);
    return uniqueId
}

const SCROLL_TO_TOP_DURATION_MS = 800

export const smoothScrollToTop = (duration: number = SCROLL_TO_TOP_DURATION_MS) => {
    const start = window.scrollY
    if (start === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.scrollTo(0, 0)
        return
    }
    const startTime = performance.now()
    const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
    const step = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1)
        window.scrollTo(0, start * (1 - easeInOutQuad(progress)))
        if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
}
