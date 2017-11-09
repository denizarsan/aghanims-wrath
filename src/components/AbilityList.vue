<template>
  <div class="ability-list">
    <article class="media" v-for="ability in abilities">
      <figure class="media-left">
        <p class="image is-64x64">
          <img :src="ability.img">
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <p>
            <span class="ability-name">{{ ability.name }}</span>
            <span class="ability-ultimate" v-if="ability.isUltimate">Ultimate</span>
            <br>
            <span class="ability-aghs">{{ ability.aghs }}</span>
          </p>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
export default {
  name: 'ability-list',
  props: ['abilities'],
};
</script>

<style scoped>
.ability-name {
  font-weight: bold;
}

.ability-ultimate {
  font-weight: bolder;
  text-transform: uppercase;
  color: #209CEE;
  padding: 0.5em;
}
</style>
