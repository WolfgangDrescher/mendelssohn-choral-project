<script setup>
const localePath = useLocalePath();
</script>

<template>
    <header class="bg-primary-500 text-white bg-pattern">
        <div class="flex justify-between items-center py-2 px-4 gap-4">
            <img src="/mhfr-logo-white.svg" class="hidden md:block max-h-[50px] mx-auto" alt="Hochschule für Musik Freiburg" />
            <div class="grow flex items-center gap-4">
                <div class="font-extrabold text-lg md:text-2xl">
                    <NuxtLink :to="localePath('/')">
                        Mendelssohn Choral Project
                    </NuxtLink>
                </div>
            </div>
            <div class="flex justify-end items-center">
                Deutsch
            </div>
        </div>
    </header>
</template>
