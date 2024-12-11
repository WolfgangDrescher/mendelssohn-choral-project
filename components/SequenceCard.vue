<script setup>
const localePath = useLocalePath();

const props = defineProps({
    sequence: {
        type: Object,
        required: true,
    },
});

const data = ref(null);
const piece = ref({});

onMounted(async () => {
    piece.value = await queryContent(`/pieces/${props.sequence.id}`).findOne();
    const response = await fetch(piece.value.localRawFile);
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
    data.value = await response.text();
});

const formattedData = computed(() => {
    const filters = [
        'extract -I text',
    ];
    if (props.sequence.startLine && props.sequence.endLine) {
        filters.push(`myank -l ${props.sequence.startLine}-${props.sequence.endLine}`);
    }
    return data.value ? `${data.value}
${(filters ?? []).map(filter => `!!!filter: ${filter}`).join('\n')}` : null;
});

const openModal = ref(false);
const modalScoreData = ref();
async function loadScoreData() {
    modalScoreData.value = null;
    const data = await $fetch(`/kern/mendelssohn-choral-works/${piece.value.id}.krn`, { parseResponse: (txt) => txt });
    const lines = data.split('\n');
    for (let i = props.sequence.startLine; i < props.sequence.endLine; i++) {
        const tokens = lines[i].split('\t');
        tokens.forEach((_, tokenIndex) => {
            const resolvedLineIndex = getResolvedTokenLineIndex(i, tokenIndex, lines);
            lines[resolvedLineIndex] = lines[resolvedLineIndex].split('\t').map((token, ti) => {
                if (ti === tokenIndex &&/^[\[\(]?\d+/.test(token)) {
                    return `${token}@`;
                }
                return token;
            }).join('\t');
        });
    }
    lines.push('!!!filter: deg -k 1 --circle');
    lines.push('!!!filter: fb -cnl --above');
    lines.push('!!!filter: extract -I text');
    lines.push('!!!filter: extract -I dynam');
    lines.push('!!!filter: autobeam');
    lines.push('!!!filter: satb2gs');
    lines.push('!!!RDF**kern: @ = marked note color="#ef4444');
    modalScoreData.value = lines.join('\n');
    openModal.value = true;
}

function closeModal() {
    openModal.value = false;
    modalScoreData.value = null;
}

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
</script>

<template>
    <UCard>
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
        <div class="flex flex-wrap gap-2 mb-4">
            <UBadge v-for="label in sequence.labels">{{ label }}</UBadge>
        </div>
        <VerovioCanvas
            v-if="formattedData"
            :data="formattedData"
            view-mode="horizontal"
            lazy
            unload
            :lazy-delay="100"
            :options="{
                mnumInterval: 1,
                pageMarginLeft: 30,
                pageMarginRight: 30,
                pageMarginTop: 10,
                pageMarginBottom: 10,
            }"
        />
        <UButton v-if="piece.id" @click="loadScoreData(index)" class="mt-4">
            {{ $t('showInScore') }}
            <Modal v-if="openModal" @close="closeModal" :title="piece.title">
                <MidiPlayer :url="`/kern/mendelssohn-choral-works/${piece.id}.krn`" class="text-2xl" />
                <VerovioCanvas v-if="modalScoreData"  :data="modalScoreData" :scale="35" :page-margin="50" :key="modalScoreData" />
            </Modal>
        </UButton>
    </UCard>
</template>
