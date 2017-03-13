<template>
  <div id="app">
    <div class="container">
      <section class="section">
        <h3 class="title">First, choose available heroes:</h3>
        <div class="control is-grouped">
          <p class="control is-expanded has-icon">
            <input class="input is-medium" type="text" placeholder="Search..." v-model="query">
            <span class="icon">
              <i class="fa fa-search"></i>
            </span>
          </p>
          <p class="control has-addons" v-if="abilities.length" @click="onResetClick">
            <a class="button is-medium is-info">
              <span class="icon">
                <i class="fa fa-refresh"></i>
              </span>
              <span>Reset</span>
            </a>
          </p>
        </div>
        <hero-grid :heroes="heroes"
                   :query="query"
                   :selected-heroes="selectedHeroes"
                   @hero-selected="onHeroSelected"
                   @hero-unselected="onHeroUnselected">
        </hero-grid>
      </section>
      <section class="section" v-if="aghsUpgrades.length">
        <h3 class="title">Next, see skills upgradable by Aghanim's Scepter:</h3>
        <ability-list :abilities="aghsUpgrades"></ability-list>
      </section>
    </div>
  </div>
</template>

<script>
import Abilities from './assets/abilities.json';
import Heroes from './assets/heroes.json';

import AbilityList from './components/AbilityList';
import HeroGrid from './components/HeroGrid';

const abilityComparator = (a, b) => {
  if (a.hero > b.hero) { return 1; }
  if (a.hero < b.hero) { return -1; }
  return 0;
};

/* eslint-disable no-param-reassign */
const abilitiesByHero = Abilities.reduce((accumulator, currentValue) => {
  if (currentValue.hero in accumulator) {
    accumulator[currentValue.hero].push(currentValue);
  } else {
    accumulator[currentValue.hero] = [];
    accumulator[currentValue.hero].push(currentValue);
  }
  return accumulator;
}, {});
/* eslint-enable no-param-reassign */

export default {
  name: 'app',
  components: { AbilityList, HeroGrid },
  data() {
    return {
      abilities: [],
      aghsUpgrades: [],
      heroes: Heroes,
      selectedHeroes: [],
      query: '',
    };
  },
  methods: {
    onResetClick() {
      this.abilities = [];
      this.aghsUpgrades = [];
      this.selectedHeroes = [];
      this.query = '';
    },
    onHeroSelected(hero) {
      this.abilities = [...this.abilities, ...abilitiesByHero[hero.name]];
      this.abilities = [...new Set(this.abilities)];
      this.abilities.sort(abilityComparator);
      this.aghsUpgrades = this.abilities.filter(ability => ability.description.includes('Aghanim\'s Scepter'));
      this.selectedHeroes.push(hero);
      this.query = '';
    },
    onHeroUnselected(hero) {
      this.abilities = this.abilities.filter(h => h.hero !== hero.name);
      this.aghsUpgrades = this.aghsUpgrades.filter(h => h.hero !== hero.name);
      this.selectedHeroes.splice(this.selectedHeroes.indexOf(hero), 1);
    },
  },
};
</script>
