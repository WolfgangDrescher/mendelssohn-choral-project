<script setup>
const { data } = await useAsyncData(`analysis`, () => queryContent(`/analysis`).findOne());
const items = data.value['deg6-35'];
</script>

<template>
    <UContainer>
        <SidebarContent>
            <template v-slot:aside>
                <AnalysisNavigation></AnalysisNavigation>
            </template>
            <Heading>deg6-35</Heading>
            <div class="grid grid-cols-2 gap-4">
                <div v-for="item in items">
                    <PieceIdListItem :id="item.id" :filters="[
                        'extract -I **text | extract -I **dynam',
                        `myank -l ${item.myankLines}`,
                        'deg --k 1 --circle',
                        'satb2gs',
                        'fb -canr --above',
                    ]"/>
                </div>
            </div>
        </SidebarContent>
    </UContainer>
</template>
