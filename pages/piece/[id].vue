<script setup>
const localePath = useLocalePath();
const { params: { id } } = useRoute();
const { data: piece } = await useAsyncData(`pieces/${id}`, () => queryContent(`/pieces/${id}`).findOne());

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

const filters = reactive({
    hideLyrics: false,
    hideDynamics: false,
    pianoReduction: false,
    autobeam: false,
    bassstufen: false,
    fb: false,
    highlightChords: false,
});

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
            lines[i] = lines[i].split('\t').map((token, index) => {
                if (isKernToken(token) && highlightedLines.includes(i+1)) return `${token}@`;
                return token;
            }).join('\t');
        }
    }

    const usedFilters = [];

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
        usedFilters.push('fb -canr --above');
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

            <div class="flex items-center gap-4">
                <div class="flex gap-6">
                    <UCheckbox v-model="filters.highlightChords" :label="$t('highlightChords')" />
                    <UCheckbox v-model="filters.hideLyrics" :label="$t('hideLyrics')" />
                    <UCheckbox v-model="filters.hideDynamics" :label="$t('hideDynamics')" />
                    <UCheckbox v-model="filters.pianoReduction" :label="$t('pianoReduction')" />
                    <UCheckbox v-model="filters.autobeam" :label="$t('autobeam')" />
                    <UCheckbox v-model="filters.bassstufen" :label="$t('bassstufen')" />
                    <UCheckbox v-model="filters.fb" :label="$t('figuredBassFigures')" />
                </div>
                <div class="flex gap-2 ml-auto">
                    <UButton :to="`https://github.com/WolfgangDrescher/mendelssohn-choral-works/blob/master/kern/${piece.id}.krn`" target="_blank">
                        Auf GitHub öffnen
                    </UButton>
                    <UButton :to="`https://verovio.humdrum.org/?file=${encodeURIComponent(`https://github.com/WolfgangDrescher/mendelssohn-choral-works/blob/master/kern/${piece.id}.krn`)}`" target="_blank">
                        Im VHV öffnen
                    </UButton>
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

        </div>
    </UContainer>
</template>
