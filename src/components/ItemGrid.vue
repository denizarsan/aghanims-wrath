<template>
  <div class="itemGrid">
    <div :class="{ 'item': !wide, 'item--wide': wide, 'is-selected': isSelected(item) }"
         v-for="item in items"
         :key="item.hero"
         v-show="isFiltered(item)"
         @click="onClick(item)">
      <img :src="item.src"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'item-grid',
  props: ['items', 'selected', 'query', 'wide'],
  methods: {
    isFiltered(item) {
      return item.name.toLowerCase().includes(this.query.toLowerCase());
    },
    isSelected(item) {
      return this.selected.includes(item.hero);
    },
    onClick(item) {
      this.$emit(this.selected.indexOf(item.hero) > -1 ? 'item-unselected' : 'item-selected', item);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~bulma/sass/utilities/initial-variables.sass';
// @import '~bulma/sass/utilities/derived-variables.sass';

$item-spacing: 0.5rem;
$item-spacing-sm: $item-spacing / 2;
$item-spacing-lg: $item-spacing * 3;

.itemGrid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: $item-spacing-lg;

}

.item {
  filter: grayscale(100%);
  display: flex;
  align-items: center;
  padding: $item-spacing-sm;

  &.is-selected {
    filter: grayscale(0%);
  }
}

.item--wide {
  @extend .item;
  padding: $item-spacing;

  &.is-selected {
    filter: drop-shadow(0 0 $item-spacing-sm $cyan);
  }
}
</style>
