<script setup>
defineProps({
    poem: Object,
});
</script>

<template>
    <div>
        <div v-if="poem.author">{{ poem.author }}</div>
        <div v-if="poem.book">{{ poem.book }}</div>
        <div class="font-serif ml-8">
            <Subheading>{{ poem.title }}</Subheading>
            <div v-for="item in poem.content">
                <p v-if="item.type === 'strophe'" class="my-6">
                    <div v-for="verse in item.verses" v-text="verse"></div>
                </p>
                <h3 v-if="item.type === 'heading'" v-text="item.text" class="font-bold text-lg mt-8"></h3>
            </div>
        </div>
        <NuxtLink :to="poem.url" v-text="poem.url" target="_blank" />
        <div v-if="poem.copyright" class="text-sm mt-8" v-text="poem.copyright"></div>
    </div>
</template>
