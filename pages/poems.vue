<script setup>
const { data: poems } = await useAsyncData('poems', () => queryContent('/poems/').sort({
    author: 1,
    book: 1,
    title: 1,
}).find());

const poemsGroupedByAuthor = computed(() => {
    return Object.entries(poems.value.reduce((accumulator, obj) => {
		const key = obj.book.toLowerCase().includes('des knaben wunderhorn') ? 'Des Knaben Wunderhorn' : obj.author;
		if (!accumulator[key]) {
			accumulator[key] = [];
		}
		accumulator[key].push(obj);
		return accumulator;
	}, {}));
});

const selectedPoem = ref();
</script>

<template>
    <UContainer>
        <Heading>{{ $t('poems') }}</Heading>
        <NuxtLink href="https://www.projekt-gutenberg.org/arnim/wh1/wh1.html">https://www.projekt-gutenberg.org/arnim/wh1/wh1.html</NuxtLink>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <div v-for="group in poemsGroupedByAuthor">
                    <Subheading>{{ group[0] }}</Subheading>
                    <ul>
                        <li v-for="poem in group[1]">
                            <NuxtLink @click="selectedPoem = poem" class="cursor-pointer">
                                {{ poem.title }}
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>
            <div>
                <UCard v-if="selectedPoem">
                    <Poem :poem="selectedPoem" />
                </UCard>
            </div>
        </div>

    </UContainer>
</template>
