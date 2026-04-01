import type { StyleSpecification } from 'maplibre-gl'

const COLORS = {
    background: '#1a1a2e',
    landcover: '#16213e',
    water: '#0f3460',
    landuseGreen: '#258E6E', // grass, parks
    landcoverForest: '#1F7A5E', // forests, woods
    landuseFarmland: '#675344', // farmland, fields
    countryBoundary: '#623a64',
    highwayRoad: {
        color: '#4E6179',
        border: '#445569',
    },
    primaryRoad: {
        color: '#485970',
        border: '#3E4C60',
    },
    secondaryRoad: {
        color: '#425168',
        border: '#374457',
    },
    minorRoad: '#323C4E',
}

/* eslint-disable @typescript-eslint/no-magic-numbers */
export const MAP_STYLE: StyleSpecification = {
    version: 8,
    name: 'Dark Map Style',
    sources: {
        openmaptiles: {
            type: 'vector',
            tiles: ['map://tile/{z}/{x}/{y}'],
            maxzoom: 14,
            attribution: '© OpenMapTiles © OpenStreetMap contributors',
        },
    },
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    layers: [
        {
            id: 'background',
            type: 'background',
            paint: {
                'background-color': COLORS.background,
            },
        },
        {
            id: 'water',
            type: 'fill',
            source: 'openmaptiles',
            'source-layer': 'water',
            paint: {
                'fill-color': COLORS.water,
            },
        },
        {
            id: 'landcover', // buildings, natural land, etc.
            type: 'fill',
            source: 'openmaptiles',
            'source-layer': 'landcover',
            paint: {
                'fill-color': COLORS.landcover,
            },
        },
        // Grass, parks, meadows
        {
            id: 'landuse-green',
            type: 'fill',
            source: 'openmaptiles',
            'source-layer': 'landuse',
            filter: ['in', 'class', 'grass', 'park', 'cemetery', 'pitch', 'recreation_ground'],
            paint: {
                'fill-color': COLORS.landuseGreen,
            },
        },
        // Forests, woods
        {
            id: 'landcover-forest',
            type: 'fill',
            source: 'openmaptiles',
            'source-layer': 'landcover',
            filter: ['in', 'class', 'wood', 'forest'],
            paint: {
                'fill-color': COLORS.landcoverForest,
            },
        },
        // Farmland, fields
        {
            id: 'landuse-farmland',
            type: 'fill',
            source: 'openmaptiles',
            'source-layer': 'landuse',
            filter: ['in', 'class', 'farmland', 'farm', 'orchard', 'vineyard'],
            paint: {
                'fill-color': COLORS.landuseFarmland,
            },
        },
        // ========== ROADS ==========
        // highway roads
        {
            id: 'road-highway-casing',
            type: 'line',
            source: 'openmaptiles',
            'source-layer': 'transportation',
            filter: ['all', ['==', '$type', 'LineString'], ['in', 'class', 'motorway', 'trunk']],
            layout: {
                'line-cap': 'round',
                'line-join': 'round',
            },
            paint: {
                'line-color': COLORS.highwayRoad.border,
                'line-width': ['interpolate', ['linear'], ['zoom'], 5, 2, 12, 8, 18, 28],
            },
        },
        {
            id: 'road-highway',
            type: 'line',
            source: 'openmaptiles',
            'source-layer': 'transportation',
            filter: ['all', ['==', '$type', 'LineString'], ['in', 'class', 'motorway', 'trunk']],
            layout: {
                'line-cap': 'round',
                'line-join': 'round',
            },
            paint: {
                'line-color': COLORS.highwayRoad.color,
                'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1, 12, 5, 18, 22],
            },
        },
        // primary roads
        {
            id: 'road-primary-casing',
            type: 'line',
            source: 'openmaptiles',
            'source-layer': 'transportation',
            filter: ['all', ['==', '$type', 'LineString'], ['==', 'class', 'primary']],
            layout: {
                'line-cap': 'round',
                'line-join': 'round',
            },
            paint: {
                'line-color': COLORS.primaryRoad.border,
                'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1, 12, 5, 18, 20],
            },
        },
        {
            id: 'road-primary',
            type: 'line',
            source: 'openmaptiles',
            'source-layer': 'transportation',
            filter: ['all', ['==', '$type', 'LineString'], ['==', 'class', 'primary']],
            layout: {
                'line-cap': 'round',
                'line-join': 'round',
            },
            paint: {
                'line-color': COLORS.primaryRoad.color,
                'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 12, 3, 18, 16],
            },
        },
        // secondary and tertiary roads
        {
            id: 'road-secondary-casing',
            type: 'line',
            source: 'openmaptiles',
            'source-layer': 'transportation',
            filter: ['all', ['==', '$type', 'LineString'], ['in', 'class', 'secondary', 'tertiary']],
            layout: {
                'line-cap': 'round',
                'line-join': 'round',
            },
            paint: {
                'line-color': COLORS.secondaryRoad.border,
                'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 14, 4, 18, 14],
            },
        },

        {
            id: 'road-secondary',
            type: 'line',
            source: 'openmaptiles',
            'source-layer': 'transportation',
            filter: ['all', ['==', '$type', 'LineString'], ['in', 'class', 'secondary', 'tertiary']],
            layout: {
                'line-cap': 'round',
                'line-join': 'round',
            },
            paint: {
                'line-color': COLORS.secondaryRoad.color,
                'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 14, 2, 18, 10],
            },
        },
        // Minor roads - only at high zoom
        {
            id: 'road-minor',
            type: 'line',
            source: 'openmaptiles',
            'source-layer': 'transportation',
            minzoom: 13,
            filter: ['all', ['==', '$type', 'LineString'], ['in', 'class', 'minor', 'service', 'street']],
            layout: {
                'line-cap': 'round',
                'line-join': 'round',
            },
            paint: {
                'line-color': COLORS.minorRoad,
                'line-width': ['interpolate', ['linear'], ['zoom'], 13, 1, 18, 6],
            },
        },
        // ========== LABELS ==========
        // Road shields/numbers
        {
            id: 'road-shield',
            type: 'symbol',
            source: 'openmaptiles',
            'source-layer': 'transportation_name',
            minzoom: 8,
            filter: ['has', 'ref'],
            layout: {
                'symbol-placement': 'line',
                'text-field': ['get', 'ref'],
                'text-font': ['Open Sans Bold'],
                'text-size': 11,
                'text-rotation-alignment': 'viewport',
                'text-pitch-alignment': 'viewport',
                'symbol-spacing': 500,
            },
            paint: {
                'text-color': '#ffffff',
                'text-halo-color': '#e94560',
                'text-halo-width': 2,
            },
        },
        // Road names - only major roads
        {
            id: 'road-label',
            type: 'symbol',
            source: 'openmaptiles',
            'source-layer': 'transportation_name',
            minzoom: 14,
            filter: ['in', 'class', 'motorway', 'trunk', 'primary', 'secondary'],
            layout: {
                'symbol-placement': 'line',
                'text-field': ['get', 'name'],
                'text-font': ['Open Sans Regular'],
                'text-size': 12,
                'text-rotation-alignment': 'map',
                'text-pitch-alignment': 'viewport',
            },
            paint: {
                'text-color': '#e0e0e0',
                'text-halo-color': '#1a1a2e',
                'text-halo-width': 2,
            },
        },
        // City/town labels - large and visible
        {
            id: 'place-city',
            type: 'symbol',
            source: 'openmaptiles',
            'source-layer': 'place',
            filter: ['in', 'class', 'city', 'town'],
            layout: {
                'text-field': ['get', 'name'],
                'text-font': ['Open Sans Bold'],
                'text-size': ['interpolate', ['linear'], ['zoom'], 6, 14, 12, 24],
                'text-anchor': 'center',
                'text-rotation-alignment': 'viewport',
                'text-pitch-alignment': 'viewport',
            },
            paint: {
                'text-color': '#ffffff',
                'text-halo-color': '#1a1a2e',
                'text-halo-width': 2,
            },
        },
        // Village labels - smaller
        {
            id: 'place-village',
            type: 'symbol',
            source: 'openmaptiles',
            'source-layer': 'place',
            minzoom: 10,
            filter: ['in', 'class', 'village', 'suburb'],
            layout: {
                'text-field': ['get', 'name'],
                'text-font': ['Open Sans Regular'],
                'text-size': 12,
                'text-anchor': 'center',
                'text-rotation-alignment': 'viewport',
                'text-pitch-alignment': 'viewport',
            },
            paint: {
                'text-color': '#a0a0a0',
                'text-halo-color': '#1a1a2e',
                'text-halo-width': 1,
            },
        },
        {
            id: 'boundary-country',
            type: 'line',
            source: 'openmaptiles',
            'source-layer': 'boundary',
            filter: ['all', ['==', 'admin_level', 2], ['==', 'maritime', 0]],
            paint: {
                'line-color': COLORS.countryBoundary,
                'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1, 10, 2, 14, 3],
                'line-dasharray': [4, 1, 1, 1],

                'line-opacity': 1,
            },
        },
    ],
}
