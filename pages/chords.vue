<script setup>
import { onKeyStroke } from '@vueuse/core';

const { data: chordsData } = await useAsyncData('chords', () => queryContent('/chords').findOne(), {
    deep: false,
});

const { t } = useI18n();

const chords = chordsData.value.chords;
const uniqueDegs = [...new Set(chords.map(chord => chord.deg))].toSorted((a, b) => {
    return a.replaceAll(/\D/g, '') < b.replaceAll(/\D/g, '') ? -1 : 1;
});
const uniqueFb = [...new Set(chords.map(chord => chord.fb))].toSorted((a, b) => {
    const aCount = a.split(' ').length;
    const bCount = b.split(' ').length;
    if (aCount === bCount) {
        return a.localeCompare(b);
    }
    return aCount - bCount;
});
const uniqueHint = [...new Set(chords.map(chord => chord.hint))].toSorted((a, b) => {
    const aCount = a.split(' ').length;
    const bCount = b.split(' ').length;
    if (aCount === bCount) {
        return a.replaceAll(/\D/g, '').localeCompare(b.replaceAll(/\D/g, ''));
    }
    return aCount - bCount;
});

const filteredChords = computed(() => {
    return chords.filter(e => {
        const filterDeg = (deg) => {
            if (deg === null || !deg.length) return true;
            return deg.includes(e.deg);
        };
        const filterFb = (fb) => {
            if (fb === null || !fb.length) return true;
            return fb.includes(e.fb);
        };
        const filterHint = (hint) => {
            if (hint === null || !hint.length) return true;
            return hint.includes(e.hint);
        };
        const filterSearch = (searchStr) => {
            if (searchStr === null || !searchStr.length) return true;
            return e.fb.includes(searchStr) || e.hint.includes(searchStr);
        };
        const filterIgnorePedalPoints = (pedalPoint) => {
            if (pedalPoint === null || pedalPoint === 'ignore') return true;
            return (pedalPoint === 'isolate' && e.isPartOfPedal) || (pedalPoint === 'exclude' && !e.isPartOfPedal);
        };
        return filterDeg(filters.deg)
            && filterFb(filters.fb)
            && filterHint(filters.hint)
            && filterSearch(filters.search)
            && filterIgnorePedalPoints(filters.pedalPoint)
        ;
    });
});

const defaultFilters = {
    mode: 'fb',
    deg: [],
    hint: [],
    fb: [],
    search: null,
    pedalPoint: 'ignore',
};

const filters = reactive({
    ...defaultFilters,
});

watch(() => filters.mode, (value) => {
    if (value === 'fb') {
        filters.hint = [];
    } else if (value === 'hint') {
        filters.fb = [];
    }
});

const fbGroupedChords = computed(() => {
    return Object.entries(filteredChords.value.reduce((obj, chord) => {
        const index = filters.mode === 'fb' ? chord.fb : chord.hint;
        obj[index] = (obj[index] ?? 0) + 1;
        return obj;
    }, {})).sort((a, b) => b[1] - a[1]);;
});

const degGroupedChords = computed(() => {
    return Object.entries(filteredChords.value.reduce((obj, chord) => {
        const index = chord.deg;
        obj[index] = (obj[index] ?? 0) + 1;
        return obj;
    }, {})).sort((a, b) => b[1] - a[1]);;
});

