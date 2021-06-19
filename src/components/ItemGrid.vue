<template>
  <div class="item-grid">
    <div
      v-for="item in items"
      v-show="isFiltered(item)"
      :key="item.id"
      class="item"
      :class="{'is-selected': isSelected(item) }"
      @click="onClick(item)"
    >
      <img
        class="item-img"
        :src="item.src"
      >
    </div>
  </div>
</template>

<script>
export default {
  name: 'ItemGrid',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    selected: {
      type: Array,
      default: () => []
    },
    query: {
      type: String,
      default: ''
    }
  },
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
@import '~bulma/sass/utilities/derived-variables.sass';

$item-width: 128px;

.item-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: $size-large;
}

.item {
  filter: grayscale(100%);
  display: flex;
  align-items: center;
  padding: $size-small / 3;

  &.is-selected {
    filter: grayscale(0%);
  }
}

.item-img {
  width: $item-width;
}
</style>
