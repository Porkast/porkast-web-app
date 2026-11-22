import type { FeedItem } from "../types/feed_item";
import type { UserPlaylistDto } from "../types/playlist";
import type { JsonResponse } from "../types/api";
import { API_URL } from "./Constants";

export async function addToPlayList(userId: string, channelId: string, itemId: string, playlistId: string, source: string = 'itunes'): Promise<JsonResponse> {
    const respJson = await fetch(`${API_URL}/playlist/item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            channelId: channelId,
            guid: itemId,
            playlistId: playlistId,
            userId: userId,
            source: source
        })
    }).then(resp => resp.json()).catch(err => {
        console.log(err);
    });
    return respJson;
}

export async function getUserPlaylistByUserId(userId: string, page: number = 1): Promise<JsonResponse> {
    const limit = 10
    const offset = (page - 1) * limit
    const respJson = await fetch(`${API_URL}/playlist/list/${encodeURIComponent(userId)}?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(resp => resp.json()).catch(err => {
        console.log(err);
    })
    return {
        code: respJson.code,
        message: respJson.message,
        data: respJson.data
    }
}

export async function createPlaylist(userId: string, name: string, description: string = ''): Promise<JsonResponse> {
    const respJson = await fetch(`${API_URL}/playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: userId,
            name: name,
            description: description
        })
    }).then(resp => resp.json()).catch(err => {
        console.log(err);
    })
    return respJson
}

export async function getPlaylistInfoById(playlistId: string): Promise<{ code: number, message: string, data: UserPlaylistDto }> {
    const respJson = await fetch(`${API_URL}/playlist/${playlistId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    }).then(resp => resp.json()).catch(err => {
        console.log(err);
    })
    return respJson
}

export const getPlaylistItemListByUserId = async (userId: string, playlistId: string, page: number): Promise<{ code: number, message: string, data: FeedItem[] }> => {
    const limit = 10
    const offset = (page - 1) * limit
    const resp = await fetch(`${API_URL}/playlist/list/${encodeURIComponent(userId)}/${encodeURIComponent(playlistId)}?limit=${limit}&offset=${offset}`, {
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
