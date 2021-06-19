const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DATA_DIR = './src/assets/';
const DATA_FILE = 'data.json';
const ASSETS_DIR = './public/images';

const ENDPOINT_HERO_LIST = 'https://www.dota2.com/datafeed/herolist?language=english';
const ENDPOINT_HERO_DATA = 'https://www.dota2.com/datafeed/herodata?language=english&hero_id=';

const HERO_PREFIX = 'npc_dota_hero_';
const VALUES_INT_KEY = 'values_int';
const VALUES_FLOAT_KEY = 'values_float';
const SPECIAL_VALUE_KEY_REGEX = /%(\S+?)%/g;
const HTML_LINE_BREAK_REGEX = /<br>/g;
const HTML_FONT_REGEX = /<\/*font.*?>/g;

const UNAVAILABLE_ABILITIES = [
  'arc_warden_tempest_double', 'bristleback_hairball', 'broodmother_silken_bola',
  'earth_spirit_geomagnetic_grip', 'invoker_exort', 'invoker_invoke',
  'invoker_quas', 'invoker_wex', 'kunkka_torrent_storm',
  'medusa_cold_blooded', 'meepo_divided_we_stand', 'meepo_petrify',
  'morphling_morph_agi', 'morphling_morph_str', 'morphling_replicate',
  'necrolyte_death_seeker', 'ogre_magi_multicast', 'ogre_magi_smash',
  'ogre_magi_unrefined_fireblast', 'rubick_spell_steal', 'shadow_demon_shadow_poison',
  'terrorblade_terror_wave', 'tiny_tree_channel', 'troll_warlord_berserkers_rage',
  'beastmaster_call_of_the_wild_hawk',
  'beastmaster_mark_of_the_beast',
  'treant_natures_guise'
];

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR);
}

// XHR Calls
const getHeroList = () => axios.get(ENDPOINT_HERO_LIST)
  .then(r => r.data.result.data.heroes);
const getHeroData = (id) => axios.get(ENDPOINT_HERO_DATA + id)
  .then(r => r.data.result.data.heroes[0]);

// Utility
const getSpecialValue = (ability, values, key, dflt) => {
  const obj = values.find((v) => v.name.toUpperCase() === key.toUpperCase());
  const defaultValue = dflt ? dflt : '';

  if (obj) {
    return Object.hasOwnProperty.call(obj, VALUES_INT_KEY) && obj[VALUES_INT_KEY].length > 0 ? obj[VALUES_INT_KEY][0] :
      Object.hasOwnProperty.call(obj, VALUES_FLOAT_KEY) && obj[VALUES_FLOAT_KEY].length > 0 ? obj[VALUES_FLOAT_KEY][0] :
      defaultValue;
  }

  switch (ability) {
    case 'sandking_epicenter':
      return 2; // cast_points
    case 'broodmother_spin_web':
      return 40; // AbilityChargeRestoreTime
    case 'lycan_wolf_bite':
      return 30; // 'lifesteal_percent'
    case 'ember_spirit_fire_remnant':
      switch (key) {
        case 'charge_restore_time':
          return 38; // AbilityChargeRestoreTime
        case 'max_charges':
          return 3; // AbilityCharges
      }
      break;
    default: return defaultValue;
  }
}

const getDesc = (ability, values, desc) => desc
  .replace(/%%/g, '%')
  .replace(SPECIAL_VALUE_KEY_REGEX, (original, key) => getSpecialValue(ability, values, key))
  .replace(HTML_LINE_BREAK_REGEX, '')
  .replace(HTML_FONT_REGEX, '');

const getHeroes = async () => {
  const heroList = await getHeroList();

  const heroes = heroList.map((h) => {
    const slug = h.name.replace(HERO_PREFIX, '');
    return {
      id: h.id,
      name: h.name_loc,
      hero: slug,
      src: `/images/${slug}.png`,
    }
  })

  return heroes.sort((a, b) => a.name > b.name ? 1 : a.name < b.name ? -1 : 0);
}

const getAbilities = async (heroes) => {
  const abilityLists = await Promise.all(heroes.map(async (h) => {
    const data = await getHeroData(h.id);
    return data.abilities.map((a) => ({
      id: a.name,
      name: a.name_loc,
      desc: getDesc(a.name, a.special_values, a.desc_loc),
      hero: h.hero,
      src: `/images/${a.name}.png`,
      isUltimate: a.max_level === 3,
      hasScepter: a.ability_has_scepter,
      hasShard: a.ability_has_shard,
      fromScepter: a.ability_is_granted_by_scepter,
      fromShard: a.ability_is_granted_by_shard,
      shard: {
        requires: [],
        desc: getDesc(a.name, a.special_values, a.shard_loc),
      },
      scepter: {
        requires: [],
        desc: getDesc(a.name, a.special_values, a.scepter_loc),
      }
    }))
  }));

  const abilities = [].concat.apply([], abilityLists);

  return abilities;
}

const processAbilities = (abilities) => {
  const dict = abilities.reduce((acc, curr) => {
    if (!UNAVAILABLE_ABILITIES.includes(curr.id) && curr.hero !== 'invoker') {
      acc[curr.id] = curr;
    }
    return acc;
  }, {});

  // Missing Shard Upgrades
  dict['abaddon_aphotic_shield'].hasShard = true;
  dict['abaddon_aphotic_shield'].shard.desc = 'Causes Aphotic Shield to apply a Curse of Avernus stack on enemies. Lowers Cooldown for Aphotic Shield by 1.';
  dict['abaddon_death_coil'].hasShard = true;
  dict['abaddon_death_coil'].shard.desc = 'Causes Mist Coil to apply a Curse of Avernus stack on enemies. Lowers Cooldown for Mist Coil by 1.';
  dict['morphling_adaptive_strike_str'].hasShard = true;
  dict['morphling_adaptive_strike_str'].shard.desc = 'Causes Adaptive Strike to have +1 Multishot and increases the stun duration by 1 second. Multishot prioritizes heroes.'

  // Add Shard Upgrade Depencencies
  dict['abaddon_aphotic_shield'].shard.requires.push('abaddon_frostmourne');
  dict['abaddon_death_coil'].shard.requires.push('abaddon_frostmourne');
  dict['abaddon_frostmourne'].shard.requires.push('abaddon_aphotic_shield');
  dict['abaddon_frostmourne'].shard.requires.push('abaddon_death_coil');
  dict['chaos_knight_chaos_bolt'].shard.requires.push('chaos_knight_phantasm');
  dict['dark_willow_cursed_crown'].shard.requires.push('dark_willow_bramble_maze');
  dict['earthshaker_fissure'].shard.requires.push('earthshaker_aftershock');
  dict['furion_sprout'].shard.requires.push('furion_force_of_nature');
  dict['shadow_shaman_shackles'].shard.requires.push('shadow_shaman_mass_serpent_ward');
  dict['skeleton_king_reincarnation'].shard.requires.push('skeleton_king_vampiric_aura');
  dict['slardar_slithereen_crush'].shard.requires.push('slardar_amplify_damage');
  dict['spectre_dispersion'].shard.requires.push('spectre_haunt');
  dict['undying_decay'].shard.requires.push('undying_tombstone');
  dict['ursa_earthshock'].shard.requires.push('ursa_enrage');
  dict['venomancer_venomous_gale'].shard.requires.push('venomancer_plague_ward');
  dict['winter_wyvern_cold_embrace'].shard.requires.push('winter_wyvern_splinter_blast');

  // Add Shard Skill Dependencies
  dict['alchemist_berserk_potion'].shard.requires.push('alchemist_chemical_rage');
  dict['dark_seer_normal_punch'].shard.requires.push('dark_seer_wall_of_replica');
  dict['dragon_knight_fireball'].shard.requires.push('dragon_knight_elder_dragon_form');
  dict['faceless_void_time_walk_reverse'].shard.requires.push('faceless_void_time_walk');
  dict['jakiro_liquid_ice'].shard.requires.push('jakiro_macropyre');
  dict['keeper_of_the_light_recall'].shard.requires.push('keeper_of_the_light_spirit_form');
  dict['kunkka_tidal_wave'].shard.requires.push('kunkka_ghostship');
  dict['lich_ice_spire'].shard.requires.push('lich_chain_frost');
  dict['life_stealer_open_wounds'].shard.requires.push('life_stealer_infest');
  dict['magnataur_horn_toss'].shard.requires.push('magnataur_reverse_polarity');
  dict['omniknight_hammer_of_purity'].shard.requires.push('omniknight_guardian_angel');
  dict['pangolier_rollup'].shard.requires.push('pangolier_gyroshell');
  dict['phantom_assassin_fan_of_knives'].shard.requires.push('phantom_assassin_coup_de_grace');
  dict['rattletrap_jetpack'].shard.requires.push('rattletrap_hookshot');
  dict['riki_poison_dart'].shard.requires.push('riki_backstab');
  dict['shredder_flamethrower'].shard.requires.push('shredder_chakram');
  dict['slark_depth_shroud'].shard.requires.push('slark_shadow_dance');
  dict['sniper_concussive_grenade'].shard.requires.push('sniper_assassinate');
  dict['terrorblade_demon_zeal'].shard.requires.push('terrorblade_sunder');
  dict['tinker_defense_matrix'].shard.requires.push('tinker_rearm');
  dict['tusk_frozen_sigil'].shard.requires.push('tusk_walrus_punch');
  dict['witch_doctor_voodoo_switcheroo'].shard.requires.push('witch_doctor_death_ward');

  // Missing Scepter Upgrades
  dict['nevermore_necromastery'].hasScepter = true;
  dict['nevermore_necromastery'].scepter.desc = 'Increases Necromastery Max Souls.';
  dict['axe_battle_hunger'].hasScepter = true;
  dict['axe_battle_hunger'].scepter.desc = 'Battle Hunger also reduces enemy armor by 7 and grants Axe 7 armor per affected targeted.';

  // Add Scepter Upgrade Dependencies
  dict['abaddon_borrowed_time'].scepter.requires.push('abaddon_death_coil');
  dict['axe_berserkers_call'].scepter.requires.push('axe_battle_hunger');
  dict['bounty_hunter_shuriken_toss'].scepter.requires.push('bounty_hunter_jinada');
  dict['crystal_maiden_freezing_field'].scepter.requires.push('crystal_maiden_frostbite');
  dict['death_prophet_exorcism'].scepter.requires.push('death_prophet_carrion_swarm');
  dict['death_prophet_exorcism'].scepter.requires.push('death_prophet_silence');
  dict['death_prophet_exorcism'].scepter.requires.push('death_prophet_spirit_siphon');
  dict['enigma_black_hole'].scepter.requires.push('enigma_midnight_pulse');
  dict['faceless_void_time_walk'].scepter.requires.push('faceless_void_time_lock');
  dict['medusa_mystic_snake'].scepter.requires.push('medusa_stone_gaze');
  dict['mirana_arrow'].scepter.requires.push('mirana_starfall');
  dict['pangolier_shield_crash'].scepter.requires.push('pangolier_swashbuckle');
  dict['sandking_burrowstrike'].scepter.requires.push('sandking_caustic_finale');

  // Add Scepter Skill Dependencies
  dict['antimage_mana_overload'].scepter.requires.push('antimage_mana_void');
  dict['clinkz_burning_army'].scepter.requires.push('clinkz_death_pact');
  dict['earth_spirit_petrify'].scepter.requires.push('earth_spirit_magnetize');
  dict['enchantress_bunny_hop'].scepter.requires.push('enchantress_untouchable');
  dict['grimstroke_dark_portrait'].scepter.requires.push('grimstroke_soul_chain');
  dict['juggernaut_swift_slash'].scepter.requires.push('juggernaut_omni_slash');
  dict['keeper_of_the_light_will_o_wisp'].scepter.requires.push('keeper_of_the_light_spirit_form');
  dict['leshrac_greater_lightning_storm'].scepter.requires.push('leshrac_pulse_nova');
  dict['lycan_wolf_bite'].scepter.requires.push('lycan_shapeshift');
  dict['nyx_assassin_burrow'].scepter.requires.push('nyx_assassin_vendetta');
  dict['rattletrap_overclocking'].scepter.requires.push('rattletrap_hookshot');
  dict['shredder_chakram_2'].scepter.requires.push('shredder_chakram');
  dict['snapfire_gobble_up'].scepter.requires.push('snapfire_mortimer_kisses');
  dict['spectre_haunt_single'].scepter.requires.push('spectre_haunt');
  dict['templar_assassin_trap_teleport'].scepter.requires.push('templar_assassin_psionic_trap');
  dict['treant_eyes_in_the_forest'].scepter.requires.push('treant_overgrowth');
  dict['tusk_walrus_kick'].scepter.requires.push('tusk_walrus_punch');
  dict['zuus_cloud'].scepter.requires.push('zuus_thundergods_wrath');
  dict['zuus_cloud'].scepter.requires.push('zuus_lightning_bolt');

  // Shard Upgrages to Remove
  dict['keeper_of_the_light_spirit_form_illuminate'].hasShard = false; // Wrong
  dict['witch_doctor_death_ward'].hasShard = false; // Redundant

  // Shard Skills to Remove
  dict['hoodwink_decoy'].hasShard = false; // Uncertain (Innate?)
  dict['hoodwink_decoy'].fromShard = false; // Uncertain (Innate?)
  dict['troll_warlord_rampage'].hasShard = false; // Uncertain (Innate?)
  dict['troll_warlord_rampage'].fromShard = false; // Uncertain (Innate?)

  // Scepter Upgrades to Remove
  dict['antimage_mana_void'].hasScepter = false; // Redundant
  dict['juggernaut_omni_slash'].hasScepter = false; // Redundant
  dict['tiny_tree_grab'].hasScepter = false; // Redundant
  dict['zuus_thundergods_wrath'].hasScepter = false; // Redundant
  dict['kunkka_torrent'].hasScepter = false; // Redundant
  dict['rattletrap_hookshot'].hasScepter = false; // Redundant
  dict['enchantress_untouchable'].hasScepter = false; // Redundant
  dict['spectre_haunt'].hasScepter = false; // Redundant
  dict['lycan_shapeshift'].hasScepter = false; // Redundant
  dict['treant_overgrowth'].hasScepter = false; // Redundant
  dict['shredder_chakram'].hasScepter = false; // Redundant
  dict['tusk_walrus_punch'].hasScepter = false; // Redundant
  dict['terrorblade_metamorphosis'].hasScepter = false; // Redundant
  dict['grimstroke_soul_chain'].hasScepter = false; // Redundant
  dict['earth_spirit_stone_caller'].hasScepter = false; // Redundant

  // Scepter Skills to Remove
  dict['hoodwink_hunters_boomerang'].hasScepter = false; // Uncertain (Innate?)
  dict['hoodwink_hunters_boomerang'].fromScepter = false; // Uncertain (Innate?)
  dict['snapfire_spit_creep'].fromScepter = false; // Redundant
  dict['visage_silent_as_the_grave'].hasScepter = false; // Uncertain (Innate?)
  dict['visage_silent_as_the_grave'].fromScepter = false; // Uncertain (Innate?)
  dict['visage_summon_familiars'].hasScepter = false; // Uncertain (Innate?)

  // Various edge cases
  dict['alchemist_goblins_greed'].hasScepter = true;
  dict['alchemist_goblins_greed'].scepter.desc = dict['alchemist_chemical_rage'].scepter.desc;
  dict['alchemist_chemical_rage'].hasScepter = false;
  dict['alchemist_chemical_rage'].scepter.desc = '';

  dict['earth_spirit_magnetize'].hasShard = true;
  dict['earth_spirit_magnetize'].shard.desc = dict['earth_spirit_stone_caller'].shard.desc;
  dict['earth_spirit_stone_caller'].hasShard = false;
  dict['earth_spirit_stone_caller'].shard.desc = '';

  dict['techies_remote_mines'].scepter.desc = dict['techies_remote_mines'].scepter.desc + ' ' + dict['techies_minefield_sign'].scepter.desc;
  dict['techies_minefield_sign'].hasScepter = false;
  dict['techies_minefield_sign'].scepter.desc = '';

  dict['ember_spirit_activate_fire_remnant'].isUltimate = false;
  dict['dark_willow_bedlam'].isUltimate = false;

  const ultimates = Object.keys(dict)
    .filter((key) => dict[key].isUltimate && !dict[key].fromScepter && !dict[key].fromShard);
  const shardUpgrades = Object.keys(dict)
    .filter((key) => dict[key].hasShard && !dict[key].fromShard);
  const shardAbilities = Object.keys(dict)
    .filter((key) => dict[key].fromShard)
  const scepterUpgrades = Object.keys(dict)
    .filter((key) => dict[key].hasScepter && !dict[key].fromScepter);
  const scepterAbilities = Object.keys(dict)
    .filter((key) => dict[key].fromScepter);

  Object.keys(dict).forEach((key) => {
    delete dict[key].isUltimate;
    delete dict[key].hasScepter;
    delete dict[key].hasShard;
    delete dict[key].fromScepter;
    delete dict[key].fromShard;
  })

  return {
    abilities: {
      ultimates: ultimates.map((u) => dict[u]),
      scepter: {
        upgrades: scepterUpgrades.map((u) => dict[u]),
        abilities: scepterAbilities.map((a) => dict[a]),
      },
      shard: {
        upgrades: shardUpgrades.map((u) => dict[u]),
        abilities: shardAbilities.map((a) => dict[a]),
      },
    }
  }
};

const updateData = async () => {
  const heroes = await getHeroes();
  const abilities = await getAbilities(heroes);

  const data = processAbilities(abilities);
  data.heroes = heroes;
  fs.writeFileSync(path.join(DATA_DIR, DATA_FILE), JSON.stringify(data, null, 2));
};

updateData();