const fbConfig = computed(() => ({
    type: 'bar',
    data: {
        datasets: [{
            label: filters.mode === 'fb' ? t('fb') : t('exactIntervals'),
            data: fbGroupedChords.value.map(i => ({ x: i[0], y: i[1] })),
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
                // display: false,
                onClick: (e) => e.stopPropagation(),
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

const degConfig = computed(() => ({
    type: 'bar',
    data: {
        datasets: [{
            label: t('deg'),
            data: degGroupedChords.value.map(i => ({ x: i[0], y: i[1] })),
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
                // display: false,
                onClick: (e) => e.stopPropagation(),
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

function chartClickHandler(type, chart, event) {
    const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: false, axis: 'x' }, true);
    if (points.length) {
        const firstPoint = points[0];
        const prop = filters[type];
        const value = chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index].x;
        filters[type] = (prop === value || prop.includes?.(value)) ? [] : [value];
    }
}

const openModal = ref(null);
const modalScoreData = ref();
async function loadScoreData(group) {
    modalScoreData.value = null;
    const data = await $fetch(`/kern/mendelssohn-choral-works/${group.id}.krn`, { parseResponse: (txt) => txt });
    const lines = data.split('\n');
    const choraleIntervalLength = chordsData.value.chords.filter(i => i.id === group.id).length;
    if (group.chords.length < choraleIntervalLength) {
        group.chords.forEach((chord) => {
            for (let i = 0; i < lines.length; i++) {
                if (i === chord.lineNumber - 1) {
                    const tokens = lines[i].split('\t');
                    tokens.forEach((_, tokenIndex) => {
                        const resolvedLineIndex = getResolvedTokenLineIndex(i, tokenIndex, lines);
                        lines[resolvedLineIndex] = lines[resolvedLineIndex].split('\t').map((token, ti) => {
                            if (ti === tokenIndex &&/^\d+/.test(token)) {
                                return `${token}@`;
                            }
                            return token;
                        }).join('\t');
                    });
                }
            }
        });
    }
    lines.push('!!!filter: deg -k 1 --circle');
    lines.push('!!!filter: fb -cnl --above');
    lines.push('!!!filter: extract -I text');
    lines.push('!!!filter: extract -I dynam');
    lines.push('!!!filter: autobeam');
    lines.push('!!!filter: satb2gs');
    lines.push('!!!RDF**kern: @ = marked note');
    modalScoreData.value = lines.join('\n');
    openModal.value = group.id;
}

function closeModal() {
    openModal.value = null
    activeIndex = null;
    modalScoreData.value = null;
}

let activeIndex = null;
function loadIndex(index) {
    const item = chordsGroupById.value[index]; 
    if (item) {
        loadScoreData(item);
        activeIndex = index;
    }
}

const chordsGroupById = computed(() => {
    return Object.entries(filteredChords.value.reduce((accumulator, elem) => {
        accumulator[elem.id] = accumulator[elem.id] ?? [];
        accumulator[elem.id].push(elem);
        return accumulator;
    }, {})).map(([id, elements]) => ({
        id,
        chords: elements,
    })).sort((a, b) => {
        const aSplit = a.id.split('-', 2);
        const bSplit = b.id.split('-', 2);
        const aNum = parseFloat(aSplit[0]);
        const bNum = parseFloat(bSplit[0]);
        if (aNum === bNum) {
            return aSplit[1].localeCompare(bSplit[1]);
        }
        return aNum - bNum;
    });
});

function tokenIsDataRecord(line, includeNullToken = false) {
    return !line.startsWith('!') && !line.startsWith('*') && !line.startsWith('=') && !(!includeNullToken && line === '.');
}

function getResolvedTokenLineIndex(lineIndex, spineIndex, lines) {
    for (let i = lineIndex; i >= 0; i--) {
        const token = lines[i].split('\t')[spineIndex];
        if (tokenIsDataRecord(token)) {
            return i;
        }
    }
    return null;
}

onKeyStroke('ArrowLeft', () => {
    if (activeIndex !== null) loadIndex(activeIndex - 1);
});

onKeyStroke('ArrowRight', () => {
    if (activeIndex !== null) loadIndex(activeIndex + 1);
});

function resetFilters() {
    Object.assign(filters, defaultFilters);
}
</script>

<template>
    <UContainer>
        <Heading>{{ $t('chords') }}</Heading>
        <div>
            <div>
                <div class="flex flex-wrap gap-4 mb-4">
                    <UFormGroup :label="$t('mode')">
                        <USelectMenu v-model="filters.mode" :options="[{id: 'fb', label: $t('figuredBassNumbers')}, {id: 'hint', label: $t('exactIntervals')}]" value-attribute="id" option-attribute="label" size="xs" class="w-40" />
                    </UFormGroup>
                    <UFormGroup :label="$t('deg')">
                        <USelectMenu v-model="filters.deg" :options="uniqueDegs" multiple size="xs" class="w-32" />
                    </UFormGroup>
                    <UFormGroup :label="$t('fb')">
                        <USelectMenu v-model="filters.fb" :options="uniqueFb" multiple searchable size="xs" class="w-32" />
                    </UFormGroup>
                    <UFormGroup :label="$t('hint')">
                        <USelectMenu v-model="filters.hint" :options="uniqueHint" multiple searchable size="xs" class="w-32" />
                    </UFormGroup>
                    <UFormGroup :label="$t('intervalSearch')" :help="$t('largeFiguresFirst')">
                        <UInput v-model="filters.search" size="xs" class="w-32" />
                    </UFormGroup>
                    <UFormGroup :label="$t('pedalPoint')">
                        <USelectMenu v-model="filters.pedalPoint" :options="[{id: 'ignore', label: $t('ignore')},  {id: 'exclude', label: $t('exclude')}, {id: 'isolate', label: $t('isolate')}]" value-attribute="id" option-attribute="label" class="w-32" />
                    </UFormGroup>
                    <UFormGroup label="&nbsp;">
                        <UButton icon="i-heroicons-funnel" color="gray" size="xs" @click="resetFilters">
                            {{ $t('reset') }}
                        </UButton>
                    </UFormGroup>
                </div>
                <HintDescription class="my-4" />
            </div>

            <div class="my-4">
                {{ filteredChords.length }} / {{ chords.length }}
            </div>

            <div class="grid md:grid-cols-3 gap-4">
                <div class="col-span-2">
                    <div class="h-[300px]">
                        <Chart :config="fbConfig" @chart-click="(chart, event) => chartClickHandler(filters.mode, chart, event)" />
                    </div>
                </div>
                <div>
                    <div class="h-[300px]">
                        <Chart :config="degConfig" @chart-click="(chart, event) => chartClickHandler('deg', chart, event)" />
                    </div>
                </div>
            </div>
        </div>
        
        <div class="flex flex-wrap gap-2 mt-8">
            <UButton v-for="(group, index) in chordsGroupById" :key="group.id" @click="loadIndex(index)">
                {{ `${group.id} (${group.chords.length})` }}
                <Modal v-if="openModal === group.id" @close="closeModal" :title="group.id">
                    <MidiPlayer :url="`/kern/mendelssohn-choral-works/${group.id}.krn`" class="text-2xl" />
                    <VerovioCanvas v-if="modalScoreData"  :data="modalScoreData" :scale="35" :page-margin="50" :key="modalScoreData" />
                    <div class="flex gap-4">
                        <UButton v-if="chordsGroupById[index - 1]" @click="loadIndex(index - 1)" class="mr-auto">{{ $t('previous') }}</UButton>
                        <UButton v-if="chordsGroupById[index + 1]" @click="loadIndex(index + 1)" class="ml-auto">{{ $t('next') }}</UButton>
                    </div>
                </Modal>
            </UButton>
        </div>
    </UContainer>
</template>
