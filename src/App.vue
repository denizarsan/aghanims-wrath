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
        <h1 class="title has-text-centered">First, select heroes available in your draft</h1>
        <div class="field">
          <div class="control has-icons-left">
            <input class="input is-info" type="text" placeholder="Search..." v-model="query">
            <span class="icon is-left">
              <i class="fa fa-search"></i>
            </span>
          </div>
        </div>

        <hero-grid :heroes="heroes"
                   :query="query"
                   :selected-heroes="selectedHeroes"
                   @hero-selected="onHeroSelected"
                   @hero-unselected="onHeroUnselected">
        </hero-grid>

        <div class="control has-addons has-text-centered" v-if="abilities.length" @click="onResetClick">
          <a class="button is-info">
            <span class="icon">
              <i class="fa fa-refresh"></i>
            </span>
            <span>Reset</span>
          </a>
        </div>

        <div class="upgrades" v-if="aghsUpgrades.length">
          <h1 class="title has-text-centered">Next, see skills upgradable by Aghanim's Scepter</h1>
          <ability-list :abilities="aghsUpgrades"></ability-list>
        </div>
      </section>
    </div>

    <section class="section">
      <div class="container">
        <div class="content has-text-centered">
          <strong>Aghanim's Wrath</strong> by <a href="https://twitter.com/denizarsan">Deniz Arsan</a>.
          <br>
          Design partially inspired from <a href="https://howdoiplay.com">Tsunami's Dota Hero Tips and Counters</a>.
          <br>
          <a href="http://www.dota2.com">Dota 2</a> is a registered trademark of <a href="http://www.valvesoftware.com/">Valve Corporation</a>.
          <br>
          <a class="icon is-large" href="https://github.com/denizarsan/aghanims-wrath">
            <i class="fa fa-github fa-2x"></i>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Abilities from './assets/abilities.json';
import Heroes from './assets/heroes.json';
import HeroAbilities from './assets/hero_abilities.json';

import AbilityList from './components/AbilityList';
import HeroGrid from './components/HeroGrid';

// List of unavailable heroes in ability draft
const unavailableHeroes = [
  'Beastmaster', 'Chen', 'Doom', 'Earth Spirit', 'Ember Spirit',
  'Invoker', 'Io', 'Keeper of the Light', 'Lone Druid', 'Meepo',
  'Monkey King', 'Morphling', 'Ogre Magi', 'Phoenix', 'Puck',
  'Rubick', 'Shadow Fiend', 'Shadow Demon', 'Spectre', 'Techies',
  'Templar Assassin', 'Timbersaw', 'Troll Warlord', 'Tusk', 'Vengeful Spirit',
];

// Comparators for sorting
const heroComparator = (a, b) => {
  if (a.name > b.name) { return 1; }
  if (a.name < b.name) { return -1; }
  return 0;
};

const abilityComparator = (a, b) => {
  if (a.hero > b.hero) { return 1; }
  if (a.hero < b.hero) { return -1; }
  return 0;
};


// Initialize everything
const everything = {};

Object.keys(Heroes).forEach((key) => {
  if (!unavailableHeroes.includes(Heroes[key].name)) {
    everything[key] = Object.assign(Heroes[key], HeroAbilities[key]);
    everything[key].abilities = everything[key].abilities.map(ability =>
      Object.assign(Abilities[ability], { hero: Heroes[key].name }));
  }
});

export default {
  name: 'app',
  components: { AbilityList, HeroGrid },
  data() {
    return {
      abilities: [],
      aghsUpgrades: [],
      heroes: Object.values(everything).sort(heroComparator),
      selectedHeroes: [],
      query: '',
    };
  },
  methods: {
    onResetClick() {
      // Reset everything
      this.abilities = [];
      this.aghsUpgrades = [];
      this.selectedHeroes = [];
      this.query = '';
    },
    onHeroSelected(hero) {
      // Add new abilities to the list of all abilities
      this.abilities = [...this.abilities, ...everything[hero.slug].abilities];

      // Remove duplicates
      this.abilities = [...new Set(this.abilities)];

      // Sort the list of all abilities alphabetically by hero name
      this.abilities.sort(abilityComparator);

      // Update the list of abilities upgradable by Aghanim's Scepter
      this.aghsUpgrades = this.abilities.filter(ability => ability.description.includes('Aghanim\'s Scepter'));

      // Add hero to selected heroes
      this.selectedHeroes.push(hero);

      // Clear the search query
      this.query = '';
    },
    onHeroUnselected(hero) {
      // Remove abilities of the hero from the list of all abilities
      this.abilities = this.abilities.filter(ability => ability.hero !== hero.name);

      // Remove abilities of the hero from the list of abilities upgradable by Aghanim's Scepter
      this.aghsUpgrades = this.aghsUpgrades.filter(ability => ability.hero !== hero.name);

      // Remove hero from the list of selected heroes
      this.selectedHeroes.splice(this.selectedHeroes.indexOf(hero), 1);
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
</style>
