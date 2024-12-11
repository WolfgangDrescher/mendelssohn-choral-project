<script setup>
import { onKeyStroke } from '@vueuse/core';

const { data } = await useAsyncData('pieces', () => queryContent('/pieces').find());
const { data: modulationsData } = await useAsyncData(`modulations`, () => queryContent(`/modulations`).findOne(), {deep: false });
const { data: sequencesData } = await useAsyncData(`sequences-data`, () => queryContent(`/sequences-data`).findOne(), {deep: false });
const { data: transitionsData } = await useAsyncData(`transitions`, () => queryContent(`/transitions`).findOne(), {deep: false });
const localePath = useLocalePath();

const { t } = useI18n();

const options = reactive({
    showKeys: false,
    hideSequences: false,
});

const separator = ' → ';

const tabItems = [
    {
        slot: 'minimap',
        label: t('minimap'),
        icon: 'i-heroicons-map',
    },
    {
        slot: 'transitions',
        label: t('transitions'),
        icon: 'i-heroicons-chart-bar-solid',
    },
];

const transitionsConfig = computed(() => ({
    type: 'bar',
    data: {
        datasets: [{
            data: transitionsData.value.transitions.sort((a, b) => b.count > a.count ? 1 : -1).map(i => ({ x: `${i.currentDeg}${separator}${i.nextDeg}`, y: i.count })),
        }],
    },
    options: {
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                yAlign: 'bottom',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    },
}));

const filter = reactive({
    currentDeg: null,
    nextDeg: null,
});

function chartClickHandler(chart, event) {
    const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: false, axis: 'x' }, true);
    if (points.length) {
        const firstPoint = points[0];
        const value = chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index].x;
        const degs = value.split(separator);
        if (filter.currentDeg === degs[0] && filter.nextDeg === degs[1]) {
            filter.currentDeg = null;
            filter.nextDeg = null;
        } else {
            filter.currentDeg = degs[0];
            filter.nextDeg = degs[1];
        }
    }
    event.stopPropagation();
}

const filteredTransition = computed(() => {
    return transitionsData.value.transitions.filter(t => t.currentDeg === filter.currentDeg && t.nextDeg === filter.nextDeg)[0] ?? {};
});

const openModal = ref(false);
const modalScoreData = ref();
async function loadScoreData(item) {
    modalScoreData.value = null;
    const data = await $fetch(`/kern/mendelssohn-choral-works/${item.id}.krn`, { parseResponse: (txt) => txt });
    const lines = data.split('\n');

    const i = item.lineNumber - 1;
    const tokens = lines[i].split('\t');
    tokens.forEach((_, tokenIndex) => {
        const resolvedLineIndex = getResolvedTokenLineIndex(i, tokenIndex, lines);
        if (resolvedLineIndex) {
            lines[resolvedLineIndex] = lines[resolvedLineIndex].split('\t').map((token, ti) => {
                if (ti === tokenIndex &&/^[\[\(]?\d+/.test(token)) {
                    return `${token}@`;
                }
                return token;
            }).join('\t');
        }
    });
    
    lines.push('!!!filter: deg -k 1 --circle');
    lines.push('!!!filter: fb -cnl --above');
    lines.push('!!!filter: extract -I text');
    lines.push('!!!filter: extract -I dynam');
    lines.push('!!!filter: autobeam');
    lines.push('!!!filter: satb2gs');
    lines.push('!!!RDF**kern: @ = marked note color="#ef4444');
    modalScoreData.value = lines.join('\n');
    openModal.value = `${item.id}-${item.beat}`;
}

function tokenIsDataRecord(line, includeNullToken = false) {
    return !line.startsWith('!') && !line.startsWith('*') && !line.startsWith('=') && !(!includeNullToken && line === '.');
}

function getResolvedTokenLineIndex(lineIndex, spineIndex, lines) {
    for (let i = lineIndex; i >= 0; i--) {
        const token = lines[i].split('\t')[spineIndex];
        if (token && tokenIsDataRecord(token)) {
            return i;
        }
    }
    return null;
}

function closeModal() {
    openModal.value = null
    activeIndex = null;
    modalScoreData.value = null;
}

let activeIndex = null;
function loadIndex(index) {
    const item = filteredTransition.value.items[index]; 
    if (item) {
        loadScoreData(item);
        activeIndex = index;
    }
}

onKeyStroke('ArrowLeft', () => {
    if (activeIndex !== null) loadIndex(activeIndex - 1);
});

onKeyStroke('ArrowRight', () => {
    if (activeIndex !== null) loadIndex(activeIndex + 1);
});
</script>

<template>
    <UContainer>
        <Heading>{{ $t('modulations') }}</Heading>

        <UTabs :items="tabItems">

            <template #minimap>
                <div class="my-4 flex grow-0 flex-wrap gap-6 md:order-1">
                    <UCheckbox v-model="options.showKeys" :label="$t('showKeys')" />
                    <UCheckbox v-model="options.hideSequences" :label="$t('hideSequences')" />
                </div>
                <div class="grid grid-cols-1 gap-4">
                    <UCard v-for="piece in data">
                        <template #header>
                            <NuxtLink :to="localePath({ name: 'piece-id', params: { id: piece.id } })">
                                <div class="flex">
                                    <div>
                                        {{ piece.title }}
                                    </div>
                                    <div class="ml-auto">
                                        {{ `Op. ${piece.op} № ${piece.nr}` }}
                                    </div>
                                </div>
                            </NuxtLink>
                        </template>
                        <PieceMap :modulations="modulationsData[piece.id]" :sequences="sequencesData[piece.id]" :show-keys="options.showKeys" :hide-sequences="options.hideSequences" />
                    </UCard>
                </div>
            </template>

            <template #transitions>
                <div class="h-[300px]">
                    <Chart :config="transitionsConfig" @chart-click="chartClickHandler" />
                </div>
                <div v-if="filteredTransition.items" class="flex flex-wrap gap-2 mt-4">
                    <UButton v-for="(item, index) in filteredTransition.items" :key="`${item.id}-${item.beat}`" @click="loadIndex(index)">
                        {{ `${item.id}-${item.beat}` }}
                        <Modal v-if="openModal === `${item.id}-${item.beat}`" @close="closeModal">
                            <MidiPlayer :url="`/kern/mendelssohn-choral-works/${item.id}.krn`" class="text-2xl" />
                            <VerovioCanvas v-if="modalScoreData"  :data="modalScoreData" :scale="35" :page-margin="50" :key="modalScoreData" />
                            <div class="flex gap-4">
                                <UButton v-if="filteredTransition.items[index - 1]" @click="loadIndex(index - 1)" class="mr-auto">{{ $t('previous') }}</UButton>
                                <UButton v-if="filteredTransition.items[index + 1]" @click="loadIndex(index + 1)" class="ml-auto">{{ $t('next') }}</UButton>
                            </div>
                        </Modal>
                    </UButton>
                </div>
            </template>

        </UTabs>
    </UContainer>
</template>
