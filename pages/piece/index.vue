<script setup>
const { data } = await useAsyncData('pieces', () => queryContent('/pieces').find())
</script>

<template>
    <UContainer>
        <div class="flex flex-col gap-8">
            <Heading>Stücke</Heading>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div v-for="piece in data" :key="piece.id">
                    <PieceListItem :piece="piece" :filters="['extract -I **text | extract -I **dynam',]"/>
                </div>
            </div>
        </div>
    </UContainer>
</template>
