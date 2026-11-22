# 📘 DXCore — Registro Completo de Modificações e Novidades

> Este documento é um relatório consolidado de todas as solicitações, melhorias, novos recursos e exclusões realizadas no projeto **DXCore** (evolução personalizada do PKHeX-web original). Ele serve como consulta e histórico oficial do projeto.

---

## 🧭 1. Visão Geral da Evolução (Original vs. DXCore)

| Aspecto | Versão Original (PKHeX-web) | Versão Personalizada (DXCore) |
| :--- | :--- | :--- |
| **Identidade** | PKHeX Everywhere clássico | **DXCore** com nova paleta, esfera luminosa azul (`#38bdf8`) e animação exclusiva |
| **Abertura do Sistema** | Carregamento seco e imediato | **Animação imersiva de 2s da Pokébola** com oscilação física, LED pulsante, clique com estrelas e revelação do DXCore |
| **Navegação Mobile** | Menu padrão desktop espremido | **Barra inferior nativa estilo app (Bottom Nav)** com os 4 atalhos essenciais e efeito dinâmico de fade ao rolar |
| **Cabeçalho (Header)** | Estático e simples | **Sticky inteligente** (some ao descer a tela, reaparece ao subir) com indicador OT em azul DXCore |
| **Editor de Pokémon** | Colunas padrão e layout único | **Modo Vitrine (Showcase)** com proporção responsiva (40/60 em `lg` e 30/70 em `xl`), arte oficial em alta resolução e barras coloridas de atributos |
| **Gerenciamento de PC** | Troca simples sem regras | **Mover entre caixas em lote** com cálculo em tempo real de vagas e prevenção contra perda de dados |
| **Filtros de Busca** | Apenas busca textual solta | **Filtros agrupados em popover** (Shiny/Normal, Tipos Elementais com ícones coloridos) e busca expansível com overlay translúcido |
| **Histórico de Backups** | Tabelas básicas ou pouco intuitivas | **Cards interativos de restauração**, com timestamps amigáveis e restauração em 1 clique |
| **Dependências Externas** | Menções a plugins remotos e scripts de anúncios | **100% WebAssembly local e limpo**, sem anúncios, sem rastreadores lentos e sem plugins descontinuados |

---

## 🛠️ 2. Lista Detalhada de Modificações por Área

### 🎨 A. Identidade Visual, Temas e Padronização
1. **Renomeação para DXCore:**
   - Atualização da marca em todo o ecossistema (AppShell, cabeçalhos, rodapé, títulos de abas e metadados).
   - Adicionada a esfera azul ciano com brilho suave (`#38bdf8`) como ícone representativo.
2. **Animação de Captura da Pokébola & Apresentação da Marca:**
   - Criação de animação CSS/SVG com balanços físicos reais, alternância de LED vermelho/azul, emissão de onda de choque e explosão de estrelas luminosas.
   - Utilizada na tela de abertura (Splash Screen de 2s).
   - Na tela de opções iniciais de save (`/load`), a Pokébola é exibida diretamente no seu estado final capturado e estável (com LED ciano fixo), entrando com uma animação suave de fade-up juntamente com o nome DXCore e os botões de ação.
3. **Redução e Harmonização do Padding Geral:**
   - O espaçamento interno (padding) de todo o conteúdo foi reduzido de `24px` para `20px`, aproveitando melhor o espaço útil de telas menores e monitores ultrawide.
4. **Padronização da Altura de Inputs (38px):**
   - Todos os inputs de texto, seletores (`Select`), campos numéricos (`InputNumber`), seletores de data e containers de campos como Apelido, PID, Tipos e Características Especiais foram unificados estritamente na altura padrão de `38px` (`height: 38`, `minHeight: 38`, `boxSizing: 'border-box'`), eliminando desníveis visuais nos formulários.
5. **Remoção de Ícones dos Alertas:**
   - Alertas visuais do sistema (`Alert`) tiveram seus ícones removidos para uma estética minimalista e mais limpa.

---

### 💾 B. Tela de Carregamento & Opções Iniciais (`/load` e `/save`)
1. **Desativação do Carregamento Automático:**
   - Removido o comportamento em que o sistema carregava automaticamente o save de demonstração ao iniciar em modo de desenvolvimento ou ao clicar na rota de início.
