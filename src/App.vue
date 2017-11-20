<template>
  <div id="app">
    <section class="hero is-info">
      <div class="hero-body">
        <div class="container has-text-centered">
          <h1 class="title">
            Aghanim's Wrath
          </h1>
          <h2 class="subtitle">
            Unleash it on your foes in Ability Draft!
          </h2>
        </div>
      </div>
    </section>

    <div class="container">
      <section class="section">
        <h1 class="title has-text-centered">
          First, select
          <span class="mode"
            :class="{ 'has-text-info': isActive('hero'), 'has-text-grey-light': !isActive('hero') }"
            @click="selectMode('hero')">
            heroes
          </span>
          /
          <span class="mode"
            :class="{ 'has-text-info': isActive('ultimate'), 'has-text-grey-light': !isActive('ultimate') }"
            @click="selectMode('ultimate')">
            ultimates
          </span>
          available in your draft
        </h1>

        <div class="field">
          <div class="control has-icons-left">
            <input class="input is-info" type="text" placeholder="Search..." v-model="query">
            <span class="icon is-left">
              <i class="fa fa-search"></i>
            </span>
          </div>
        </div>

        <item-grid :items="heroes"
                   :selected="selected"
                   :query="query"
                   :more-space="true"
                   @item-selected="onItemSelected"
                   @item-unselected="onItemUnselected"
                   v-show="isActive('hero')">
        </item-grid>

        <item-grid :items="ultimates"
                   :selected="selected"
                   :query="query"
                   @item-selected="onItemSelected"
                   @item-unselected="onItemUnselected"
                   v-show="isActive('ultimate')">
        </item-grid>

        <div class="control has-addons has-text-centered" v-if="selected.length" @click="onResetClick">
          <a class="button is-info">
            <span class="icon">
              <i class="fa fa-refresh"></i>
            </span>
            <span>Reset</span>
          </a>
        </div>

        <div class="upgrades" v-if="abilities.length">
          <h1 class="title has-text-centered">Next, see skills upgradable by Aghanim's Scepter</h1>
          <ability-list :abilities="abilities"></ability-list>
        </div>
      </section>
    </div>

    <section class="section">
      <div class="container">
        <div class="content has-text-centered">
          <strong>Aghanim's Wrath</strong> by <a href="https://twitter.com/denizarsan">Deniz Arsan</a>.
          <br>
          Design inspired partially from <a href="https://howdoiplay.com">Tsunami's Dota Hero Tips and Counters</a>.
          <br>
          <a href="http://www.dota2.com">Dota 2</a> is a registered trademark of <a href="http://www.valvesoftware.com/">Valve Corporation</a>.
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Data from './assets/data.json';

import AbilityList from './components/AbilityList';
import ItemGrid from './components/ItemGrid';

// Comparators for sorting
const heroComparator = (a, b) => {
  if (a.name > b.name) { return 1; }
  if (a.name < b.name) { return -1; }
  return 0;
};

const abilityComparator = (a, b) => {
  if (a.heroName > b.heroName) { return 1; }
  if (a.heroName < b.heroName) { return -1; }
  return 0;
};

const heroes = Object.values(Data).sort(heroComparator);

const ultimates = Object.values(Data)
                    .map(hero => hero.abilities.filter(ability => ability.isUltimate))
                    .reduce((a, b) => a.concat(b)) // flatten
                    .sort(abilityComparator); // sort by hero name
export default {
  name: 'app',
  components: { AbilityList, ItemGrid },
  data() {
    return {
      abilities: [],
      heroes,
      ultimates,
      selected: [],
      query: '',
      mode: 'hero',
    };
  },
  methods: {
    selectMode(mode) {
      this.mode = mode;
    },
    isActive(mode) {
      return this.mode === mode;
    },
    onResetClick() {
      // Reset everything
      this.abilities = [];
      this.selected = [];
      this.query = '';
    },
    onItemSelected(item) {
      // Add new abilities to the list of all abilities
      this.abilities =
        [...this.abilities, ...Data[item.hero].abilities.filter(ability => ability.aghs)];

      // Remove duplicates
      this.abilities = [...new Set(this.abilities)];

      // Sort the list of all abilities alphabetically by hero name
      this.abilities.sort(abilityComparator);

      // Add hero to selected heroes
      this.selected.push(item.hero);

      // Clear the search query
      this.query = '';
    },
    onItemUnselected(item) {
      // Remove abilities of the hero from the list of all abilities
      this.abilities = this.abilities.filter(ability => ability.hero !== item.hero);

      // Remove hero from the list of selected heroes
      this.selected.splice(this.selected.indexOf(item.hero), 1);
    },
  },
};
</script>

<style scoped>
.field {
  width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.upgrades {
  margin-top: 3rem;
}

.mode {
  transition: 0.4s color;
  cursor: pointer;
}
</style>
