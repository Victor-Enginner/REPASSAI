# Editor visual — primeira implementação

Em documentos HTML existentes e em previews legados recuperados, o painel permite selecionar elemento textual, editar texto literal, trocar fonte e desfazer até vinte alterações. Preview imediato sem chamadas de IA. Gravação explícita pelo serviço autenticado de projetos, preservando rascunho em caso de erro.

Fontes iniciais são famílias de sistema (Arial, Georgia, Verdana, Tahoma, Trebuchet MS, Courier New), não um pacote de fontes embutidas. Disponibilidade depende do dispositivo. A seleção permanece estável ao esvaziar um texto.

O HTML é analisado em documento inerte, nunca montado no DOM do painel. Textos entram por textContent, não por innerHTML. Preview permanece em iframe sandbox sem same-origin.

Evidências: `scripts/verificar-edicao-visual.mjs` valida texto hostil tratado literalmente, mudança de fonte, save/reopen e erro de gravação sem perder rascunho (API simulada). Build aprovado. Não equivale a teste com conta real.

Pendências do objetivo: seleção diretamente no canvas, movimentação/redimensionamento e edição de componentes, mídia, biblioteca de fontes locais licenciadas, schemas declarativos, geração procedural com todos os templates, QA responsivo completo, pesquisa e publicação. HTML arbitrário e blocos antigos fora do compilador continuam exigindo compatibilidade adicional.
