# Amostras de sites gerados

Cópia dos 18 sites gerados até **27/07/2026**, guardada como referência visual.
Nada aqui é usado pelo sistema — é acervo. Pode abrir qualquer um no navegador
para comparar com o que o gerador produz hoje.

## Como ler estes arquivos

Eles vêm de **duas gerações diferentes do motor**, e isso muda o que cada um
prova.

### Geração nova — compilador de templates

Feitos por `template_compiler.py`, a partir dos templates preparados em pt-BR.

```
academia_corpo_livre      construtora_alicerce     joalheria_aurum
loja_de_coisas            padaria_doce_manh        pet_feliz
pizzaria_forno_di_pietra  pousada_recanto_verde    studio_bella_unhas
barbearia_cruz            fogo_vivo_steakhouse     matheus_rosaria_bar
oficina_do_z
```

Idioma `pt-BR`, sem o rastreador do 77lib, contatos do próprio lead, SEO
preenchido. São a referência do que o sistema entrega hoje.

### Geração antiga — motor lib77 original

```
after_burguer___hamburgueria    gran_roque_hamburgueria
matheus___rosaria_bar           oficina_do_ze            padaria_doce_manha
```

Guardados porque mostram como o produto era, e porque alguns têm **fotos
reais do Google Places** que os novos ainda não têm. Mas contêm defeitos
graves — não use nenhum como modelo de qualidade:

- `lang="fr"` — o site se declara francês para o Google
- Google Analytics do 77lib embutido
- `tel:+31772086200` — telefone da agência holandesa
- `href="https://wa.me/55(16) 99999-9999"` — link de WhatsApp **quebrado**,
  com parênteses e espaço dentro da URL
- Texto em francês em várias seções

## O que estas amostras ensinaram

Todos os 18 saem do mesmo layout base (`digital-creative-30`), o que confirmou
que **um único template bem-feito serve para todos os nichos** — a variação
que importa vem dos dados e das fotos, não de trocar o layout.

Também mostraram que trocar as imagens não basta: o texto das seções ainda
cumpre o papel de um site de agência de design ("Realizações", "Na mídia",
Behance, Dribbble). É o que o template base novo vem resolver.
