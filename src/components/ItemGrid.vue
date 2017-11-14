<template>
  <div class="item-grid">
    <div class="item"
         :class="{ 'is-selected': isSelected(item), 'has-more-padding': moreSpace }"
         v-for="item in items"
         v-show="isFiltered(item)"
         @click="onClick(item)">
      <img :src="item.src"/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'item-grid',
  props: ['items', 'selected', 'query', 'moreSpace'],
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

<style scoped>
.item-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.item {
  filter: grayscale(100%);
  display: flex;
  align-items: center;
  padding: 0.25rem;
}

.item.is-selected {
  filter: grayscale(0%);
}

.item.has-more-padding {
  padding: 0.5rem;
}

.item.has-more-padding.is-selected {
  filter: drop-shadow(0 0 0.25em #209CEE);
}
</style>
