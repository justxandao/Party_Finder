/**
 * Poketopia - Party Finder Core Logic
 */

// --- Global State ---
let appData = null;
let contentsData = null;
let dummyTeams = [];
let activeRowForPicker = null;
let selectedPokemon = null;
let selectedHelds = [];
let teamBeingAppliedTo = null;
let selectedApplyRole = null;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        // Load core data (roles, pokemons)
        const appResponse = await fetch('team_finder_data.json');
        appData = await appResponse.json();
        dummyTeams = appData.dummyTeams;

        // Load contents data (modular quests/activities)
        const contentsResponse = await fetch('contents_data.json');
        const contentsJson = await contentsResponse.json();
        contentsData = contentsJson.contents;

        renderTeams();
        setupFilters();
        setupCreationModal();
        populateContentsDropdown();
    } catch (error) {
        console.error("Erro ao carregar dados do Party Finder:", error);
        appData = { roles: [], pokemons: [] };
        contentsData = [];
        renderTeams();
    }
}

function setupFilters() {
    const searchInput = document.querySelector('.search-box input');
    const filterSelect = document.getElementById('filterType');

    if (!searchInput || !filterSelect) return;

    const applyFilters = () => {
        const query = searchInput.value.toLowerCase();
        const type = filterSelect.value;
        renderTeams(query, type);
    };

    searchInput.addEventListener('input', applyFilters);
    filterSelect.addEventListener('change', applyFilters);
}

// --- Helpers ---
function getPokeImg(dex, name) {
    if (!dex) return "assets/images_ui/pokeball_empty.png";
    const padded = dex.toString().padStart(3, '0');
    let variant = "";

    if (name) {
        const n = name.toLowerCase();
        if (n.includes("shiny")) variant = ".1";
        else if (n.includes("mega x")) variant = ".2";
        else if (n.includes("mega y")) variant = ".3";
        else if (n.includes("mega")) variant = ".2";
        else if (n.includes("alolan")) variant = ".1";
    }

    return `assets/pokemons/${padded}${variant}.png`;
}

function getRoleIcon(type, filled) {
    if (!filled) return '';

    const roleData = appData.roles.find(r => r.id === type);
    const iconPath = roleData ? roleData.icon : 'assets/icons/pve_tanker.png';

    return `<img src="${iconPath}" class="role-img" style="width:28px;">`;
}

function getRoleName(type) {
    const roleData = appData.roles.find(r => r.id === type);
    return roleData ? roleData.name : "Qualquer Função";
}

function getDisplayClanName(clanId, providedName) {
    if (providedName) return providedName;
    if (!clanId) return "Sem Clan";
    // Capitalize first letter (e.g. volcanic -> Volcanic)
    return clanId.charAt(0).toUpperCase() + clanId.slice(1);
}

