<template>
  <div id="app">
    <section class="hero is-info">
      <div class="hero-body">
        <div class="container has-text-centered">
          <h1 class="title">
            Aghanim's Wrath
          </h1>
          <h5 class="subtitle">
            Unleash it on your foes in Ability Draft!
            <br>
            ({{ version }})
          </h5>
        </div>
      </div>
    </section>

    <div class="container">
      <section class="section">
        <h1 class="title has-text-centered">
          Select
          <span
            class="mode"
            :class="{ 'has-text-info': isActive('hero'), 'has-text-grey-light': !isActive('hero') }"
            @click="selectMode('hero')"
          >
            heroes
          </span>
          /
          <span
            class="mode"
            :class="{ 'has-text-info': isActive('ultimate'), 'has-text-grey-light': !isActive('ultimate') }"
            @click="selectMode('ultimate')"
          >
            ultimates
          </span>
          available in your draft
        </h1>

        <div class="field">
          <div class="control has-icons-left">
            <input
              v-model="query"
              class="input is-info"
              type="text"
              placeholder="Search..."
            >
            <span class="icon is-left">
              <i class="fa fa-search" />
            </span>
          </div>
        </div>

        <item-grid
          v-show="isActive('hero')"
          :items="heroes"
          :selected="selected"
          :query="query"
          @item-selected="onItemSelected"
          @item-unselected="onItemUnselected"
        />

        <item-grid
          v-show="isActive('ultimate')"
          :items="ultimates"
          :selected="selected"
          :query="query"
          @item-selected="onItemSelected"
          @item-unselected="onItemUnselected"
        />

        <div
          v-if="selected.length"
          class="control has-addons has-text-centered"
          @click="onResetClick"
        >
          <a class="button is-info">
            <span class="icon">
              <i class="fa fa-refresh" />
            </span>
            <span>Reset</span>
          </a>
        </div>

        <upgrade-list :upgrades="upgrades" />
      </section>
    </div>

    <section class="section">
      <div class="container">
        <div class="content has-text-centered">
          <strong>Aghanim's Wrath</strong> by <a href="https://github.com/denizarsan">Deniz Arsan</a>.
          <br>
          <a href="http://www.dota2.com">Dota 2</a> is a registered trademark of <a href="http://www.valvesoftware.com/">Valve Corporation</a>.
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Data from './assets/data.json';

import ItemGrid from './components/ItemGrid';
import UpgradeList from './components/UpgradeList.vue';

const VERSION = '7.29d';

export default {
  name: 'App',
  components: { ItemGrid, UpgradeList },
  data() {
    return {
      heroes: Data.heroes,
      ultimates: Data.abilities.ultimates,
      version: VERSION,
      selected: [],
      query: '',
      mode: 'hero',
    };
  },
  computed: {
    upgrades() {
      return {
        scepter: {
          upgrades: Data.abilities.scepter.upgrades.filter((u) => this.selected.includes(u.hero)),
          abilities: Data.abilities.scepter.abilities.filter((a) => this.selected.includes(a.hero)),
        },
        shard: {
          upgrades: Data.abilities.shard.upgrades.filter((u) => this.selected.includes(u.hero)),
          abilities: Data.abilities.shard.abilities.filter((a) => this.selected.includes(a.hero)),
        }
      }
    },
  },
  methods: {
    selectMode(mode) {
      this.mode = mode;
    },
    isActive(mode) {
      return this.mode === mode;
    },
    onResetClick() {
      this.selected = [];
      this.query = '';
    },
    onItemSelected(item) {
      this.selected.push(item.hero);
      this.query = '';
    },
    onItemUnselected(item) {
      this.selected.splice(this.selected.indexOf(item.hero), 1);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~bulma/sass/utilities/initial-variables.sass';
@import '~bulma/sass/utilities/derived-variables.sass';

$field-width: 300px;
$mode-transition-speed: .4s;

.field {
  width: $field-width;
  margin-left: auto;
  margin-right: auto;
}

.mode {
  transition: $mode-transition-speed color;
  cursor: pointer;
}
</style>
