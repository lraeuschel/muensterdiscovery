export type User = {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
}

export type Achievement = {
    id: number;
    achievement: string;
    description: string;
}

export type POI = {
    id: number;
    name: string;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [lon, lat]
    };
}