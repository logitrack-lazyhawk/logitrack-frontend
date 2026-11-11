const paths = {
    box: 'M12 3 3 7.5v9L12 21l9-4.5v-9L12 3ZM3 7.5l9 4.5 9-4.5M12 12v9M7.5 5.25l9 4.5',
    arrow: 'M5 12h14m-6-6 6 6-6 6',
    search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    plus: 'M12 5v14M5 12h14',
    home: 'm3 10 9-7 9 7v11h-6v-7H9v7H3V10Z',
    logout: 'M9 4H4v16h5m5-13 5 5-5 5m-6-5h11',
    check: 'm5 12 4 4L19 6',
    truck: 'M3 6h11v12H3V6Zm11 5h4l3 4v3h-7M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
};

export default function Icon({ name = 'box', size = 20 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.box} /></svg>;
}
