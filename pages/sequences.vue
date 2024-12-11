<script setup>
const { data: sequencesData } = await useAsyncData('sequences', () => queryContent('/sequences').findOne(), {
    deep: false,
});

const sequences = computed(() => {
    return sequencesData.value.sequences;
});

const uniqueSequences = [...new Set(sequences.value.flatMap(sequence => sequence.labels))].toSorted();

const filteredSequences = computed(() => {
    return sequences.value.filter(elem => {
        const filterLabel = (label) => {
            if (label === null || !label.length) return true;
            return elem.labels.includes(label);
        };
        return filterLabel(filters.label);
    });
});

const defaultFilters = {
    label: null,
};

const filters = reactive({
    ...defaultFilters,
});

function resetFilters() {
    Object.assign(filters, defaultFilters);
}
</script>

<template>
    <UContainer>
        <Heading>{{ $t('sequences') }}</Heading>
        <div class="flex gap-4 mb-4">
            <UFormGroup :label="$t('sequences')">
                <USelectMenu v-model="filters.label" :options="uniqueSequences" size="xs" class="w-40" />
            </UFormGroup>
            <UFormGroup label="&nbsp;">
                <UButton icon="i-heroicons-funnel" color="gray" size="xs" @click="resetFilters">
                    {{ $t('reset') }}
                </UButton>
            </UFormGroup>
        </div>
        <div class="my-4">
            {{ filteredSequences.length }} / {{ sequencesData.sequences.length }}
        </div>
        <div class="grid md:grid-cols-2 gap-4">
            <SequenceCard v-for="sequence in filteredSequences" :key="`${sequence.id}${sequence.startBeat}${sequence.startBeat}`" :sequence="sequence" />
        </div>
    </UContainer>
</template>
