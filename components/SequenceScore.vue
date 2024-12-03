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
        // 'satb2gs',
    ];
    if (props.sequence.startLine && props.sequence.endLine) {
        filters.push(`myank -l ${props.sequence.startLine}-${props.sequence.endLine}`);
    }
    return data.value ? `${data.value}
${(filters ?? []).map(filter => `!!!filter: ${filter}`).join('\n')}` : null;
});
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
    </UCard>
</template>
