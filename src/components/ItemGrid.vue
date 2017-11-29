<template>
  <transition-group class="itemGrid" name="list" tag="div">
    <div class="list"
         :class="{ 'wide': wide, 'is-selected': isSelected(item) }"
         v-for="(item, index) in items"
         :key="item.hero"
         v-show="isFiltered(item)"
         @click="onClick(item)">
        <img :src="item.src" width="40" height="40" v-show="isHeroMode"/>
        <img :src="item.src" v-show="isUltimateMode"/>
    </div>
  </transition-group>
</template>

<script>
export default {
  name: 'item-grid',
  props: ['items', 'selected', 'query', 'wide', 'mode'],
  computed: {
    isHeroMode() {
      return this.mode === 'hero';
    },
    isUltimateMode() {
      return this.mode === 'ultimate';
    },
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

.itemGrid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: $size-large;

}

.list {
  display: flex;
  align-items: center;
  justify-content: center;
  filter: grayscale(100%);
  height: 70px;
  width: 70px;
  padding: $size-small / 3;
  cursor: pointer;
  transition: transform .6s, opacity .6s, filter .6s;
  will-change: transform, opacity;

  &:hover {
    filter: grayscale(50%);
  }

  &.is-selected {
    filter: grayscale(0%);
  }
}

.wide {
  &:hover {
    filter: grayscale(50%) drop-shadow(0 0 $size-small rgba($cyan, 0.5));
  }

  &.is-selected {
    filter:  grayscale(0%) drop-shadow(0 0 $size-small $cyan);
  }
}


.list-move {
  transition: transform 1s;
}

.list-enter {
  transition: opacity 1s;
}

.list-enter, .list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
