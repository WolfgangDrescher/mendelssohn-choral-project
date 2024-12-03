<script setup>
const { data } = await useAsyncData('pieces', () => queryContent('/pieces').find());
const localePath = useLocalePath();
</script>

<template>
    <UContainer>
        <Heading>{{ $t('modulations') }}</Heading>
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
                <ModulationMap :modulations="piece.modulations" />
            </UCard>
        </div>
    </UContainer>
</template>
