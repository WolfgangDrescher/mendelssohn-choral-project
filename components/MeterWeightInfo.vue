<script setup>
/*
2/4
3/4
4/4
2/2
3/8
6/8
9/8
*/
const meters = [
    {
        meter: '2/4',
        basis: 8,
        beats: [['1', 'strong'], ['1+1/2', 'weak'], ['2', 'half-strong'], ['2+1/2', 'weak']],
    },
    {
        meter: '3/4',
        basis: 4,
        beats: [['1', 'strong'], ['2', 'weak'], ['3', 'weak']], 
    },
    {
        meter: '4/4',
        basis: 4,
        beats: [['1', 'strong'], ['2', 'weak'], ['3', 'half-strong'], ['4', 'weak']], 
    },
    {
        meter: '2/2',
        basis: 4,
        beats: [['1', 'strong'], ['1+1/2', 'weak'], ['2', 'half-strong'], ['2+1/2', 'weak']], 
    },
    {
        meter: '3/8',
        basis: 8,
        beats: [['1', 'strong'], ['2', 'weak'], ['3', 'weak']], 
    },
    {
        meter: '6/8',
        basis: 8,
        beats: [['1', 'strong'], ['1+1/3', 'weak'], ['1+2/3', 'weak'], ['2', 'half-strong'], ['2+1/3', 'weak'], ['2+2/3', 'weak']], 
    },
    {
        meter: '9/8',
        basis: 8,
        beats: [['1', 'strong'], ['1+1/3', 'weak'], ['1+2/3', 'weak'], ['2', 'half-strong'], ['2+1/3', 'weak'], ['2+2/3', 'weak'], ['3', 'half-strong'], ['3+1/3', 'weak'], ['3+2/3', 'weak']], 
    },
];

// grid-cols-1 grid-cols-2 grid-cols-3
// grid-cols-4 grid-cols-5 grid-cols-6
// grid-cols-7 grid-cols-8 grid-cols-9
</script>

<template>
    <div>
        <div class="space-y-4 mb-4">
            <div v-for="meter in meters" class="relative h-[70px]" :key="meter.meter">
                <div class="h-[1px] w-full left-0 bg-black absolute top-1/2 -translate-y-1/2"></div>
                <div class="w-[30px] border-r border-black h-full relative">
                    <div class="h-1/2 w-full text-center absolute top-0 leading-[30px] font-serif font-bold">
                        {{ meter.meter.split('/')[0] }}
                    </div>
                    <div class="h-1/2 w-full text-center absolute top-1/2 leading-[30px] font-serif font-bold">
                        {{ meter.meter.split('/')[1] }}
                    </div>
                </div>
                <div class="h-full w-full pl-[50px] absolute top-0 left-0">
                    <div class="h-full w-full grid" :class="`grid-cols-${meter.beats.length}`">
                        <div v-for="elem in meter.beats" class="relative">
                            <div class="h-1/2 w-full absolute top-0 text-3xl translate-y-[4px]">{{ meter.basis === 8 ? '♪' : '♩' }}</div>
                            <div class="h-1/2 w-full absolute top-1/2 text-xs pt-2">
                                <div>{{ elem[0] }}</div>
                                <div>{{ elem[1] }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-6">
            Zählzeiten die oben nicht aufgelistet sind (z.B. Sechzehntel) werden als "none" markiert.
        </div>
    </div>
</template>

