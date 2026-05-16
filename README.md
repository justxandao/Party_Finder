# Poketopia - Party Finder 🛡️

Uma interface premium e dinâmica de **Party Finder** (Localizador de Grupos) desenvolvida para o universo Poketopia. Este sistema permite que jogadores organizem e encontrem grupos para diversas atividades PVE e PVP, com foco em uma experiência de usuário fluida, modular e visualmente impressionante.

## 🚀 Funcionalidades Premium

- **Navegação de Grupos Inteligente**: Visualize grupos ativos com informações detalhadas de conteúdo, dificuldade, requisitos e composição de funções em tempo real.
- **Sistema Multi-Função Dinâmico**: Suporte para jogadores que ocupam múltiplas funções. Slots de composição exibem ícones rotativos com badges informativos e animações fluidas.
- **Seletor de Pokémon Avançado**: Sistema de busca otimizado com filtros por função e prévia de *Held Items* em tempo real durante a seleção.
- **Held Items Determinísticos**: Lógica de geração de itens baseada na identidade do jogador, garantindo consistência visual em todos os módulos da interface.
- **Expansão de Membros Consolidada**: Visualização detalhada que agrupa todos os Pokémons e funções de um mesmo jogador em uma única linha, mantendo o layout limpo e organizado.
- **Arquitetura Data-Driven**: Todo o conteúdo (Pokémon, Funções, Quests, Raids) é gerenciado via arquivos JSON modulares para fácil manutenção.
- **Design de Alta Fidelidade**: Interface Dark Mode com glassmorphism, micro-animações CSS e tipografia moderna (Outfit).

## 📁 Estrutura de Arquivos

- `team_finder.html`: Estrutura principal da interface com suporte a modais e filtros.
- `team_finder.js`: Lógica core do aplicativo, gerenciamento de estado global e renderização dinâmica.
- `team_finder.css`: Sistema de design completo com tokens, utilitários e animações avançadas.
- `team_finder_data.json`: Registro central de Pokémon, funções e grupos pré-definidos.
- `contents_data.json`: Lista modular de atividades (Quests, Bosses, Torneios, Raids).
- `assets/`: Diretório contendo imagens de Pokémon, clans, itens e ícones de interface.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5 Semântico, CSS3 (Vanilla com CSS Variables), JavaScript (ES6+).
- **Ícones**: FontAwesome 6 (Pro-style icons).
- **Tipografia**: Google Fonts (Outfit).

## 📖 Como Usar

1. Certifique-se de que a estrutura de pastas `assets/` está populada com as imagens necessárias.
2. Abra o arquivo `team_finder.html` em um navegador moderno.
3. Utilize a barra de busca ou os filtros de categoria para encontrar grupos específicos.
4. Para criar um grupo, clique em **"Criar Grupo"**, escolha o conteúdo e selecione seus Pokémons. O sistema detectará automaticamente suas funções e gerará os Helds adequados.
