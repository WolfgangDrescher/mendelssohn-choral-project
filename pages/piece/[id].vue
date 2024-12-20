<script setup>
const localePath = useLocalePath();
const { params: { id } } = useRoute();
const { data: piece } = await useAsyncData(`pieces/${id}`, () => queryContent(`/pieces/${id}`).findOne());
const { data: modulationsData } = await useAsyncData(`modulations`, () => queryContent(`/modulations`).findOne());
const { data: sequencesData } = await useAsyncData(`sequences-data`, () => queryContent(`/sequences-data`).findOne());

if (!piece.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
    });
}

const { data: surroundData } = await useAsyncData(`pieces/${id}/surround`, () => queryContent('/pieces').only(['_path', 'id', 'nr']).findSurround(piece.value._path))
const [prevPiece, nextPiece] = surroundData.value;
const { data: analysis } = await useAsyncData(`analysis`, () => queryContent(`/analysis`).findOne());

const highlightedLines = Object.entries(toRaw(analysis.value)).flatMap(([key, value]) => value).filter(el => el.id === id).map(el => el.lineNumber);

const score = ref();

const filters = usePieceFilterStore();

onMounted(async () => {
    const response = await fetch(piece.value.localRawFile);
    const kern = await response.text();
    score.value = kern;
});

const formattedData = computed(() => {

    function isKernToken(line, includeNullToken = false) {
        return /\d/.test(line) && !line.startsWith('!') && !line.startsWith('*') && !line.startsWith('=') && !(!includeNullToken && line === '.');
    }

    const lines = score.value?.trim().split('\n') ?? [];

    if (filters.highlightChords) {
        lines.push('!!!RDF**kern: @ = marked note color="#ef4444');
        for (let i = 0; i < lines.length ; i++) {
            lines[i] = lines[i].split('\t').map((token) => {
                if (isKernToken(token) && highlightedLines.includes(i+1)) return `${token}@`;
                return token;
            }).join('\t');
        }
    }

    const usedFilters = [];

    if (filters.outerVoices) {
        usedFilters.push('extract -k 1,$');
        usedFilters.push('fb -icma');
        usedFilters.push('extract -I "**text"');
    }

    if (filters.hideLyrics) {
        usedFilters.push('extract -I "**text"');
    }

    if (filters.hideDynamics) {
        usedFilters.push('extract -I "**dynam"');
    }

    if (filters.autobeam) {
        usedFilters.push('autobeam');
    }

    if (filters.bassstufen) {
        usedFilters.push('deg -k 1 --circle');
    }

    if (filters.fb) {
        usedFilters.push('fb -canrl --above');
    }

    if (filters.pianoReduction) {
        usedFilters.push('satb2gs');
    }

    return score.value ? `${lines.join('\n')}
${(usedFilters ?? []).map(filter => `!!!filter: ${filter}`).join('\n')}` : null;
});
</script>

<template>
    <UContainer>
        <div class="flex flex-col gap-8">

            <div>
                <Heading>
                    {{ `${piece.nr}. ${piece.title}` }}
                    <div class="text-base font-normal">
                        {{ piece.composer }}, Op. {{ piece.op }} Nr. {{ piece.nr }}
                    </div>
                </Heading>
                <div class="flex gap-2 items-center">
                    <div v-if="prevPiece">
                        <UButton :to="localePath({ name: 'piece-id', params: { id: prevPiece.id }, hash: $route.hash })">
                            <Icon name="heroicons:arrow-left-circle" class="text-xl" />
                            {{ $t('previous') }}
                        </UButton>
                    </div>
                    <div v-if="nextPiece">
                        <UButton :to="localePath({ name: 'piece-id', params: { id: nextPiece.id }, hash: $route.hash })">
                            {{ $t('next') }}
                            <Icon name="heroicons:arrow-right-circle" class="text-xl" />
                        </UButton>
                    </div>
                </div>
            </div>

            <div class="flex flex-col md:flex-row items-center gap-4">
                <div class="shrink-0 flex gap-2 ml-auto md:order-2">
                    <MidiPlayer :url="piece.localRawFile" class="text-2xl"/>
                    <UButton :to="piece.urlScan" target="_blank">
                        {{ $t('digitizedOriginal') }}
                    </UButton>
                    <UButton :to="`https://github.com/WolfgangDrescher/mendelssohn-choral-works/blob/master/kern/${piece.id}.krn`" target="_blank">
                        {{ $t('github') }}
                    </UButton>
                    <UButton :to="`https://verovio.humdrum.org/?file=${encodeURIComponent(`https://github.com/WolfgangDrescher/mendelssohn-choral-works/blob/master/kern/${piece.id}.krn`)}`" target="_blank">
                        {{ $t('vhv') }}
                    </UButton>
                </div>
                <div class="flex grow-0 flex-wrap gap-6 md:order-1">
                    <UCheckbox v-model="filters.outerVoices" :label="$t('Aussenstimmensatz')" />
                    <UCheckbox v-model="filters.highlightChords" :label="$t('highlightChords')" />
                    <UCheckbox v-model="filters.hideLyrics" :label="$t('hideLyrics')" />
                    <UCheckbox v-model="filters.hideDynamics" :label="$t('hideDynamics')" />
                    <UCheckbox v-model="filters.pianoReduction" :label="$t('pianoReduction')" />
                    <UCheckbox v-model="filters.autobeam" :label="$t('autobeam')" />
                    <UCheckbox v-model="filters.bassstufen" :label="$t('bassstufen')" />
                    <UCheckbox v-model="filters.fb" :label="$t('figuredBassFigures')" />
                </div>
            </div>

            <VerovioCanvas
                v-if="formattedData"
                :data="formattedData"
                :options="{
                    spacingSystem: 15,
                    pageMarginLeft: 30,
                    pageMarginRight: 30,
                    pageMarginTop: 10,
                    pageMarginBottom: 10,
                }"
            />

            <UCard>
                <template #header>
                    {{ $t('modulations') }}
                </template>
                <PieceMap :modulations="modulationsData?.[piece.id]" :sequences="sequencesData?.[piece.id]" />
            </UCard>

        </div>
    </UContainer>
</template>
