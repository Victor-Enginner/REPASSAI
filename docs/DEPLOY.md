# Colocar o REPASS AI no ar

> **Leia isto antes:** esta infraestrutura **nunca foi executada**. O
> `Dockerfile` e o `docker-compose.yml` existiam no repositório sem nunca
> terem sido rodados — o Docker não está instalado na máquina de
> desenvolvimento. Cada passo abaixo foi revisado à mão, mas revisão não é
> execução. Espere encontrar erro, e use a seção 7 quando encontrar.

Objetivo: o REPASS existir fora do computador do operador, de graça.

---

## 1. A máquina

**Oracle Cloud Always Free** — ARM Ampere, grátis para sempre, sem cobrança
no cartão. Em 2026 a cota caiu de 4 vCPU/24 GB para **2 vCPU/12 GB**, o que
continua folgado: o backend é um servidor HTTP em Python que consome quase
nada.

Ao criar a instância:

| Campo | Valor |
|---|---|
| Shape | `VM.Standard.A1.Flex` (ARM) |
| OCPU / memória | 2 / 12 GB |
| Imagem | Ubuntu 22.04 ou 24.04 |
| Chave SSH | gere e **guarde** — sem ela não há acesso |

Duas armadilhas conhecidas:

- **"Out of capacity"** é comum nas regiões ARM. Tente outra vez, ou outro
  domínio de disponibilidade.
- **A região é escolhida uma vez só** e não muda depois. Escolha a mais
  próxima do Brasil (`sa-saopaulo-1` ou `sa-vinhedo-1`).

---

## 2. Abrir a porta — nos DOIS lugares

Este é o erro que mais faz gente achar que a Oracle está quebrada. Há
**dois** firewalls, e abrir só um não adianta.

**a) Security List** (painel da Oracle): Networking → VCN → Security Lists →
adicione uma regra de entrada para `0.0.0.0/0`, TCP, porta **80**.

**b) iptables do Ubuntu** (dentro da máquina): a imagem da Oracle vem com
tudo bloqueado por padrão.

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo netfilter-persistent save
```

---

## 3. Docker

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

Saia e entre no SSH de novo para o grupo valer. Confira:

```bash
docker compose version
```

---

## 4. O código e os segredos

```bash
git clone <URL_DO_REPOSITORIO> repass && cd repass
cp backend/.env.example backend/.env
nano backend/.env
```

**O compose não sobe sem `backend/.env`** — ele falha dizendo que o arquivo
não existe. Isso é proposital: subir sem segredo nenhum seria pior.

Preencha, no mínimo:

| Variável | Por quê |
|---|---|
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` | **Obrigatórias.** Em produção o boot aborta sem elas |
| `R2_*` | Sem isso o site fica só no disco do servidor |
| `GROQ_API_KEYS` (ou outra de IA) | Só para importar template novo |
| `GOOGLE_PLACES_API_KEY` | Opcional — a varredura roda pelo OpenStreetMap, de graça |

**Nunca** versione este arquivo. Ele já está no `.gitignore`.

---

## 5. Subir

Troque `SEU_IP` pelo IP público da instância:

```bash
export REPASS_PUBLIC_URL="http://SEU_IP"
export REPASS_HTTP_PORT=80
docker compose up -d --build
```

A primeira construção demora — está compilando o frontend inteiro em ARM.

---

## 6. Conferir, na ordem

```bash
docker compose ps
```

Os dois serviços devem aparecer como `running`, o backend como `healthy`.

```bash
curl -s localhost/healthz
curl -s localhost/api/health
curl -s localhost/api/auth/status
```

Em `auth/status`, o que prova que subiu como produção:

```
"modo": "multiusuario"    "auth_exigida": true    "dev_single_user": false
```

Se `auth_exigida` vier `false`, **pare**: a API está aberta na internet.
Confira `REPASS_ENV` no compose.

Por último, abra `http://SEU_IP` no navegador.

---

## 7. Quando quebrar

Ordem de probabilidade, dado que nada disso foi testado:

**`env file ./backend/.env not found`**
Passo 4. O arquivo precisa existir antes do `up`.

**Frontend não sobe e fica esperando**
Ele só inicia quando o backend fica `healthy`. O culpado é o backend:
```bash
docker compose logs backend --tail 50
```

**Backend reinicia em laço**
Quase sempre Supabase faltando. Em produção o boot aborta de propósito —
melhor não subir do que subir sem autenticação.

**Build falha em alguma dependência**
As imagens base são multi-arquitetura e o backend só precisa de `boto3` e
`python-dotenv`, então é improvável. Se acontecer, é no frontend: mande o
log.

**Sobe, mas o navegador não abre**
Firewall. Volte ao passo 2 e confira os **dois**.

**Imagem de lead quebrada**
`REPASS_PUBLIC_URL` ficou como localhost. Esse endereço é gravado dentro de
cada lead.

---

## 8. O que este deploy ainda NÃO resolve

Honestidade sobre o alcance:

- **Sem HTTPS.** É `http://IP`. Cookie de sessão sem `Secure`, e o navegador
  vai reclamar. Próximo passo natural: um domínio + Caddy ou Cloudflare
  Tunnel, que resolve certificado sozinho.
- **Segredos ainda em arquivo.** Melhor que no notebook, longe de um cofre.
- **Sem backup do volume.** `./backend/data` mora no disco da instância.
  O que está no Supabase e no R2 está seguro; o resto, não.
- **Deploy é manual.** Nova versão = `git pull && docker compose up -d --build`.
- **Sem sandbox para template de terceiro.** Continua o débito estrutural:
  o `originkit_engine` executa `npx` no host. Dentro do container o estrago
  fica contido, o que já é melhor que hoje — mas não é isolamento de
  verdade.

---

## 9. Atualizar depois

```bash
cd repass && git pull && docker compose up -d --build
docker compose ps
```
