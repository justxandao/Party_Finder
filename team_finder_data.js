/**
 * Poketopia - Party Finder Data
 * Contém as definições de funções, pokémons disponíveis e dados iniciais.
 */

const availableRoles = [
    { id: 'tank', name: 'Tanker', icon: 'assets/icons/pve_tanker.png' },
    { id: 'otanker', name: 'Offensive Tanker', icon: 'assets/icons/pve_offensive_tanker.png' },
    { id: 'otdd', name: 'Over Time DD', icon: 'assets/icons/pve_over_time_damage_dealer.png' },
    { id: 'bdd', name: 'Burst DD', icon: 'assets/icons/pve_burst_damage_dealer.png' },
    { id: 'sot', name: 'Support OT', icon: 'assets/icons/pve_support_over_time.png' }
];

const availablePokemons = [
    { dex: 3, name: 'Mega Venusaur', roles: ['tank', 'sot'] },
    { dex: 6, name: 'Shiny Charizard', roles: ['otdd'], isShiny: true },
    { dex: 9, name: 'Shiny Blastoise', roles: ['tank', 'otdd'], isShiny: true },
    { dex: 12, name: 'Butterfree', roles: ['sot'] },
    { dex: 15, name: 'Mega Beedrill', roles: ['bdd'] },
    { dex: 18, name: 'Pidgeot', roles: ['otdd'] },
    { dex: 25, name: 'Shiny Pikachu', roles: ['bdd'], isShiny: true },
    { dex: 28, name: 'Shiny Sandslash', roles: ['tank'], isShiny: true },
    { dex: 31, name: 'Nidoqueen', roles: ['tank'] },
    { dex: 34, name: 'Nidoking', roles: ['bdd'] },
    { dex: 36, name: 'Shiny Clefable', roles: ['sot'], isShiny: true },
    { dex: 38, name: 'Shiny Ninetales', roles: ['bdd'], isShiny: true },
    { dex: 38, name: 'Alolan Ninetales', roles: ['bdd'] },
    { dex: 65, name: 'Alakazam', roles: ['bdd'] },
    { dex: 68, name: 'Shiny Machamp', roles: ['bdd'], isShiny: true },
    { dex: 94, name: 'Gengar', roles: ['bdd'] },
    { dex: 121, name: 'Mega Starmie', roles: ['bdd'] },
    { dex: 130, name: 'Mega Gyarados', roles: ['bdd'] },
    { dex: 131, name: 'Lapras', roles: ['bdd'] },
    { dex: 149, name: 'Mega Dragonite', roles: ['bdd'] },
    { dex: 208, name: 'Mega Steelix', roles: ['tank'] },
    { dex: 210, name: 'Shiny Granbull', roles: ['bdd'], isShiny: true },
    { dex: 212, name: 'Shiny Scizor', roles: ['bdd'], isShiny: true },
    { dex: 248, name: 'Tyranitar', roles: ['tank'] },
    { dex: 445, name: 'Mega Garchomp', roles: ['bdd'] },
    { dex: 448, name: 'Mega Lucario', roles: ['bdd'] }
];

const dummyTeams = [
    {
        id: 1,
        content: "Nightmare Terrors",
        difficulty: "Nightmare",
        leader: "Xandy",
        clan: "volcanic",
        clanName: "Volcanic",
        level: 605,
        dex: 6,
        reqLvl: 400,
        players: 3,
        maxPlayers: 5,
        type: "quests",
        roles: [
            { type: "otdd", filled: true, title: "Shiny Charizard (OTDD)" },
            { type: "otdd", filled: true, title: "Shiny Blastoise (OTDD)" },
            { type: "bdd", filled: true, title: "Mega Alakazam (BDD)" },
            { type: "sot", filled: false, title: "Support" },
            { type: "tank", filled: false, title: "Tanker" }
        ],
        comment: "Rush 5x, tragam dano!"
    },
    {
        id: 2,
        content: "Koga Quest",
        difficulty: "Normal",
        leader: "Misty",
        clan: "seavell",
        clanName: "Seavell",
        level: 420,
        dex: 121,
        reqLvl: 300,
        players: 2,
        maxPlayers: 4,
        type: "quests",
        roles: [
            { type: "bdd", filled: true, title: "Mega Starmie (BDD)" },
            { type: "bdd", filled: true, title: "Shiny Wigglytuff (SOT)" },
            { type: "sot", filled: false, title: "Suporte" },
            { type: "tank", filled: false, title: "Tank" }
        ],
        comment: "Fazendo a quest pela primeira vez."
    },
    {
        id: 3,
        content: "Legendary Beasts",
        difficulty: "Hard",
        leader: "Brock",
        clan: "orebound",
        clanName: "Orebound",
        level: 550,
        dex: 208,
        reqLvl: 450,
        players: 4,
        maxPlayers: 5,
        type: "quests",
        roles: [
            { type: "otanker", filled: true, title: "Mega Steelix (Offensive Tank)" },
            { type: "sot", filled: true, title: "Aromatisse (SOT)" },
            { type: "bdd", filled: true, title: "Shiny Machamp (BDD)" },
            { type: "otdd", filled: true, title: "Shiny Gengar (OTDD)" },
            { type: "bdd", filled: false, title: "Burst DPS" }
        ],
        comment: "Suicune run, precisa de muito dano."
    }
];
