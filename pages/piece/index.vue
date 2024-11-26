<script setup>
const { data } = await useAsyncData('pieces', () => queryContent('/pieces').find())

const { t } = useI18n();
const localePath = useLocalePath();

const pieces = data.value.map(item => {
    return {
        id: item.id,
        op: item.op,
        nr: item.nr,
        key: item.key,
        majorMinor: item.majorMinor,
        meter: item.meter,
        opnr: `${item.op} / ${item.nr}`,
        title: item.title
    };
});

const columns = [
    { key: 'opnr', label: t('opNr'), sortable: true },
    { key: 'title', label: t('title'), sortable: true },
    { key: 'key', label: t('key'), sortable: true },
    { key: 'majorMinor', label: t('majorMinor'), sortable: true },
    { key: 'meter', label: t('meter'), sortable: true },
];

const tabItems = [
    {
        slot: 'cards',
        label: t('scores'),
        icon: 'i-heroicons-view-columns',
    },
    {
        slot: 'table',
        label: t('table'),
        icon: 'i-heroicons-table-cells',
    },
];
</script>

<template>
    <UContainer>
        <div class="flex flex-col gap-8">
            <Heading>Stücke</Heading>
            <UTabs :items="tabItems">
                <template #table="{ item }">
                    <UTable :rows="pieces" :columns="columns" class="mt-8">
                        <template #title-data="{ row }">
                            <NuxtLink :to="localePath({ name: 'piece-id', params: { id: row.id } })">
                                {{ row.title }}
                            </NuxtLink>
                        </template>
                    </UTable>
                </template>
                <template #cards>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
                        <div v-for="piece in data" :key="piece.id">
                            <PieceListItem :piece="piece" :filters="[`extract -i '**kern'`, 'satb2gs', 'autobeam']"/>
                        </div>
                    </div>
                </template>
            </UTabs>
        </div>
    </UContainer>
</template>
