import type { FeedItem } from "../types/feed_item";
import type { JsonResponse } from "../types/api";
import type { SubscriptionDataDto } from "../types/subscription";
import { API_URL } from "./Constants";

export const SUBSCRIPTION_FEED_PAGE_SIZE = 10

export const subscribeSearchKeyword = async (userId: string, searchKeyword: string, country: string = 'US', source: string = 'itunes', excludeFeedId: string = '', token: string): Promise<JsonResponse> => {
    const apiUrl = `${API_URL}/subscribe/keyword`
    const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({
            userId: userId,
            keyword: searchKeyword,
            country: country,
            source: source,
            excludeFeedId: excludeFeedId
        })
    })
    const respJson = await resp.json()
    return respJson
}

export const subscribeUserListenLater = async (userId: string, creatorId: string, token: string): Promise<JsonResponse> => {
    const apiUrl = `${API_URL}/subscribe/listenlater`
    const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({
            userId: userId,
            creatorId: creatorId
        })
    })
    const respJson = await resp.json()
    return respJson
}

export const getUserSubscriptionList = async (userId: string): Promise<{ code: number, message: string, data: SubscriptionDataDto[] }> => {
    const subscriptionList: SubscriptionDataDto[] = []
    const resp = await fetch(`${API_URL}/subscribe/list?userId=${userId}`)
    const respJson = await resp.json()
    if (respJson && respJson.data) {
        subscriptionList.push(...respJson.data)
    }
    return {
        code: respJson.code,
        message: respJson.message,
        data: subscriptionList
    }
}

export const getUserKeywordSubscriptionItemList = async (userId: string, keyword: string, page: string): Promise<{ code: number, message: string, data: FeedItem[] }> => {
    let requestAPI = `${API_URL}/subscribe/${userId}/${keyword}`
    if (page) {
        requestAPI = `${requestAPI}?page=${page}`
    }
    const resp = await fetch(requestAPI, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    const respJson = await resp.json()
    return {
        code: respJson.code,
        message: respJson.message,
        data: respJson.data
    }
}

export const unsubscribeKeyword = async (userId: string, keyword: string): Promise<JsonResponse> => {
    const apiUrl = `${API_URL}/subscribe/${userId}/${encodeURIComponent(keyword)}`
    const resp = await fetch(apiUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })
    const respJson = await resp.json()
    return respJson
}

export const getUserAllSubscriptionItems = async (userId: string, offset: number, limit: number): Promise<{ code: number, message: string, data: FeedItem[] }> => {
    const resp = await fetch(`${API_URL}/subscribe/episodes/${userId}?offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    const respJson = await resp.json()
    return {
        code: respJson.code,
        message: respJson.message,
        data: respJson.data
    }
}