// --- Core Rendering ---
function renderTeams(query = "", type = "all") {
    const list = document.getElementById('teamList');
    if (!list) return;
    list.innerHTML = '';

    const filtered = dummyTeams.filter(team => {
        const matchQuery = team.content.toLowerCase().includes(query) ||
            team.leader.toLowerCase().includes(query);
        const matchType = type === 'all' || team.type === type;
        return matchQuery && matchType;
    });

    if (filtered.length === 0) {
        list.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">Nenhum grupo encontrado.</div>';
        return;
    }

    filtered.forEach(team => {
        const rolesHtml = team.roles.map(r => `
            <div class="role-slot ${r.filled ? 'filled ' + r.type : ''}" title="${r.filled ? r.title : getRoleName(r.type)}">
                ${getRoleIcon(r.type, r.filled)}
            </div>
        `).join('');

        const leaderRole = team.roles.find(r => r.filled && r.title.includes(team.leader));
        let pokeName = team.leader_poke_name;
        if (!pokeName && leaderRole) {
            pokeName = leaderRole.title.split(' (')[0];
        }

        const roleId = leaderRole ? leaderRole.type : 'otdd';
        const helds = team.helds || getHeldsForRole(roleId, team.leader);
        const heldsHtml = helds.map(h => `<img src="${h.img}" style="width:26px; height:26px; border:1px solid #333; border-radius:2px;" title="${h.name}">`).join('');

        const html = `
            <div class="team-card" onclick="toggleGroupExpansion(this)">
                <div class="col-content content-info">
                    <span class="content-title">${team.content} <span style="font-size: 0.75rem; color:#888;">(${team.difficulty})</span></span>
                    <div style="font-size: 0.8rem; color:#aaa; margin-top: 4px; font-style: italic;">"${team.comment}"</div>
                </div>
                
                <div class="col-leader leader-info">
                    <div class="leader-wrapper">
                        <span class="leader-name">
                            <i class="fa-solid fa-circle" style="color: #10b981; font-size: 10px; margin-right: 4px;"></i>
                            <i class="fa-solid fa-crown" style="color: #faba4d; margin-right: 4px;"></i>
                            ${team.leader}
                        </span>
                    </div>
                </div>

                <div class="col-reqs reqs-info">
                    <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                        <span style="font-weight: 500;">Lvl ${team.reqLvl}+</span>
                        <span style="font-size: 0.75rem; color: #777;">${team.players}/${team.maxPlayers} Jogadores</span>
                    </div>
                </div>

                <div class="col-composition">
                    <div class="role-slots-container">
                        ${rolesHtml}
                    </div>
                </div>
                
                <div class="col-action">
                    ${team.leader === 'Xandy'
                ? `<button class="action-btn highlight-btn" style="padding: 8px 16px; background-color:#10b981;" onclick="event.stopPropagation(); document.getElementById('applicantsModal').classList.add('active')"><i class="fa-solid fa-users"></i> Ver (2)</button>`
                : `<button class="action-btn" style="padding: 8px 16px;" onclick="event.stopPropagation(); openApplyModal(${team.id})">Entrar</button>`}
                </div>

                <!-- Expansão: Membros do Grupo -->
                <div class="team-expansion-content">
                    <div class="members-expansion-list">
                        ${(() => {
                            let membersList = team.members || [];
                            if (team.leader === 'Xandy' && membersList.length === 0) {
                                membersList = [{
                                    name: "Xandy",
                                    level: 605,
                                    clan: "ironhard",
                                    dex: team.dex,
                                    pokeName: team.leader_poke_name,
                                    helds: team.helds || getHeldsForRole(leaderRole ? leaderRole.type : 'otdd', "Xandy")
                                }];
                            }
                            return membersList.map(m => `
                                <div class="member-expansion-item">
                                    <div class="member-exp-info">
                                        <img src="assets/clans/${m.clan}.png" class="member-exp-clan" onerror="this.src='assets/clans/seavell.png'">
                                        <div style="display: flex; flex-direction: column;">
                                            <span class="member-exp-name">${m.name}</span>
                                            <span class="member-exp-lvl">Level ${m.level}</span>
                                        </div>
                                    </div>
                                    <div class="member-exp-poke">
                                        <img src="${getPokeImg(m.dex, m.pokeName)}" class="member-exp-icon">
                                        <span class="member-exp-pokename">${m.pokeName}</span>
                                    </div>
                                    <div class="member-exp-helds">
                                        ${(m.helds || []).map(h => `<img src="${h.img}" title="${h.name}">`).join('')}
                                    </div>
                                </div>
                            `).join('');
                        })()}
                    </div>
                </div>
            </div>
        `;
        list.innerHTML += html;
    });
}

function toggleGroupExpansion(card) {
    // Fecha outros abertos para manter a interface limpa
    document.querySelectorAll('.team-card.expanded').forEach(c => {
        if (c !== card) c.classList.remove('expanded');
    });
    card.classList.toggle('expanded');
}

