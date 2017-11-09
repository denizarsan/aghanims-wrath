<template>
  <div class="hero-grid">
    <div class="hero"
         :class="{ 'is-selected': isHeroSelected(hero) }"
         v-for="hero in heroes"
         v-show="isHeroFiltered(hero)"
         @click="onHeroClick(hero)">
      <img :src="getImgSrc(hero)"/>
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
    getImgSrc(hero) {
      return `/static/images/${hero.slug}_icon.png`;
    },
  },
};
</script>

<style scoped>
.hero-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.hero {
  padding: 0.5rem;
  filter: grayscale(100%);
}

.hero.is-selected {
  filter: drop-shadow(0 0 0.25em #209CEE);
}
</style>
