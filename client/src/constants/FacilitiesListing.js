export const orgAbbreviations = [
    'Gymnasium',
    'HE Hall',
    'AV Room',
    'EdTech Hall',
    // CLB1 to CLB5
    'CLB1', 'CLB2', 'CLB3', 'CLB4', 'CLB5',
    // P-101 to P-115
    ...Array.from({ length: 15 }, (_, i) => `P-${101 + i}`),
    // N-101 to N-125 for each floor N-1 to N-6
    ...Array.from({ length: 6 }, (_, floor) =>
        Array.from({ length: 25 }, (_, i) => `N-${floor + 1}${(i + 1).toString().padStart(2, '0')}`)
    ).flat(),
    // P-101 to P-109 (again, if needed separately)
    ...Array.from({ length: 9 }, (_, i) => `P-${101 + i}`),
    // C-101 to C-135
    ...Array.from({ length: 35 }, (_, i) => `C-${101 + i}`),
    ...Array.from({ length: 20 }, (_, i) => `M-${101 + i}`)
];