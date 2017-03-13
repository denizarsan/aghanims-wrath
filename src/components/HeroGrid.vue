<template>
  <div class="hero-grid columns is-gapless is-multiline">
    <div class="hero column is-1"
         :class="{ 'is-selected': isHeroSelected(hero) }"
         v-for="hero in heroes"
         v-show="isHeroFiltered(hero)"
         @click="onHeroClick(hero)">
      <figure class="image">
        <img :src="hero.img"/>
      </figure>
    </div>
  </div>
</template>

<script>
export default {
  name: 'hero-grid',
  props: ['heroes', 'selectedHeroes', 'query'],
  methods: {
    isHeroFiltered(hero) {
      return hero.name.toLowerCase().includes(this.query.toLowerCase());
    },
    isHeroSelected(hero) {
      return this.selectedHeroes.includes(hero);
    },
    onHeroClick(hero) {
      this.$emit(this.selectedHeroes.indexOf(hero) > -1 ? 'hero-unselected' : 'hero-selected', hero);
    },
  },
};
</script>

<style scoped>
.hero {
  filter: grayscale(100%);
}
.hero.is-selected {
  filter: grayscale(0%);
}
</style>