2. **Confirmação Explicativa para Save Demo:**
   - Adicionada modal de confirmação ao clicar em "Demonstração". O sistema avisa que nenhum save foi aberto (ou que substituirá o atual) e confirma se o usuário deseja carregar a demonstração do Pokémon Emerald (GBA).
   - Correção do caminho relativo do save demo (`data/emerald.sav`), garantindo carregamento instantâneo tanto localmente quanto no GitHub Pages.
3. **Disponibilidade das Opções Mesmo com Save Carregado:**
   - Adicionados os botões "Novo Save Vazio" (com menu para escolher qualquer versão Pokémon) e "Carregar Demonstração" mesmo quando um save já estiver ativo na memória.
4. **Uniformidade dos Botões:**
   - Todos os botões da tela de save foram padronizados para largura total (`100%`) e altura de `40px`.
5. **Seletor de Idiomas no Rodapé Exclusivo da Tela Inicial com Siglas:**
   - Inseridas bandeiras e siglas diretas no rodapé (`🇧🇷 PT-BR`, `🇺🇸 US`, `🇪🇸 ES`) com destaque visual no idioma ativo para troca imediata e layout compacto.
   - O rodapé foi removido de todas as outras páginas internas do sistema para manter uma experiência limpa e focada no conteúdo.
6. **Remoção de Textos Residuais:**
   - Limpeza de textos soltos em inglês como `Open a save file` no container de carregamento.

---

### 📱 C. Menu, Cabeçalho e Navegação Mobile
1. **Dashboard como Página Principal do Sistema:**
   - O Dashboard passou a ser a página principal do DXCore. Assim que qualquer save é carregado (ou ao acessar a raiz do sistema com save ativo), o usuário é direcionado imediatamente para o Dashboard (`/dashboard`).
2. **Renomeação de "Início" para "Treinador" (`/trainer`):**
   - A antiga rota de início foi rebatizada como **"Treinador"** (`/trainer`), refletindo com precisão seu conteúdo de perfil e edição dos dados gerais do treinador (nome, OT, TID, SID, dinheiro, gênero e backup). O ícone foi atualizado para o perfil de usuário (`UserOutlined`).
3. **Ocultação dos Itens Internos sem Save:**
   - Enquanto o usuário não carregar um save (arquivo, save vazio ou demo), os itens internos do menu permanecem ocultos para evitar redirecionamentos indesejados.
4. **Cabeçalho com Efeito Sticky Dinâmico:**
   - O menu superior recolhe-se suavemente ao rolar para baixo e reaparece instantaneamente ao detectar rolagem para cima.
5. **Badge do Treinador em Azul Padrão:**
   - A identificação do Treinador Original (OT) no topo foi alterada para a tonalidade azul ciano característica do DXCore.
6. **Mobile - Reorganização do Topo:**
   - No mobile, o indicador/estrela foi posicionado como primeiro item à esquerda da badge do nome do jogo ativo.
7. **Barra de Navegação Mobile Inferior (App-like Bottom Bar):**
   - Ícones ampliados para `24px` de altura e largura, com remoção dos textos inferiores para máxima clareza e toque ágil em smartphones.
   - Atalhos essenciais: **Dashboard**, **Treinador**, **Party**, **Box** e **Itens**.
   - Integração com efeito de **fade-out** (transparência/ocultação suave) ao rolar a página e retorno imediato ao interromper a rolagem.
8. **Padronização do Botão Voltar:**
   - Removido o botão voltar de páginas principais (ex: `/dashboard`, `/trainer`, `/party`, `/pokemon-box`, `/items`), mantendo-o apenas em sub-páginas de edição ou navegação secundária.
   - Utilização estrita do componente `PageHeader` padrão em texto sem cards cinzas envoltórios.

---

### 📦 D. Gerenciador de Caixas Pokémon (`/pokemon-box`)
1. **Mover Pokémon entre Caixas em Lote (Restaurado e Aprimorado):**
   - Restauração completa do comando `box.moveToBox` no motor C# (.NET) e no SDK WebAssembly.
   - Modal com listagem de todas as caixas do save, cálculo de vagas disponíveis e movimentação instantânea com suporte a seleção múltipla.
