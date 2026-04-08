import { ipcMain, protocol } from 'electron'
import fs from 'fs'
import path from 'path'

import { tileServerUrl } from '@shared/config/maps'
import { STORAGE_PATH } from '@shared/config/storage'

import type { MapDownloadRequest } from '@shared/types/maps'

/* eslint-disable @typescript-eslint/no-extraneous-class */
class MapService {
    public static initialize(): void {
        protocol.registerSchemesAsPrivileged([
            {
                scheme: 'map',
                privileges: {
                    standard: true,
                    secure: true,
                    supportFetchAPI: true,
                    corsEnabled: true,
                },
            },
        ])
    }

    public static registerIpcHandlers(): void {
        ipcMain.handle('maps:downloadArea', async (event, request: MapDownloadRequest) => {
            await MapService.downloadArea(request)
        })
    }

    public static initializeProtocol(): void {
        protocol.handle('map', async request => {
            const url = new URL(request.url)

            switch (url.hostname) {
                case 'tile': {
                    try {
                        const parts = url.pathname.split('/')
                        const [_, z, x, y] = parts.map(part => parseInt(part, 10)) // eslint-disable-line id-denylist

                        const tile = await MapService.getTile(x, y, z)
                        if (tile) {
                            return new Response(tile, {
                                headers: { 'Content-Type': 'application/octet-stream' },
                            })
                        }
                        return new Response('Tile not found', { status: 404 })
                    } catch (error) {
                        console.error('[MapService]: Failed to serve tile from protocol: ', error, '\n\n')
                        return new Response('Failed to serve tile', { status: 500 })
                    }
                }

                default:
                    return new Response('Not found', { status: 404 })
            }
        })
    }

    // eslint-disable-next-line id-denylist
    private static getTilePath(x: number, y: number, z: number): string {
        return path.join(STORAGE_PATH, 'map-tiles', `${z}`, `${x}`, `${y}.pbf`) // eslint-disable-line id-denylist
    }

    // eslint-disable-next-line id-denylist
    private static async getTile(x: number, y: number, z: number): Promise<Buffer | null> {
        const tilePath = MapService.getTilePath(x, y, z)

        if (fs.existsSync(tilePath)) {
            return fs.readFileSync(tilePath)
        }
        return await MapService.downloadTile(x, y, z)
    }

    // eslint-disable-next-line id-denylist
    private static async downloadTile(x: number, y: number, z: number): Promise<Buffer | null> {
        try {
            const apiKey = MapService.getApiKey()
            if (!apiKey) {
                return null
            }

            const url = `${tileServerUrl}?api_key=${encodeURIComponent(apiKey)}`
                .replace('{z}', String(z))
                .replace('{x}', String(x))
                .replace('{y}', String(y))

            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} while downloading tile`)
            }

            const tileData = Buffer.from(await response.arrayBuffer())

            const tilePath = MapService.getTilePath(x, y, z)
            const dir = path.dirname(tilePath)
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }
            fs.writeFileSync(tilePath, tileData)

            return tileData
        } catch (error) {
            console.error(`[MapService]: Failed to download tile ${z}/${x}/${y}: `, error, '\n\n') // eslint-disable-line id-denylist
            return null
        }
    }

    private static longitudeToTile(lon: number, zoom: number): number {
        return Math.floor(((lon + 180) / 360) * 2 ** zoom) // eslint-disable-line @typescript-eslint/no-magic-numbers
    }

    private static latitudeToTile(lat: number, zoom: number): number {
        return Math.floor(
            ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / // eslint-disable-line @typescript-eslint/no-magic-numbers
                2) *
                2 ** zoom
        )
    }

    private static async downloadArea(request: MapDownloadRequest): Promise<void> {
        const { minLat, minLon, maxLat, maxLon, minZoom, maxZoom } = request

        // eslint-disable-next-line id-denylist
        for (let z = minZoom; z <= maxZoom; z++) {
            const minX = MapService.longitudeToTile(minLon, z)
            const maxX = MapService.longitudeToTile(maxLon, z)
            const minY = MapService.latitudeToTile(maxLat, z)
            const maxY = MapService.latitudeToTile(minLat, z)

            // eslint-disable-next-line id-denylist
            for (let x = minX; x <= maxX; x++) {
                // eslint-disable-next-line id-denylist
                for (let y = minY; y <= maxY; y++) {
                    await MapService.downloadTile(x, y, z)
                }
            }
        }
    }

    private static getApiKey(): string | null {
        const apiKey = process.env.STADIAMAPS_KEY

        if (!apiKey) {
            console.error('[MapService]: Missing STADIAMAPS_KEY in environment variables')
            return null
        }

        return apiKey
    }
}

export default MapService
