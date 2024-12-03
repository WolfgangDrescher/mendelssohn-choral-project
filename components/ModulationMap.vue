<script setup>
const props = defineProps({
    modulations: {
        type: Array,
        required: true,
    },
});

const groupedByKey = computed(() => {
    return Object.entries(props.modulations.reduce((groups, item) => {
		const key = item.key;
		if (!groups[key]) {
			groups[key] = [];
		}
		groups[key].push(item);
		return groups;
	}, {}));
});

const maxBeat = props.modulations[props.modulations.length - 1].endBeat;

function getWidth(startBeat, endBeat) {
    return (endBeat - startBeat) / maxBeat * 100;
}
function getLeft(startBeat) {
    return startBeat / maxBeat * 100;
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <div v-for="group in groupedByKey" class="h-[1.5rem] relative">
            <div v-for="segment in group[1]" class="absolute h-full bg-gray-200 rounded px-2 flex items-center" :style="{
                width: `${getWidth(segment.startBeat, segment.endBeat)}%`,
                left: `${getLeft(segment.startBeat)}%`,
            }">
                {{ group[0] }}
            </div>
        </div>
    </div>
</template>
