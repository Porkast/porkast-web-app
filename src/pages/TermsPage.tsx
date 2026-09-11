import { useEffect, useState } from 'react'
import Header from '../component/Header'
import Footer from '../component/Footer'

type Lang = 'en' | 'zh'

const content: Record<Lang, {
    title: string
    lastUpdated: string
    sections: { heading: string; paragraphs: string[] }[]
    contactEmail: string
}> = {
    en: {
        title: 'Terms of Service',
        lastUpdated: 'Last updated: May 2026',
        contactEmail: 'support@porkast.com',
        sections: [
            {
                heading: 'Acceptance of Terms',
                paragraphs: [
                    'By accessing or using Porkast ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.',
                ]
            },
            {
                heading: 'Description of Service',
                paragraphs: [
                    'Porkast is a podcast discovery and personalization platform that allows you to:',
                    'Search for podcasts across multiple sources',
                    'Subscribe to keywords and topics',
                    'Create and manage playlists',
                    'Save episodes to your Listen Later list',
                    'Receive notifications for new matching episodes',
                ]
            },
            {
                heading: 'User Accounts',
                paragraphs: [
                    'You must provide a valid email address to create an account.',
                    'You are responsible for maintaining the confidentiality of your account.',
                    'You must not share your verification codes with others.',
                    'You may delete your account by contacting us at support@porkast.com.',
                ]
            },
            {
                heading: 'User Content and Conduct',
                paragraphs: [
                    'You are responsible for the keywords you subscribe to and the content you save.',
                    'You agree not to use the Service for any unlawful purpose.',
                    'You agree not to attempt to gain unauthorized access to our systems.',
                ]
            },
            {
                heading: 'Prohibited Content',
                paragraphs: [
                    'Porkast prohibits adult, NSFW, and other unlawful or harmful content on the Service. Prohibited content is filtered from search results, podcast pages, subscriptions, and generated RSS feeds.',
                    'For the full list of prohibited categories and how to report content, see our Content Policy at porkast.com/content-policy.',
                ]
            },
            {
                heading: 'Intellectual Property Rights',
                paragraphs: [
                    'Podcast content accessible through Porkast is owned by the respective podcast creators and rights holders. Porkast does not claim ownership over any third-party podcast content.',
                    'The Porkast name, logo, and app interface are our intellectual property.',
                ]
            },
            {
                heading: 'Third-Party Services',
                paragraphs: [
                    'Our Service integrates with third-party platforms (Apple Podcasts, Spotify, Telegram). Your use of these platforms is governed by their respective terms of service. Porkast is not responsible for third-party content.',
                ]
            },
            {
                heading: 'Disclaimer of Warranties',
                paragraphs: [
                    'THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.',
                ]
            },
            {
                heading: 'Limitation of Liability',
                paragraphs: [
                    'TO THE MAXIMUM EXTENT PERMITTED BY LAW, PORKAST SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.',
                ]
            },
            {
                heading: 'Termination',
                paragraphs: [
                    'We reserve the right to suspend or terminate your access to the Service at our discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or the Service.',
                ]
            },
            {
                heading: 'Governing Law',
                paragraphs: [
                    'These Terms are governed by the laws of China and the United States, depending on your jurisdiction. Any disputes shall be resolved in the appropriate courts of the applicable jurisdiction.',
                ]
            },
            {
                heading: 'Changes to Terms',
                paragraphs: [
                    'We may modify these Terms at any time. Changes will be posted on this page. Continued use after changes constitutes your acceptance of the new Terms.',
                ]
            },
            {
                heading: 'Contact Information',
                paragraphs: [
                    'For questions about these Terms, contact us at:',
                    'support@porkast.com',
                ]
            },
        ]
    },
    zh: {
        title: '服务条款',
        lastUpdated: '最后更新：2026年5月',
        contactEmail: 'support@porkast.com',
        sections: [
            {
                heading: '条款接受',
                paragraphs: [
                    '访问或使用 Porkast（以下简称"服务"），即表示您同意受本服务条款的约束。如不同意，请勿使用本服务。',
                ]
            },
            {
                heading: '服务说明',
                paragraphs: [
                    'Porkast 是一个播客发现与个性化平台，允许您：',
                    '跨多个来源搜索播客',
                    '订阅关键词和话题',
                    '创建和管理播放列表',
                    '将节目保存到稍后收听列表',
                    '接收匹配新节目的通知',
                ]
            },
            {
                heading: '用户账户',
                paragraphs: [
                    '您必须提供有效的电子邮件地址以创建账户。',
                    '您有责任维护账户的机密性。',
                    '您不得与他人分享您的验证码。',
                    '您可以通过 support@porkast.com 联系我们删除您的账户。',
                ]
            },
            {
                heading: '用户内容与行为',
                paragraphs: [
                    '您对自己订阅的关键词和保存的内容负责。',
                    '您同意不将本服务用于任何非法目的。',
                    '您同意不试图未经授权访问我们的系统。',
                ]
            },
            {
                heading: '禁止内容',
                paragraphs: [
                    'Porkast 禁止成人、NSFW 以及其他违法或有害内容。禁止内容会从搜索结果、播客页面、订阅内容以及生成的 RSS 源中过滤。',
                    '完整的禁止类别清单和举报方式请参见我们的内容政策：porkast.com/content-policy。',
                ]
            },
            {
                heading: '知识产权',
                paragraphs: [
                    '通过 Porkast 访问的播客内容归各自的播客创作者和权利持有人所有。Porkast 不对任何第三方播客内容主张所有权。',
                    'Porkast 名称、标志和应用界面是我们的知识产权。',
                ]
            },
            {
                heading: '第三方服务',
                paragraphs: [
                    '我们的服务集成了第三方平台（Apple Podcasts、Spotify、Telegram）。您对这些平台的使用受其各自的服务条款约束。Porkast 不对第三方内容负责。',
                ]
            },
            {
                heading: '免责声明',
                paragraphs: [
                    '本服务按"原样"提供，不提供任何明示或暗示的保证。我们不保证服务不会中断、没有错误或完全安全。',
                ]
            },
            {
                heading: '责任限制',
                paragraphs: [
                    '在法律允许的最大范围内，Porkast 不对因使用本服务而产生的任何间接、附带、特殊、后果性或惩罚性损害赔偿承担责任。',
                ]
            },
            {
                heading: '终止',
                paragraphs: [
                    '我们保留自行决定暂停或终止您访问本服务的权利，恕不另行通知，针对我们认为违反本条款或对其他用户或服务有害的行为。',
                ]
            },
            {
                heading: '适用法律',
                paragraphs: [
                    '本条款受中国和美国法律管辖，具体取决于您所在的司法管辖区。任何争议应在适用司法管辖区的适当法院解决。',
                ]
            },
            {
                heading: '条款变更',
                paragraphs: [
                    '我们可能随时修改本条款。变更将在本页面发布。变更后继续使用即表示您接受新条款。',
                ]
            },
            {
                heading: '联系方式',
                paragraphs: [
                    '如对本条款有任何疑问，请通过以下方式联系我们：',
                    'support@porkast.com',
                ]
            },
        ]
    },
}

export default function TermsPage() {
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
