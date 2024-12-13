<template>
    <div>
        <i18n-t keypath="hintDescription" tag="div">
            <template #P><UKbd>P</UKbd></template>
            <template #M><UKbd>M</UKbd></template>
            <template #m><UKbd>m</UKbd></template>
            <template #A><UKbd>A</UKbd></template>
            <template #d><UKbd>d</UKbd></template>
        </i18n-t>
        <i18n-t keypath="moreDetailsOnUrl" tag="div" class="text-sm mt-4">
            <template #url>
                <NuxtLink to="https://www.humdrum.org/Humdrum/commands/hint.html" target="_blank">
                    https://www.humdrum.org/Humdrum/commands/hint.html
                </NuxtLink>
            </template>
        </i18n-t>
    </div>
</template>
