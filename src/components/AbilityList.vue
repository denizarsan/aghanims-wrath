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
            <strong>{{ ability.hero }}</strong> - <strong>{{ ability.name }}</strong>
            <br>
            {{ ability.aghs }}
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
