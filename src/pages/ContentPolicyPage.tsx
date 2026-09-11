import { useEffect, useState } from 'react'
import Header from '../component/Header'
import Footer from '../component/Footer'
import { CONTENT_REPORT_EMAIL } from '../libs/contentFilter'

type Lang = 'en' | 'zh'

const content: Record<Lang, {
    title: string
    lastUpdated: string
    sections: { heading: string; paragraphs: string[] }[]
    contactEmail: string
}> = {
    en: {
        title: 'Content Policy',
        lastUpdated: 'Last updated: September 2026',
        contactEmail: CONTENT_REPORT_EMAIL,
        sections: [
            {
                heading: 'Overview',
                paragraphs: [
                    'Porkast is a podcast discovery and personalization service. We do not host, produce, or upload podcasts. We index publicly available podcast directories and RSS feeds so users can search, subscribe, and listen through their preferred podcast player.',
                    'Because third-party directories may contain content that is not suitable for all audiences, we apply automated content filters and a published prohibited content list to every discovery surface on Porkast.',
                ]
            },
            {
                heading: 'Prohibited Content',
                paragraphs: [
                    'Porkast does not allow and actively filters the following categories of content:',
                    'Adult, NSFW, pornographic, or sexually explicit content, including suggestive content and services of any kind.',
                    'Content involving minors in any sexual or exploitative context (zero tolerance).',
                    'Content that promotes or facilitates violence, weapons, terrorism, or self-harm.',
                    'Hate speech, harassment, or discrimination against any individual or group.',
                    'Illegal goods, services, or activities, including drugs, gambling, and fraud.',
                    'Malware, phishing, scams, or content that infringes intellectual property.',
                ]
            },
            {
                heading: 'How We Filter Content',
                paragraphs: [
                    'Explicit-content flags from podcast directories (Apple Podcasts, Spotify, Podcast Index) are checked before any podcast or episode is shown.',
                    'A prohibited keyword and category blocklist is applied to search queries, search results, podcast channels, episode pages, and subscriptions.',
                    'Adult and prohibited categories are excluded from keyword subscription results and from the RSS feeds that Porkast generates.',
                    'Search terms that target prohibited content are blocked with a notice explaining our Content Policy.',
                    'Content that is identified as prohibited is removed from our stored data and hidden from all discovery surfaces.',
                ]
            },
            {
                heading: 'Reporting Content',
                paragraphs: [
                    'If you find content on Porkast that you believe violates this policy, report it to us at:',
                    CONTENT_REPORT_EMAIL,
                    'Please include the podcast title, episode title, and the Porkast link if available. We review every report and remove confirmed violations promptly.',
                ]
            },
            {
                heading: 'Enforcement',
                paragraphs: [
                    'Content that violates this policy is filtered from discovery, removed from our systems, and excluded from generated feeds.',
                    'Accounts that abuse the service to access, share, or promote prohibited content may be suspended or terminated.',
                ]
            },
            {
                heading: 'Contact',
                paragraphs: [
                    'For questions about this Content Policy, contact us at:',
                    CONTENT_REPORT_EMAIL,
                ]
            },
        ]
    },
    zh: {
        title: '内容政策',
        lastUpdated: '最后更新：2026年9月',
        contactEmail: CONTENT_REPORT_EMAIL,
        sections: [
            {
                heading: '概述',
                paragraphs: [
                    'Porkast 是一个播客发现与个性化服务。我们不托管、不制作、不上传播客内容，而是索引公开的播客目录与 RSS 源，供用户搜索、订阅并通过喜欢的播客播放器收听。',
                    '由于第三方目录可能包含不适合所有受众的内容，我们对 Porkast 上所有发现入口应用自动内容过滤和公开的禁止内容清单。',
                ]
            },
            {
                heading: '禁止内容',
                paragraphs: [
                    'Porkast 不允许并主动过滤以下类别的内容：',
                    '成人、NSFW、色情或性暗示内容，包括任何形式的暗示性内容与服务。',
                    '涉及未成年人的任何性相关或剥削性内容（零容忍）。',
                    '宣扬或协助暴力、武器、恐怖主义或自残的内容。',
                    '针对任何个人或群体的仇恨言论、骚扰或歧视。',
                    '非法商品、服务或活动，包括毒品、赌博和欺诈。',
                    '恶意软件、钓鱼、诈骗或侵犯知识产权的内容。',
                ]
            },
            {
                heading: '我们如何过滤内容',
                paragraphs: [
                    '在展示任何播客或单集之前，我们会检查播客目录（Apple Podcasts、Spotify、Podcast Index）提供的显式内容标记。',
                    '我们对搜索词、搜索结果、播客频道、单集页面和订阅内容应用禁止关键词与类别清单。',
                    '成人及禁止类别会从关键词订阅结果和 Porkast 生成的 RSS 源中排除。',
                    '针对禁止内容的搜索词会被拦截，并显示内容政策提示。',
                    '被识别为禁止的内容会从我们的存储数据中删除，并从所有发现入口隐藏。',
                ]
            },
            {
                heading: '举报内容',
                paragraphs: [
                    '如果您在 Porkast 上发现您认为违反本政策的内容，请通过以下邮箱举报：',
                    CONTENT_REPORT_EMAIL,
                    '请尽量提供播客标题、单集标题以及 Porkast 链接。我们会审核每一份举报，并及时移除确认违规的内容。',
                ]
            },
            {
                heading: '执行',
                paragraphs: [
                    '违反本政策的内容将从发现入口过滤、从我们的系统中删除，并从生成的 RSS 源中排除。',
                    '滥用服务以访问、分享或推广禁止内容的账户可能被暂停或终止。',
                ]
            },
            {
                heading: '联系方式',
                paragraphs: [
                    '如对本内容政策有任何疑问，请联系：',
                    CONTENT_REPORT_EMAIL,
                ]
            },
        ]
    }
}

export default function ContentPolicyPage() {
    const [lang, setLang] = useState<Lang>('en')

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('lang') === 'zh') setLang('zh')
    }, [])

    const t = content[lang]

    return (
        <>
            <Header hideSearchBtn={true}>
                <div className="w-full flex justify-center min-h-screen">
                    <div className="w-full max-w-3xl pt-24 px-6 pb-12">
                        <div className="bg-base-200 p-8 rounded-xl shadow-lg">
                            <div className="flex justify-end mb-6">
                                <div className="join">
                                    <button
                                        className={`join-item btn btn-sm ${lang === 'en' ? 'btn-active' : ''}`}
                                        onClick={() => setLang('en')}
                                    >
                                        EN
                                    </button>
                                    <button
                                        className={`join-item btn btn-sm ${lang === 'zh' ? 'btn-active' : ''}`}
                                        onClick={() => setLang('zh')}
                                    >
                                        中文
                                    </button>
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold mb-2">{t.title}</h1>
                            <p className="text-sm text-base-content/60 mb-8">{t.lastUpdated}</p>

                            {t.sections.map((section, i) => (
                                <div key={i} className="mb-6">
                                    <h2 className="text-lg font-semibold mb-2">{section.heading}</h2>
                                    {section.paragraphs.map((p, j) => (
                                        <p key={j} className="text-base text-base-content/80 mb-1">{p}</p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Header>
            <Footer />
        </>
    )
}
