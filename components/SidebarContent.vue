<template>
    <div class="flex gap-6">
        <div class="grow-0 shrink-0 basis-1/4">
            <slot name="aside"></slot>
        </div>
        <div>
            <slot></slot>
        </div>
    </div>
</template>
