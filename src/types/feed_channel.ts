import { FeedItem } from "./feed_item";

export type FeedChannel = {
    Id: string;
    Title: string;
    ChannelDesc: string;
    TextChannelDesc: string;
    ImageUrl: string;
    FallbackImageUrls?: string[];
    Link: string;
    FeedLink: string;
    FeedType: string;
    Categories: string[];
    Author: string;
    OwnerName: string;
    OwnerEmail: string;
    Items: FeedItem[];
    Count: number;
    Copyright: string;
    Language: string;
    TookTime: number;
    HasThumbnail: boolean;
}
