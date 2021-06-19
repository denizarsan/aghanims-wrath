<template>
  <div class="upgrade-list my-5">
    <h1 class="title has-text-centered is-1">
      Aghanim's Upgrades
    </h1>
    <div class="columns">
      <div class="column">
        <article class="media is-align-items-center mb-3">
          <figure class="media-left">
            <p class="image">
              <img src="../assets/aghanims_scepter.png">
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <h1 class="title is-2 mb-0">
                Scepter
              </h1>
            </div>
          </div>
        </article>
        <div v-if="upgrades.scepter.upgrades.length > 0">
          <h5 class="subtitle is-4 mb-4">
            Upgraded Abilities:
          </h5>
          <div
            v-for="upgrade in upgrades.scepter.upgrades"
            :key="upgrade.id"
            class="card mb-2"
          >
            <div class="card-content">
              <div class="media">
                <div class="media-left">
                  <figure class="image">
                    <img :src="upgrade.src">
                  </figure>
                </div>
                <div class="media-content">
                  <p class="title is-4">
                    {{ upgrade.name }}
                  </p>
                  <p class="subtitle is-6">
                    {{ upgrade.scepter.desc }}
                  </p>
                  <div
                    v-if="upgrade.scepter.requires.length > 0"
                    class="is-flex is-align-items-center"
                  >
                    Requires:
                    <img
                      v-for="ability in upgrade.scepter.requires"
                      :key="ability"
                      class="image is-32x32 ml-2"
                      :src="`/images/${ability}.png`"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="upgrades.scepter.abilities.length > 0">
          <h5 class="subtitle is-4 my-4">
            Granted Abilities:
          </h5>
          <div
            v-for="upgrade in upgrades.scepter.abilities"
            :key="upgrade.id"
            class="card mb-2"
          >
            <div class="card-content">
              <div class="media">
                <div class="media-left">
                  <figure class="image">
                    <img :src="upgrade.src">
                  </figure>
                </div>
                <div class="media-content">
                  <p class="title is-4">
                    {{ upgrade.name }}
                  </p>
                  <p class="subtitle is-6">
                    {{ upgrade.desc }}
                  </p>
                  <div
                    v-if="upgrade.scepter.requires.length > 0"
                    class="is-flex is-align-items-center"
                  >
                    Requires:
                    <img
                      v-for="ability in upgrade.scepter.requires"
                      :key="ability"
                      class="image is-32x32 ml-2"
                      :src="`/images/${ability}.png`"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="column">
        <article class="media is-align-items-center mb-3">
          <figure class="media-left">
            <p class="image">
              <img src="../assets/aghanims_shard.png">
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <h1 class="title is-2 mb-0">
                Shard
              </h1>
            </div>
          </div>
        </article>
        <div v-if="upgrades.shard.upgrades.length > 0">
          <h5 class="subtitle is-4 mb-4">
            Upgraded Abilities:
          </h5>
          <div
            v-for="upgrade in upgrades.shard.upgrades"
            :key="upgrade.id"
            class="card mb-2"
          >
            <div class="card-content">
              <div class="media">
                <div class="media-left">
                  <figure class="image">
                    <img :src="upgrade.src">
                  </figure>
                </div>
                <div class="media-content">
                  <p class="title is-4">
                    {{ upgrade.name }}
                  </p>
                  <p class="subtitle is-6">
                    {{ upgrade.shard.desc }}
                  </p>
                  <div
                    v-if="upgrade.shard.requires.length > 0"
                    class="is-flex is-align-items-center"
                  >
                    Requires:
                    <img
                      v-for="ability in upgrade.shard.requires"
                      :key="ability"
                      class="image is-32x32 ml-2"
                      :src="`/images/${ability}.png`"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="upgrades.shard.abilities.length > 0">
          <h5 class="subtitle is-4 my-4">
            Granted Abilities:
          </h5>
          <div
            v-for="upgrade in upgrades.shard.abilities"
            :key="upgrade.id"
            class="card mb-2"
          >
            <div class="card-content">
              <div class="media">
                <div class="media-left">
                  <figure class="image">
                    <img :src="upgrade.src">
                  </figure>
                </div>
                <div class="media-content">
                  <p class="title is-4">
                    {{ upgrade.name }}
                  </p>
                  <p class="subtitle is-6">
                    {{ upgrade.desc }}
                  </p>
                  <div
                    v-if="upgrade.shard.requires.length > 0"
                    class="is-flex is-align-items-center"
                  >
                    Requires:
                    <img
                      v-for="ability in upgrade.shard.requires"
                      :key="ability"
                      class="image is-32x32 ml-2"
                      :src="`/images/${ability}.png`"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UpgradeList',
  props: {
    upgrades: {
      type: Object,
      default: () => ({
        scepter: {
          upgrades: [],
          abilities: []
        },
        shard: {
          upgrades: [],
          abilities: []
        }
      })
    }
  },
};
</script>