2. **Transferência Direta de Box para a Equipe (Party):**
   - Nova ação "Mover para a Equipe" no menu de ações da Box, permitindo transferir Pokémon selecionados diretamente para vagas disponíveis na equipe ativa (`box.moveToParty`), com validação do limite de 6 membros.
3. **Remoção de Ícones dos Botões de Ações:**
   - O botão principal de "Ações" agora apresenta um design mais limpo e direto, sem o ícone de grade no cabeçalho do botão.
4. **Filtro de Classificação Shiny / Normal:**
   - Opção para listar apenas espécimes Shiny ou apenas normais.
5. **Filtro por Tipos Elementais:**
   - Seletor com todos os 18 tipos Pokémon acompanhados de suas cores oficiais (Fogo, Água, Grama, Dragão, etc.).
6. **Agrupamento de Filtros em Popover com Ícone:**
   - Todos os filtros foram agrupados sob um único botão de filtro com badge de contagem de filtros ativos e ação de "Limpar Filtros".
7. **Busca Expansível com Overlay Translúcido:**
   - O campo de pesquisa agora é acionado por um ícone de lupa discreto, abrindo um modal de busca centralizado com overlay escurecido azul DXCore.
8. **Alinhamento dos Controles à Direita:**
   - Filtros, alternador de visualização e busca foram alinhados uniformemente à extrema direita.
9. **Modo Cards (Galeria) com Imagem HD Compacta (80x80px):**
   - Na tela principal das caixas, os cards utilizam a arte oficial em alta resolução (HD), porém com dimensões compactas padronizadas em 80x80 pixels. Isso reduz drasticamente o scroll vertical na tela de caixas, enquanto a vitrine do editor de Pokémon continua exibindo a arte oficial em escala ampliada.
10. **Paginação Responsiva com Contador Superior:**
   - O contador de total de Pokémon foi reposicionado acima dos botões de página com suporte a flex-wrap, evitando quebras de layout em telas de smartphones mesmo com dezenas de páginas.

---

### 👥 E. Equipe Ativa (`/party`)
1. **Transferência de Pokémon da Party para o Box:**
   - Nova ação "Mover para o Box" no menu de ações da Party, permitindo enviar Pokémon selecionados para qualquer caixa escolhida pelo modal interativo de caixas.
   - **Regra de proteção:** Validação estrita para impedir que a equipe fique vazia (a equipe deve manter sempre no mínimo 1 Pokémon, de acordo com as regras originais dos jogos Pokémon).
2. **Novo Ícone de Batalha (Espadas Cruzadas ⚔️):**
   - O ícone que representa a Party nos menus (Menu Lateral Desktop, Barra de Navegação Inferior Mobile, catálogo de recursos e atalhos rápidos) foi atualizado para o `BattleIcon` (espadas cruzadas de batalha), transmitindo a identidade autêntica de equipe de batalha Pokémon em vez de um ícone corporativo de grupo de pessoas (`TeamOutlined`).
3. **Remoção do Ícone do Botão de Ações:**
   - O botão de "Ações" da Party foi padronizado sem ícone para uma interface uniforme e minimalista.
4. **Correção da Badge de Quantidade:**
   - Ajustada com regras de `flex-wrap` e largura flexível para nunca quebrar ou ser cortada em telas menores.
5. **Remoção do Campo de Busca na Party:**
   - O campo de pesquisa foi retirado da tela da Party por ser desnecessário em uma equipe fixa de no máximo 6 Pokémon.
6. **Alinhamento Consistente:**
   - Alinhamento dos controles à direita, combinando visualmente com a tela de caixas.

---

### ⚡ F. Editor de Pokémon (`/pokemon/:source/:id`)
1. **Layout Vitrine Proporcional (Showcase):**
   - Criação do layout moderno com arte oficial grande em alta definição.
   - **Responsividade proporcional:**
     - Em telas médias/grandes (`lg`): divisão 40% vitrine / 60% formulário.
     - Em telas extragrandes (`xl`): divisão 30% vitrine / 70% formulário.
2. **Destaque Exclusivo de Shinies:**
   - A badge "Normal" foi removida. O sistema agora destaca visualmente apenas os Pokémon que forem efetivamente "Shiny".
