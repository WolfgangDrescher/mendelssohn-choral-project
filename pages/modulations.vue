<script setup>
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
    return transitionsData.value.transitions.filter(t => t.currentDeg === filter.currentDeg && t.nextDeg === filter.nextDeg)[0];
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
                {{ filteredTransition }}
            </template>

        </UTabs>
    </UContainer>
</template>
