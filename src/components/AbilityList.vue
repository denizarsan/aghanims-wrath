<template>
  <div class="ability-list columns">
    <div class="list column"  v-if="getRegulars().length">
      <h4 class="subtitle is-4">Regular Abilities</h4>
      <article class="media" v-for="ability in getRegulars()">
        <figure class="media-left">
          <p class="image is-64x64">
            <img :src="getImgSrc(ability)">
          </p>
        </figure>
        <div class="media-content">
          <div class="content">
            <p>
              <span class="ability-name">{{ ability.name }}</span>
              <br>
              <span class="ability-aghs">{{ ability.aghs }}</span>
            </p>
          </div>
        </div>
      </article>
    </div>
    <div class="list column" v-if="getUltimates().length">
      <h4 class="subtitle is-4">Ultimate Abilities</h4>
      <article class="media" v-for="ability in getUltimates()">
        <figure class="media-left">
          <p class="image is-64x64">
            <img :src="getImgSrc(ability)">
          </p>
        </figure>
        <div class="media-content">
          <div class="content">
            <p>
              <span class="ability-name">{{ ability.name }}</span>
              <br>
              <span class="ability-aghs">{{ ability.aghs }}</span>
            </p>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ability-list',
  props: ['abilities'],
  methods: {
    getUltimates() {
      return this.abilities.filter(ability => ability.isUltimate);
    },
    getRegulars() {
      return this.abilities.filter(ability => !ability.isUltimate);
    },
    getImgSrc(ability) {
      return `/static/images/${ability.slug}_md.png`;
    },
  },
};
</script>

<style scoped>
.ability-name {
  font-weight: bold;
}
</style>