3. **Salvar Sem Redirecionar:**
   - Ao clicar em salvar, o editor grava as alterações na sessão do WebAssembly e mantém o usuário na página de edição, exibindo um alerta de sucesso no topo.
   - O botão de retorno foi removido de dentro do alerta para um fluxo de edição contínuo e sem distrações.
4. **Aba de Fraquezas Elementais (Type Matchups):**
   - Cálculo automático das fraquezas e resistências (4x, 2x, 1x, 0.5x, 0.25x, 0x) da tipagem da espécie editada.
5. **Barras Coloridas de Estatísticas:**
   - Indicadores visuais de IVs, EVs e Stats com cores dedicadas para HP (verde), Ataque (laranja), Defesa (amarelo), Atq. Esp. (azul), Def. Esp. (roxo) e Velocidade (rosa).
6. **Seletor de Natureza Livre & Transparente:**
   - **Livre Escolha das 25 Naturezas:** Permite a livre alteração de natureza em qualquer Pokémon da Gen 3 em diante, mantendo a flexibilidade total de edição para saves offline e emuladores sem travar opções.
   - **Efeitos Reais de Atributos:** Todas as opções exibem com clareza o bônus/penalidade real nos status (`+Atk / -SpA` ou `Neutra`), com a natureza atual sinalizada pela tag azul `<Tag color="blue">Atual</Tag>`.
   - **Busca Rápida Integrada:** Permite filtrar instantaneamente tanto pelo nome da natureza quanto pelo atributo modificado (ex: buscar "Ataque", "Speed", "Neutra").
7. **Novo Banner Amigável e Multilíngue de Legitimidade (Substituição do "Not legal"):**
   - **Eliminação do Alerta Vermelho de Erro Crítico:** Substituição do antigo banner vermelho e confuso do PKHeX por um componente visual moderno e acolhedor em tom âmbar (`warning`).
   - **Disponível nos 3 Idiomas (PT-BR, US e ES):**
     - **Título Claro:** *"Aviso de Legitimidade (Modificação Detectada)"* / *"Legitimacy Notice (Modification Detected)"* / *"Aviso de Legitimidad (Modificación Detectada)"*.
     - **Texto Explicativo:** Esclarece explicitamente ao jogador que o Pokémon funciona e batalha normalmente na campanha offline e em emuladores, e que a notificação diz respeito apenas a transferências para serviços online (Pokémon HOME) ou torneios competitivos oficiais da Nintendo.
     - **Gaveta Expansível de Detalhes Técnicos:** Botão *"Detalhes técnicos da auditoria"* que exibe as pendências categorizadas com badges coloridas (`PID / Natureza`, `Golpes`, `Encontro`, `Habilidade`), tradução amigável do motivo e a mensagem técnica original do PKHeX em fonte monoespaçada.
8. **Uniformização de Altura dos Containers de Edição:**
   - Campos de Apelido, PID, Tipos e Características ajustados de 32px para o padrão de 38px com padding harmônico.

---

### 🗃️ G. Modais, Histórico e Backups
1. **Disposição Vertical de Informações:**
   - Reformulação dos modais que usavam tabelas horizontais compactas para uma disposição vertical com dados estruturados um abaixo do outro.
2. **Histórico de Backups em Cards Interativos:**
   - O histórico de pontos de restauração foi transformado em cards com horário relativo, versão do jogo, indicador de backup manual/automático e botão de restauração imediata.

---

### 📖 H. Catálogo de Recursos (`/features`)
1. **Padronização com o Restante do Sistema:**
   - Removido o card cinza que envolvia o cabeçalho.
   - Substituição do botão quadrado com borda pelo botão voltar oficial em texto (`PageHeader`).
2. **Adaptação Mobile:**
   - Badges "Adicionado / Sistema" posicionados acima do título de cada funcionalidade.
   - Seletor de abas (`Segmented`) resumido com rolagem horizontal touch fluida para evitar quebra de linhas.
3. **Catálogo Atualizado:**
   - Inclusão de todas as adições exclusivas do DXCore e remoção de recursos descartados.

---

### 🚀 I. Automação e Publicação
1. **Script de Deploy Automatizado (.bat):**
   - Criação de script local em lote para build do WebAssembly/React, publicação no repositório GitHub e verificação de disponibilidade via HTTP com feedback visual do link final.

---

