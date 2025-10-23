export const orgAbbreviations = [
    { facility: 'Gymnasium', capacity: '1500 students', equipment: 'speakers, microphone' },
    { facility: 'HE Hall', capacity: '100', equipment: 'none' },
    { facility: 'AV Room', capacity: '200', equipment: 'DLP, speaker, microphone' },
    { facility: 'EdTech Hall', capacity: '150', equipment: 'DLP, speaker, microhpone' },

    ...Array.from({ length: 5 }, (_, i) => ({
        facility: `CLB${i + 1}`,
        capacity: '50 students',
        equipment: 'computers, DLP',
    })),

    ...Array.from({ length: 15 }, (_, i) => ({
        facility: `P-${101 + i}`,
        capacity: '50 students',
        equipment: 'DLP',
    })),

    ...Array.from({ length: 6 }, (_, floor) =>
        Array.from({ length: 25 }, (_, i) => ({
            facility: `N-${floor + 1}${(i + 1).toString().padStart(2, '0')}`,
            capacity: '50 students',
            equipment: 'DLP',
        }))
    ).flat(),

    ...Array.from({ length: 9 }, (_, i) => ({
        facility: `P-${101 + i}`,
        capacity: '50 students',
        equipment: 'DLP',
    })),

    ...Array.from({ length: 35 }, (_, i) => ({
        facility: `C-${101 + i}`,
        capacity: '50 students',
        equipment: 'DLP',
    })),

    ...Array.from({ length: 20 }, (_, i) => ({
        facility: `M-${101 + i}`,
        capacity: '50 students',
        equipment: 'DLP',
    })),
];