// --- Modal Management ---
function openDetailsModal(teamId) {
    const team = dummyTeams.find(t => t.id === teamId);
    if (!team) return;

    const modal = document.getElementById('teamDetailsModal');
    const container = document.getElementById('detailsTeamTitle').parentElement.parentElement.querySelector('.modal-body');

    const leaderRole = team.roles.find(r => r.filled && r.title.includes(team.leader));
    let pokeName = team.leader_poke_name;
    if (!pokeName && leaderRole) {
        pokeName = leaderRole.title.split(' (')[0];
    }

    const players = team.members || [
        { 
            name: team.leader, 
            level: team.level, 
            clan: team.clan, 
            clanName: getDisplayClanName(team.clan, team.clanName), 
            dex: team.dex, 
            pokeName: pokeName, 
            isLeader: true,
            helds: team.helds || getHeldsForRole(leaderRole ? leaderRole.type : 'otdd', team.leader)
        }
    ];

    container.innerHTML = players.map(p => {
        const heldsHtml = (p.helds || []).map(h => `<img src="${h.img}" style="width:32px; height:32px; border:1px solid #333; border-radius:4px;" title="${h.name}">`).join('');

        return `
            <div class="player-detail-card-premium">
                <div class="pdc-header">
                    <div class="pdc-clan-icon">
                        <img src="assets/clans/${p.clan}.png" onerror="this.src='assets/clans/seavell.png'">
                    </div>
                    <div class="pdc-info">
                        <div class="pdc-clan-name">${p.clanName || getDisplayClanName(p.clan)}</div>
                        <div class="pdc-level">Level ${p.level}</div>
                        <div class="pdc-player-status">
                            <span class="status-dot online"></span>
                            ${p.isLeader ? `<i class="fa-solid fa-crown" style="color: #faba4d; font-size: 0.8rem; margin: 0 5px;"></i>` : ''}
                            <span class="pdc-player-name">${p.name}</span>
                        </div>
                    </div>
                </div>
                <div class="pdc-slots-grid">
                    <div class="pdc-slot filled">
                        <img src="${getPokeImg(p.dex, p.pokeName)}" class="pdc-poke-img">
                    </div>
                    <div class="pdc-slot"><img src="assets/images_ui/pokeball_empty.png" class="pdc-empty-icon"></div>
                    <div class="pdc-slot"><img src="assets/images_ui/pokeball_empty.png" class="pdc-empty-icon"></div>
                    <div class="pdc-slot"><img src="assets/images_ui/pokeball_empty.png" class="pdc-empty-icon"></div>
                    <div class="pdc-slot"><img src="assets/images_ui/pokeball_empty.png" class="pdc-empty-icon"></div>
                    <div class="pdc-slot"><img src="assets/images_ui/pokeball_empty.png" class="pdc-empty-icon"></div>
                </div>
                <div class="pdc-footer">
                    <div class="pdc-helds-list">
                        ${heldsHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('') + `
        <div style="margin-top: 30px;">
            <div style="color: #888; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 12px; font-weight: 600; letter-spacing: 1px; display: flex; align-items: center; gap: 8px;">
                <div style="flex: 1; height: 1px; background: #222;"></div>
                Funções Abertas no Grupo
                <div style="flex: 1; height: 1px; background: #222;"></div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                ${team.roles.filter(r => !r.filled).map(r => `
                    <div class="open-role-card">
                        <div class="role-slot ${r.type}" style="width:36px; height:36px; font-size: 0.9rem;">
                            <img src="${appData.roles.find(role => role.id === r.type).icon}" style="width:24px;">
                        </div>
                        <div style="display: flex; flex-direction: column;">
                            <span style="color: #eee; font-size: 0.9rem; font-weight: 600;">${getRoleName(r.type)}</span>
                            <span style="color: #555; font-size: 0.7rem; text-transform: uppercase;">Disponível</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-top: 40px; display: flex; justify-content: flex-end; gap: 15px; border-top: 1px solid #1a1a1a; padding-top: 25px;">
            <button class="action-btn" onclick="closeDetailsModal()" style="background: transparent; border: 1px solid #222; color: #888; padding: 10px 25px; border-radius: 50px; font-weight: 600;">Fechar</button>
            <button class="action-btn highlight-btn" onclick="closeDetailsModal(); openApplyModal(${team.id})" style="padding: 10px 35px; border-radius: 50px; font-weight: 700; background: #2563eb; color: #fff; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);">Solicitar Convite</button>
        </div>
   `;

    modal.classList.add('active');
}

function closeDetailsModal() {
    document.getElementById('teamDetailsModal').classList.remove('active');
}

function openApplyModal(teamId) {
    const team = dummyTeams.find(t => t.id === teamId);
    if (!team) return;

    teamBeingAppliedTo = team;
    document.getElementById('applyModal').classList.add('active');

    const container = document.getElementById('applyRoleContainer');
    const openRoles = team.roles.filter(r => !r.filled);
    container.innerHTML = openRoles.map(r => `
        <button class="role-btn" onclick="selectApplyRole('${r.type}', this)">
            <div class="role-btn-icon"><img src="${appData.roles.find(role => role.id === r.type).icon}" style="width:20px;"></div>
            <span>${getRoleName(r.type)}</span>
        </button>
    `).join('');

    // Reset picker
    document.getElementById('applyPokeIcon').src = "assets/images_ui/pokeball_empty.png";
    document.getElementById('applyPokeName').innerText = "Selecionar Pokémon...";
    document.getElementById('applyPokeName').dataset.dex = "";
    document.getElementById('applyPokeHelds').innerHTML = "";
    document.getElementById('sendApplyBtn').disabled = true;
    selectedApplyRole = null;
}

function closeApplyModal() {
    document.getElementById('applyModal').classList.remove('active');
}

function selectApplyRole(roleId, btn) {
    selectedApplyRole = roleId;
    document.querySelectorAll('#applyRoleContainer .role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    checkApplyValidity();
}

function checkApplyValidity() {
    const pokeDex = document.getElementById('applyPokeName').dataset.dex;
    const btn = document.getElementById('sendApplyBtn');
    btn.disabled = !(selectedApplyRole && pokeDex);
}

function submitApplication() {
    closeApplyModal();
}

// --- Pokemon Picker ---
function openPickerModal(row) {
    activeRowForPicker = row;
    document.getElementById('pokemonPickerModal').classList.add('active');

    const roleSelect = row.querySelector('.role-select');
    const pickerRoleFilter = document.getElementById('pickerRoleFilter');

    if (roleSelect) {
        pickerRoleFilter.value = roleSelect.value;
    } else if (selectedApplyRole) {
        pickerRoleFilter.value = selectedApplyRole;
    }

    filterPicker();
}

function closePickerModal() {
    document.getElementById('pokemonPickerModal').classList.remove('active');
    selectedPokemon = null;
    document.getElementById('confirmPokeBtn').disabled = true;
}

function filterPicker() {
    const searchTerm = document.getElementById('pickerSearch').value.toLowerCase();
    const roleFilter = document.getElementById('pickerRoleFilter').value;
    const grid = document.getElementById('pickerGrid');
    if (!grid || !appData) return;

    let filtered = appData.pokemons.filter(p => {
        const matchesName = p.name.toLowerCase().includes(searchTerm);
        const matchesRole = roleFilter === 'all' || p.roles.includes(roleFilter);
        return matchesName && matchesRole;
    });

    // Sort alphabetically
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    grid.innerHTML = filtered.map(p => `
        <div class="picker-item" onclick="selectPokemonFromPicker('${p.name}')">
            <div class="picker-poke-roles">
                ${p.roles.map(rid => {
        const r = appData.roles.find(role => role.id === rid);
        return `<img src="${r ? r.icon : ''}" title="${getRoleName(rid)}" style="width:14px; height:14px;">`;
    }).join('')}
            </div>
            <img src="${getPokeImg(p.dex, p.name)}" class="picker-poke-img">
            <div class="picker-poke-name">${p.name}</div>
        </div>
    `).join('');
}

function selectPokemonFromPicker(pokeName) {
    const poke = appData.pokemons.find(p => p.name === pokeName);
    if (!poke) return;

    selectedPokemon = poke;
    const img = document.getElementById('selectedPokeImg');
    const name = document.getElementById('selectedPokeName');
    const heldsContainer = document.getElementById('selectedPokeHelds');
    const btn = document.getElementById('confirmPokeBtn');

    img.src = getPokeImg(poke.dex, poke.name);
    img.style.display = 'block';
    name.innerText = poke.name;

    let roleId = 'otdd';
    const roleSelect = activeRowForPicker.querySelector('.role-select');
    if (roleSelect) {
        roleId = roleSelect.value;
    } else if (selectedApplyRole) {
        roleId = selectedApplyRole;
    }

    selectedHelds = getHeldsForRole(roleId);
    heldsContainer.innerHTML = selectedHelds.map(h => `
        <img src="${h.img}" style="width:16px; height:16px; border:1px solid #333; border-radius:2px;" title="${h.name}">
    `).join('');

    document.querySelectorAll('.picker-item').forEach(item => {
        item.classList.remove('selected');
        if (item.querySelector('.picker-poke-name').innerText === poke.name) item.classList.add('selected');
    });

    btn.disabled = false;
}

function confirmPokemonSelection() {
    if (!selectedPokemon || !activeRowForPicker) {
        return;
    }



    const isApplyModal = activeRowForPicker.id === 'applyPokePicker';

    if (isApplyModal) {
        const pokeNameElem = document.getElementById('applyPokeName');
        const pokeIcon = document.getElementById('applyPokeIcon');
        const heldsContainer = document.getElementById('applyPokeHelds');

        pokeNameElem.dataset.dex = selectedPokemon.dex;
        pokeNameElem.dataset.name = selectedPokemon.name;
        pokeNameElem.innerText = selectedPokemon.name;
        pokeIcon.src = getPokeImg(selectedPokemon.dex, selectedPokemon.name);

        const helds = selectedHelds.length > 0 ? selectedHelds : getHeldsForRole(selectedApplyRole || 'otdd', "Xandy");
        heldsContainer.innerHTML = helds.map(h => `
            <img src="${h.img}" style="width:36px; height:36px; border:1px solid #333; border-radius:4px;" title="${h.name}">
        `).join('');

        checkApplyValidity();
    } else {
        const pokeSelect = activeRowForPicker.querySelector('.poke-select');
        const pokeIcon = activeRowForPicker.querySelector('.poke-icon-preview');
        const detectedRolesContainer = activeRowForPicker.querySelector('.detected-roles');

        if (pokeSelect) {
            pokeSelect.dataset.dex = selectedPokemon.dex;
            pokeSelect.dataset.name = selectedPokemon.name;
            pokeSelect.innerText = selectedPokemon.name;
            pokeSelect.style.color = "#eee";
        }

        if (pokeIcon) {
            pokeIcon.src = getPokeImg(selectedPokemon.dex, selectedPokemon.name);
        }

        if (detectedRolesContainer && !activeRowForPicker.classList.contains('apply-poke-picker')) {
            // Auto-detect roles
            const rolesHtml = selectedPokemon.roles.map(rid => {
                const r = appData.roles.find(role => role.id === rid);
                return `<img src="${r ? r.icon : ''}" title="${getRoleName(rid)}" style="width:16px; height:16px; opacity:0.8;">`;
            }).join('');
            detectedRolesContainer.innerHTML = rolesHtml;

            // Generate and Show Helds for the creator
            const heldsContainer = activeRowForPicker.querySelector('.creator-poke-helds');
            if (heldsContainer) {
                const helds = selectedHelds.length > 0 ? selectedHelds : getHeldsForRole(selectedPokemon.roles[0] || 'otdd', "Xandy");
                heldsContainer.innerHTML = helds.map(h => `
                    <img src="${h.img}" title="${h.name}" style="width:24px; height:24px; border:1px solid #333; border-radius:2px;">
                `).join('');
            }
        }
    }

    closePickerModal();
}

// --- Team Creation ---
function setupCreationModal() {
    const btn = document.getElementById('createTeamBtn');
    if (btn) btn.addEventListener('click', openCreateModal);

    const closeBtn = document.querySelector('#createModal .close-icon');
    if (closeBtn) closeBtn.addEventListener('click', closeCreateModal);

    const rolesList = document.getElementById('creationRolesList');
    if (rolesList) {
        rolesList.innerHTML = '';
        addDynamicRoleRow();
    }

    const addRoleBtn = document.getElementById('addNeededRoleBtn');
    if (addRoleBtn) addRoleBtn.addEventListener('click', createNeededRoleRow);
}

// --- Solicitações (Applicants) ---
let dummyApplicants = [
    {
        id: 1,
        name: 'Brock',
        level: 550,
        clan: 'orebound',
        dex: 105,
        pokeName: 'Shiny Marowak',
        role: 'otdd',
        helds: [
            { name: 'X-Attack', img: 'assets/held item/atk8.png' },
            { name: 'Ghost', img: 'assets/held item/Ghost.png' }
        ]
    },
    {
        id: 2,
        name: 'Ash',
        level: 580,
        clan: 'naturia',
        dex: 25,
        pokeName: 'Pikachu',
        role: 'bdd',
        helds: [
            { name: 'X-Attack', img: 'assets/held item/atk7.png' },
            { name: 'Ghost', img: 'assets/held item/Ghost.png' }
        ]
    }
];

function openApplicantsModal() {
    const modal = document.getElementById('applicantsModal');
    if (modal) {
        modal.classList.add('active');
        renderApplicants();
    }
}

function renderApplicants() {
    const container = document.querySelector('#applicantsModal .modal-body');
    if (!container) return;

    if (dummyApplicants.length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #444;">
                <i class="fa-solid fa-users-slash" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <span style="font-weight: 600;">Nenhuma solicitação pendente</span>
            </div>
        `;
        return;
    }

    container.innerHTML = dummyApplicants.map(p => `
        <div class="applicant-row-premium" id="applicant-${p.id}">
            <div class="app-col-player">
                <img src="assets/clans/${p.clan}.png" class="app-clan-icon">
                <div class="app-player-text">
                    <div class="app-player-name">${p.name}</div>
                    <div class="app-player-lvl">Level ${p.level}</div>
                </div>
            </div>

            <div class="app-col-poke">
                <img src="${getPokeImg(p.dex, p.pokeName)}" class="app-poke-img">
                <div class="app-poke-text">
                    <span class="app-poke-name">${p.pokeName}</span>
                    <div class="app-role-line">
                        ${getRoleIcon(p.role, true)}
                        <span class="app-role-name">${getRoleName(p.role)}</span>
                    </div>
                </div>
            </div>

            <div class="app-col-helds">
                ${(p.helds || []).map(h => `<div class="app-held-slot"><img src="${h.img}" title="${h.name}"></div>`).join('')}
            </div>

            <div class="app-separator"></div>

            <div class="app-actions-ghost">
                <button class="ghost-btn accept" onclick="acceptApplicant(${p.id})"><i class="fa-solid fa-check"></i></button>
                <button class="ghost-btn decline" onclick="declineApplicant(${p.id})"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
    `).join('');
}

function acceptApplicant(id) {
    // Feedback visual e remoção (simulação de aceite)
    const row = document.getElementById(`applicant-${id}`);
    if (row) {
        row.style.transform = 'scale(0.95)';
        row.style.opacity = '0';
        setTimeout(() => {
            dummyApplicants = dummyApplicants.filter(p => p.id !== id);
            renderApplicants();
        }, 300);
    }
}

function declineApplicant(id) {
    const row = document.getElementById(`applicant-${id}`);
    if (row) {
        row.style.transform = 'scale(0.95)';
        row.style.opacity = '0';
        setTimeout(() => {
            dummyApplicants = dummyApplicants.filter(p => p.id !== id);
            renderApplicants();
        }, 300);
    }
}
function openCreateModal() {
    document.getElementById('createModal').classList.add('active');
}

function closeCreateModal() {
    document.getElementById('createModal').classList.remove('active');
}

function populateContentsDropdown() {
    const dropdown = document.getElementById('createContent');
    if (!dropdown || !contentsData) return;

    dropdown.innerHTML = contentsData.map(c => `
        <option value="${c.id}">${c.name}</option>
    `).join('');

    dropdown.addEventListener('change', (e) => {
        const selected = contentsData.find(c => c.id === e.target.value);
        if (selected) {
            document.getElementById('createReqLvl').value = selected.minLevel;
        }
    });

    if (contentsData.length > 0) {
        document.getElementById('createReqLvl').value = contentsData[0].minLevel;
    }
}

function addDynamicRoleRow() {
    const list = document.getElementById('creationRolesList');
    const row = document.createElement('div');
    row.className = 'dynamic-role-row creator-poke-slot';
    
    if (!appData) return;

    row.innerHTML = `
        <div class="role-row-poke-picker" onclick="openPickerModal(this.parentElement)" style="flex: 1; justify-content: flex-start; gap: 15px; padding: 10px 15px;">
            <div class="poke-icon-wrapper" style="width: 42px; height: 42px; background: #000; border: 1px solid #333; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                <img src="assets/images_ui/pokeball_empty.png" class="poke-icon-preview" style="width:32px; height:32px; object-fit: contain;">
            </div>
            <div style="display: flex; flex-direction: column; flex: 1;">
                <span class="poke-select" data-dex="" data-name="" style="color: #666; font-weight: 600; font-size: 0.95rem;">Selecionar Pokémon...</span>
                <div style="display: flex; align-items: center; gap: 10px; margin-top: 4px;">
                    <div class="detected-roles" style="display: flex; gap: 4px;"></div>
                    <div class="creator-poke-helds" style="display: flex; gap: 4px; border-left: 1px solid #222; padding-left: 10px;"></div>
                </div>
            </div>
            <button class="remove-role-btn" onclick="event.stopPropagation(); this.parentElement.parentElement.remove();" style="background:none; border:none; color:#ef4444; cursor:pointer; padding: 10px;"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;
    list.appendChild(row);
}

function createNeededRoleRow() {
    const list = document.getElementById('neededRoleList');
    const row = document.createElement('div');
    row.className = 'dynamic-role-row needed-role-row';

    if (!appData) return;
    const defaultRole = appData.roles[0];
    let roleOptions = appData.roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

    row.innerHTML = `
        <div class="role-row-icon"><img src="${defaultRole.icon}" class="role-icon-preview"></div>
        <select class="role-select" style="flex: 1;">${roleOptions}</select>
        <div style="flex: 2; color: #555; font-size: 0.8rem; font-style: italic; padding-left: 10px;">Vaga em aberto</div>
        <button class="remove-role-btn" style="background:none; border:none; color:#ef4444; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
    `;
    list.appendChild(row);

    const roleSelect = row.querySelector('.role-select');
    const roleIcon = row.querySelector('.role-icon-preview');

    roleSelect.addEventListener('change', (e) => {
        const selectedRole = appData.roles.find(r => r.id === e.target.value);
        if (selectedRole) roleIcon.src = selectedRole.icon;
    });

    row.querySelector('.remove-role-btn').addEventListener('click', () => {
        row.remove();
    });
}

function createGroup() {
    const contentId = document.getElementById('createContent').value;
    const selectedContent = contentsData.find(c => c.id === contentId);

    const contentName = selectedContent ? selectedContent.name : "Novo Grupo";
    const contentDifficulty = selectedContent ? selectedContent.difficulty : "Normal";
    const contentType = selectedContent ? selectedContent.category : "quests";

    const comment = document.getElementById('createComment').value || "Bora grupo!";
    const reqLvl = parseInt(document.getElementById('createReqLvl').value) || 100;
    const maxPlayersInput = parseInt(document.getElementById('createMaxPlayers').value) || 4;

    const roleRows = document.querySelectorAll('.dynamic-role-row:not(.needed-role-row)');
    const neededRoleRows = document.querySelectorAll('.needed-role-row');
    const newRoles = [];

    roleRows.forEach(row => {
        const pokeSelect = row.querySelector('.poke-select');
        const pokeDex = pokeSelect.dataset.dex;
        const pokeName = pokeSelect.dataset.name || "Qualquer";
        
        // Find the pokemon in appData to get its roles
        const pokeData = appData.pokemons.find(p => p.name === pokeName);
        const roleIds = (pokeData && pokeData.roles) ? pokeData.roles : ['otdd'];

        roleIds.forEach(roleId => {
            newRoles.push({
                type: roleId,
                filled: !!pokeDex,
                title: pokeName !== "Qualquer" ? `${pokeName} (${roleId.toUpperCase()})` : getRoleName(roleId)
            });
        });
    });

    neededRoleRows.forEach(row => {
        const roleId = row.querySelector('.role-select').value;
        newRoles.push({ type: roleId, filled: false, title: getRoleName(roleId) });
    });

    const maxP = Math.max(newRoles.length, maxPlayersInput);
    while (newRoles.length < maxP) {
        newRoles.push({ type: "empty", filled: false, title: "Qualquer Função" });
    }

    const leaderRow = roleRows[0];
    const leaderPoke = leaderRow.querySelector('.poke-select');
    const leaderDex = leaderPoke.dataset.dex || 25;
    const leaderPokeName = leaderPoke.dataset.name || "Pikachu";

    const newTeam = {
        id: dummyTeams.length + 1,
        content: contentName,
        difficulty: contentDifficulty,
        leader: "Xandy",
        clan: "ironhard",
        clanName: "Ironhard",
        level: 605,
        dex: leaderDex,
        leader_poke_name: leaderPokeName,
        reqLvl: reqLvl,
        players: 1,
        maxPlayers: maxP,
        type: contentType,
        roles: newRoles,
        comment: comment
    };

    dummyTeams.unshift(newTeam);
    renderTeams();
    closeCreateModal();
}

// --- Helpers ---
function getHeldsForRole(roleType, playerName = "Xandy") {
    // Deterministic seed based on player name to keep helds consistent
    let seed = 0;
    for (let i = 0; i < playerName.length; i++) seed += playerName.charCodeAt(i);
    
    const pseudoRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };

    const isDefensive = roleType.toLowerCase().includes('tank');
    const tier = pseudoRandom() > 0.5 ? '7' : '8';
    
    // Randomize primary held type but keep it stable for the same name
    const defTypes = ['def', 'Ghost'];
    const atkTypes = ['atk'];
    
    const types = isDefensive ? defTypes : atkTypes;
    const t1 = types[Math.floor(pseudoRandom() * types.length)];
    
    const helds = [];
    if (t1 === 'Ghost') {
        helds.push({ name: 'Ghost', img: 'assets/held item/Ghost.png' });
        helds.push({ name: isDefensive ? 'X-Defense' : 'X-Attack', img: `assets/held item/${isDefensive ? 'def' : 'atk'}${tier}.png` });
    } else {
        helds.push({ name: isDefensive ? 'X-Defense' : 'X-Attack', img: `assets/held item/${t1}${tier}.png` });
        helds.push({ name: 'Ghost', img: 'assets/held item/Ghost.png' });
    }
    
    return helds;
}
