
module.exports = {

    sessionStates: {
        undef:"undef",
        opened: "opened",
        search_for_enemy: "search_for_enemy",
        timeout:"timeout",

        start_battle: "start_battle",
        start_battle_cancel: "start_battle_cancel",
        start_battle_waiting: "start_battle_waiting",
        start_battle_success: "start_battle_success",

        battle_active: "battle_active",
        battle_wait: "battle_wait",

        fight_with_robot: "fight_with_robot",
        victory:"victory",
        defeat:"defeat",

    },
    hitStatuses: {
        undef:"undef",
        fail: 'fail',
        success:'success',
        super_: 'super',
    },
    buffTypes:{
        undef:"undef",
        hp_plus_self:'hp_plus_self',
        hp_minus_enemy:'hp_minus_enemy',
        mana_plus_self:'mana_plus_self',
        mana_minus_enemy:'mana_minus_enemy',
    },
    spellTargets:{
        self:'self',
        enemy:'enemy'
    },
    spellTypes:{
        active_spell:'active_spell',
        spell_parametric:'spell_parametric',
    },
    spellParamTypes:{
        currentHealth:'currentHealth',
        currentMana:'currentMana',
        maxHealth:'maxHealth',
        maxMana:'maxMana',
    },
    errorIds:{
        your_hp_is_over:'your_hp_is_over',
        enemy_hp_is_over:'enemy_hp_is_over',
    },
}











