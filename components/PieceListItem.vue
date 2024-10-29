<script setup>
const localePath = useLocalePath();

const props = defineProps({
    piece: {
        type: Object,
        required: true,
    },
    filters: Array,
});

const data = ref(null);

onMounted(async () => {
    const response = await fetch(props.piece.localRawFile);
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
    data.value = await response.text();
});

const formattedData = computed(() => {
    return data.value ? `${data.value}
${(props.filters ?? []).map(filter => `!!!filter: ${filter}`).join('\n')}` : null;
});
</script>

<template>
    <UCard>
        <template v-slot:header>
            <div class="text-xl font-medium leading-5">
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
            </div>
        </template>
        <div class="mt-4">
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
        </div>
    </UCard>
</template>