### 📊 J. Dashboard do Jogo & Rastreador da Pokédex (`/dashboard`)
1. **Página Principal do Sistema:**
   - Adicionada rota dedicada `/dashboard` como a página principal logo após abrir um save, oferecendo um panorama imediato de todo o jogo.
   - Design moderno alinhado à identidade visual do DXCore, cards responsivos e **zero tabelas**, garantindo excelente legibilidade em smartphones e tablets.
   - Cabeçalho limpo sem botões redundantes.
2. **Cards Hero KPI no Topo:**
   - **Progresso da Pokédex:** barra de progresso com porcentagem calculada, total de espécies no jogo, contadores de espécies Registradas, Apenas Vistas e Em Falta.
   - **Armazenamento:** porcentagem de ocupação das caixas (total de Pokémon vs. capacidade total), contagem de Shinies ✨, Pokémon no Nível 100 🏆 e membros na equipe ativa 👥.
   - **Insígnias de Ginásio:** total conquistado com barra de progresso e indicador de Campeão da Região ao completar todas.
   - **Ficha do Treinador:** nome do treinador (OT), Trainer ID (TID/SID), tempo de jogo decorrido e dinheiro/Battle Points em carteira.
3. **Diferenciação Visual das Abas Mãe e Alinhamento Mobile:**
   - O conteúdo de cada aba principal (**Rastreador**, **Estatísticas da Coleção** e **Ficha & Insígnias**) agora é envolvido em um painel com fundo diferenciado e bordas suaves, destacando o conteúdo da aba em relação ao corpo da página.
   - Centralização perfeita dos seletores e botões de filtro no mobile (`justify="center"`), eliminando desalinhamentos em telas estreitas.
4. **Rastreador da Pokédex Padronizado e Focado em Completar o Jogo:**
   - Termos revisados e claros:
     - 🎯 **Faltantes:** total consolidado de tudo que falta registrar.
     - ❌ **Não capturados:** espécies nunca vistas nem capturadas.
     - 👁️ **Apenas Vistos:** espécies avistadas, mas pendentes de captura.
   - **Padronização Estrita dos Cards (mesmo design de Box e Party):**
     - Substituição da tag de texto por ícones representativos com Tooltip interativo (ao passar o mouse ou tocar): `<EyeFilled>` em âmbar para *Apenas Visto* e `<CloseCircleOutlined>` em cinza para *Não capturado*.
     - Ordem harmonizada no topo do card: **Ícone de status primeiro**, seguido imediatamente pelo número da Pokédex (`#0001`, `#0025`) em fonte monospace de 12px.
     - Título da espécie em 14px em negrito e badges elementares com tamanho compacto.
     - Imagem centralizada padronizada em `80x80px`.
     - Cards hoverable clicáveis com cantos arredondados de 10px e padding uniforme.
