<script setup>
const localePath = useLocalePath();
const { params: { id } } = useRoute();
const { data: piece } = await useAsyncData(`pieces/${id}`, () => queryContent(`/pieces/${id}`).findOne());
const { data: surroundData } = await useAsyncData(`pieces/${id}/surround`, () => queryContent('/pieces').only(['_path', 'id', 'nr']).findSurround(piece.value._path))
const [prevPiece, nextPiece] = surroundData.value;

const score = ref();

onMounted(async () => {
    const response = await fetch(piece.value.localRawFile);
    const kern = await response.text();
    score.value = kern;
});
</script>

<template>
    <UContainer>
        <div class="flex flex-col gap-8">

            <div>
                <Heading>
                    {{ `${piece.nr}. ${piece.title}` }}
                    <div class="text-base font-normal">
                        {{ piece.composer }}, Op. {{ piece.op }} Nr. {{ piece.nr }}
                    </div>
                </Heading>
                <div class="flex gap-2 items-center">
                    <div v-if="prevPiece">
                        <UButton :to="localePath({ name: 'piece-id', params: { id: prevPiece.id }, hash: $route.hash })">
                            <Icon name="heroicons:arrow-left-circle" class="text-xl" />
                            Vorheriges
                        </UButton>
                    </div>
                    <div v-if="nextPiece">
                        <UButton :to="localePath({ name: 'piece-id', params: { id: nextPiece.id }, hash: $route.hash })">
                            Nächstes
                            <Icon name="heroicons:arrow-right-circle" class="text-xl" />
                        </UButton>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex gap-2 ml-auto">
                    <UButton :to="`https://github.com/WolfgangDrescher/mendelssohn-choral-works/blob/master/kern/${piece.id}.krn`" target="_blank">
                        Auf GitHub öffnen
                    </UButton>
                    <UButton :to="`https://verovio.humdrum.org/?file=${encodeURIComponent(`https://github.com/WolfgangDrescher/mendelssohn-choral-works/blob/master/kern/${piece.id}.krn`)}`" target="_blank">
                        Im VHV öffnen
                    </UButton>
                </div>
            </div>

            <VerovioCanvas
                v-if="score"
                :data="score"
                :options="{
                    spacingSystem: 15,
                    pageMarginLeft: 30,
                    pageMarginRight: 30,
                    pageMarginTop: 10,
                    pageMarginBottom: 10,
                }"
            />

        </div>
    </UContainer>
</template>
