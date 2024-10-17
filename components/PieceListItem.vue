<script setup>
const localePath = useLocalePath();

const props = defineProps({
    piece: {
        type: Object,
        required: true,
    },
});

const data = ref(null);

onMounted(async () => {
    const response = await fetch(props.piece.localRawFile);
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
    data.value = await response.text();
});
</script>

<template>
    <UCard>
        <template v-slot:header>
            <div class="text-xl font-medium leading-5">
                <NuxtLink :to="localePath({ name: 'piece-id', params: { id: piece.id } })">
                    {{ `${piece.nr}. ${piece.title}` }}
                </NuxtLink>
            </div>
        </template>
        <div class="mt-4">
            <VerovioCanvas
                v-if="data"
                :data="data"
                view-mode="horizontal"
                lazy
                unload
                :lazy-delay="100"
                :options="{mnumInterval: 1}"
            />
        </div>
    </UCard>
</template>
