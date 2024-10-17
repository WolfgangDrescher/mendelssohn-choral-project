<script setup>
const localePath = useLocalePath();
const links = [
    {
        label: 'Übersicht',
        to: localePath({name: 'analysis'}),
    },
    {
        label: '4 7 9',
        to: localePath({name: 'analysis-479'}),
    },
    {
        label: '⑤ 2 4 6',
        to: localePath({name: 'analysis-deg5-246'}),
    },
    {
        label: '④ down',
        to: localePath({name: 'analysis-deg4-down'}),
    },
    {
        label: '③ 6 9',
        to: localePath({name: 'analysis-deg3-69'}),
    },
    {
        label: '⑤ m6',
        to: localePath({name: 'analysis-deg5-m6'}),
    },
    {
        label: '⑤ 4 5 7',
        to: localePath({name: 'analysis-deg5-457'}),
    },
    {
        label: '④ 7',
        to: localePath({name: 'analysis-deg4-7'}),
    },
];
</script>

<template>
    <UVerticalNavigation :links="links" />
</template>

