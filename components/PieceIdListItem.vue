<script setup>
const props = defineProps({
    id: String, 
});
const { data: piece } = await useAsyncData(`pieces/${props.id}`, () => queryContent(`/pieces/${props.id}`).findOne());
</script>

<template>
    <PieceListItem :piece/>
</template>
