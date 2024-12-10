<script setup>
const props = defineProps({
    modulations: {
        type: Array,
        required: true,
    },
    sequences: {
        type: Array,
        required: false,
    },
    showKeys: Boolean,
    hideSequences: Boolean,
});

const modulationsGroupedByKey = computed(() => {
    return Object.entries(props.modulations.reduce((groups, item) => {
		const key = props.showKeys ? item.key : item.deg;
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
        <div v-if="!hideSequences && sequences?.length" class="h-[1.5rem] relative">
            <div v-for="sequence in sequences" class="absolute h-full" :style="{
                width: `${getWidth(sequence.startBeat, sequence.endBeat)}%`,
                left: `${getLeft(sequence.startBeat)}%`,
            }">
                <UTooltip :text="sequence.labels.join(', ')" :popper="{ placement: 'top' }" class="w-full h-full bg-gray-400 rounded px-2 flex items-center">
                    <div class="text-ellipsis overflow-hidden text-nowrap">
                        {{ sequence.labels[0] }}
                    </div>
                </UTooltip>
            </div>
        </div>
        <div v-for="group in modulationsGroupedByKey" class="h-[1.5rem] relative">
            <div v-for="segment in group[1]" class="absolute h-full" :style="{
                width: `${getWidth(segment.startBeat, segment.endBeat)}%`,
                left: `${getLeft(segment.startBeat)}%`,
            }">
                <div class="w-full h-full bg-gray-200 rounded px-2 flex items-center">
                    {{ group[0] }}
                </div>
            </div>
        </div>
    </div>
</template>
