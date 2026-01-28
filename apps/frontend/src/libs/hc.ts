import { type Client, hcWithType } from "@urlshortener/backend/hc";

export const client = hcWithType("/api");

export type App = Client;
