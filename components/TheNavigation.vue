<script setup>
const links = [
    {
        label: 'Startseite',
        to: '/',
    },
];
</script>

<template>
    <UHorizontalNavigation :links="links" class="border-b border-gray-200 dark:border-gray-800 px-2" />
</template>
