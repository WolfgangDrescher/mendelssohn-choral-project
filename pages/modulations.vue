<script setup>
const { data } = await useAsyncData('pieces', () => queryContent('/pieces').find());
const { data: modulationsData } = await useAsyncData(`modulations`, () => queryContent(`/modulations`).findOne());
const { data: sequencesData } = await useAsyncData(`sequencesData`, () => queryContent(`/sequences-data`).findOne());
const localePath = useLocalePath();

const options = reactive({
    showKeys: false,
    hideSequences: false,
});
</script>

<template>
    <UContainer>
        <Heading>{{ $t('modulations') }}</Heading>

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
    </UContainer>
</template>