5. **Modal "Como Capturar / Obter" (Guia Completo e Ciente da Geração):**
   - Ao clicar em qualquer Pokémon faltante ou visto na lista do rastreador, abre-se um modal dedicado com:
     - 📍 **Resolução Real de Locais de Captura:** Correção no motor C# (`Encounter.cs`) que resolvia incorretamente os locais de gerações antigas como `(Unknown)`. Agora utiliza a tabela de locais de encontro de cada versão do jogo para apresentar o nome real da rota, caverna ou método (ex: *Floresta de Viridian*, *Rota 1*, *Usina Elétrica*).
     - 🧠 **Separação Histórica por Gerações:** O catálogo de obtenção agora reconhece a geração ativa do save. Exemplo: na Geração 1 (Red/Blue/Yellow), **Hitmonlee** e **Hitmonchan** são informados como prêmio único de NPC no Dojo de Luta de Saffron City (sem referenciar Tyrogue, que só surgiu na Gen 2). Casos como Lapras (Silph Co.), Eevee (Mansão de Celadon), Snorlax (estático adormecido), trocas de NPC (Jynx, Farfetch'd, Mr. Mime, Lickitung) e fósseis em Cinnabar possuem instruções históricas e fiéis à versão carregada.
     - 💡 **Instruções de Evolução e Trocas:** Base integrada com requisitos de evolução por nível, pedras elementares, trocas clássicas, trocas com item equipado, amizade/felicidade, beleza e reviver de fósseis.
     - 🔗 **Navegação Interativa de Pré-evolução:** Botão direto para inspecionar os locais de captura da forma anterior da espécie.
6. **Insígnias Oficiais de Ginásio:**
   - Substituição de ícones genéricos por artes gráficas oficiais das insígnias de acordo com a região e versão do jogo (Kanto, Johto, Hoenn, etc.).
   - Insígnias conquistadas recebem acabamento cromado/dourado com efeito de glow luminiscente suave (`drop-shadow`); insígnias pendentes são apresentadas em tom preto e branco suave (`grayscale`).
7. **Estatísticas da Coleção (Collection Analytics):**
   - **Distribuição por Tipos Elementares:** gráficos de barra horizontais com as cores oficiais de cada tipo, quantidade de Pokémon na coleção e porcentagem de representação.
   - **Galeria de Shinies ✨:** vitrine com todos os Pokémon brilhantes presentes no save, seus apelidos, níveis e atalhos diretos.
   - **Destaques Nível 100 🏆:** galeria dos Pokémon maximizados até o nível 100.
   - **Composição da Equipe Atual 👥:** cards detalhados dos 6 Pokémon da Party com níveis, apelidos e tipos.
8. **Integração no Motor C# (.NET / Engine) e Resiliência de Troca de Save:**
   - Criação e compilação da query `species.pokedex` nos hosts Debug e Release do motor WASM C#, sincronizando os binários do WebAssembly (`dotnet build` e `dotnet publish`) e o gerador de tipos (`PKHeX.Everywhere.Engine.CodeGen`), eliminando em definitivo a mensagem de `Unknown call 'species.pokedex'`.
   - Mapeamento eficiente dos bits de Pokédex do save (`GetSeen` e `GetCaught`) com validações defensivas de limites de espécies e suporte a gerações 1 a 9.
   - Tratamento resiliente na troca de saves na mesma sessão do navegador, permitindo carregar saves sucessivos sem erros de cache ou chamadas inválidas.

---

## 🚫 3. O Que Foi REMOVIDO e NÃO Será Mais Utilizado

Para manter o DXCore leve, rápido, seguro e focado, os seguintes itens foram totalmente eliminados:

1. **Sistema de Plugins (Plugins Legados):**
   - **O que era:** Um subsistema antigo do PKHeX-web para instalação e execução de complementos via JavaScript externo.
   - **Por que foi removido:** Causava instabilidades de compatibilidade, requeria permissões e fontes externas inseguras e não faz parte da proposta moderna do DXCore.
   - **Remoções feitas:** Rota `/plugins`, tela de gerenciamento de complementos, menus, chamadas de ciclo de vida e todas as dezenas de chaves de tradução em Português, Inglês e Espanhol, além de exclusão das menções nos Termos de Uso e Política de Privacidade.
2. **Anúncios e Banners Publicitários:**
   - **O que era:** Slots para Google AdSense e scripts de rastreamento de anúncios.
   - **Por que foi removido:** Para oferecer uma experiência limpa, rápida, sem popups, sem quebra de layout e com respeito total à privacidade do usuário.
3. **Botão Voltar em Páginas Principais:**
   - **O que era:** Botões de retorno ao lado do título em telas principais (como `/party`, `/pokemon-box`, `/items`).
   - **Por que foi removido:** Em telas principais o usuário navega pelo menu ou pela barra inferior mobile; o botão voltar faz sentido exclusivamente em sub-páginas de detalhe ou edição.
4. **Rodapé em Páginas Internas:**
   - **O que era:** Um rodapé com textos e links repetidos no final de todas as telas.
   - **Por que foi removido:** Para despoluir a navegação de páginas densas (equipe, caixas, editor, itens). O rodapé e as flags de idioma foram preservados exclusivamente na tela inicial de carregamento de saves.
5. **Campo de Busca na Equipe Ativa (Party):**
   - **O que era:** Uma barra de busca de texto na página `/party`.
   - **Por que foi removido:** A equipe é limitada a 6 Pokémon, tornando a busca redundante e poluindo a barra superior.
5. **Dependência de Servidor Remoto / Nuvem:**
   - O DXCore roda 100% no navegador do usuário utilizando Microsoft .NET WebAssembly (WASM). Nenhum arquivo de save é enviado para servidores externos.
