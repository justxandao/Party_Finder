# Poketopia - Party Finder 🛡️

Uma interface premium e dinâmica de **Party Finder** (Localizador de Grupos) desenvolvida para o universo Poketopia. Este sistema permite que jogadores organizem e encontrem grupos para diversas atividades PVE e PVP, com foco em uma experiência de usuário fluida e visualmente impressionante.

## 🚀 Funcionalidades

- **Navegação de Grupos**: Visualize grupos ativos com informações detalhadas de conteúdo, dificuldade e requisitos.
- **Arquitetura Data-Driven**: Todo o conteúdo (Pokémon, Funções, Quests) é gerenciado via arquivos JSON modulares.
- **Seletor de Pokémon Avançado**: Sistema de busca com filtros por função e visualização de ícones de role em tempo real.
- **Gestão de Roles PVE**: Categorização precisa para Tankers, Burst DD, Over Time DD e Support OT.
- **Sistema de Assets Local**: Resolução dinâmica de sprites baseada em número da Pokédex e variantes (Mega, Shiny, Alolan).
- **Tooltips Detalhados**: Informações completas de jogadores, incluindo Clans e Held Items equipados.

## 📁 Estrutura de Arquivos

- `index.html`: Estrutura principal da interface.
- `team_finder.js`: Lógica core do aplicativo, renderização e manipulação de estado.
- `team_finder.css`: Sistema de design premium com animações e glassmorphism.
- `team_finder_data.json`: Registro central de Pokémon, funções e grupos iniciais.
- `contents_data.json`: Lista modular de atividades (Quests, Bosses, Torneios).
- `assets/`: Diretório contendo imagens de Pokémon, clans, itens e ícones.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5 Semântico, CSS3 (Vanilla com Variáveis), JavaScript (ES6+).
- **Ícones**: FontAwesome 6.
- **Tipografia**: Outfit (Google Fonts).

## 📖 Como Usar

1. Certifique-se de que a estrutura de pastas `assets/` está populada com as imagens necessárias.
2. Abra o arquivo `index.html` em um navegador moderno (recomenda-se o uso de um servidor local como Live Server no VS Code para evitar erros de CORS ao carregar os JSONs).
3. Utilize a barra de busca ou os filtros de categoria para encontrar grupos específicos.
4. Clique em "Criar Grupo" para abrir o modal de configuração e anunciar sua própria party.

---
Desenvolvido com Inteligência Artificial para estudo próprio.
