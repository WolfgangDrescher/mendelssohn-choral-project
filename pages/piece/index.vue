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
        title: item.title,
        localRawFile: item.localRawFile,
    };
});

const columns = [
    { key: 'audio' },
    { key: 'opnr', label: t('opNr'), sortable: true },
    { key: 'title', label: t('title'), sortable: true },
    { key: 'key', label: t('key'), sortable: true },
    { key: 'majorMinor', label: t('majorMinor'), sortable: true },
    { key: 'meter', label: t('meter'), sortable: true },
    { key: 'actions' },
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
                        <template #audio-data="{ row }">
                            <MidiPlayer :url="row.localRawFile" class="text-2xl"/>
                        </template>
                        <template #title-data="{ row }">
                            <NuxtLink :to="localePath({ name: 'piece-id', params: { id: row.id } })">
                                {{ row.title }}
                            </NuxtLink>
                        </template>
                        <template #actions-data="{ row }">
                            <div class="flex gap-1 justify-end">
                                <UButton size="sm" color="primary" variant="solid" :label="t('vhv')" :to="`https://verovio.humdrum.org/?file=${encodeURIComponent(`https://github.com/WolfgangDrescher/mendelssohn-choral-works/blob/master/kern/${row.id}.krn`)}`" target="_blank" />
                                <UButton size="sm" color="primary" variant="solid" :label="t('view')" :to="localePath({ name: 'piece-id', params: { id: row.id } })" />
                            </div>
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
