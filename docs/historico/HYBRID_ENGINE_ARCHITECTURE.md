> **HISTÓRICO — não é referência.**
> Absorvido pela secao 4 do ARQUITETURA.md.
> A referência atual está em [../ARQUITETURA.md](../ARQUITETURA.md) e
> [../ROADMAP.md](../ROADMAP.md). Índice em [../README.md](../README.md).

# Arquitetura do Sistema Híbrido REPASSAI (95% Determinístico + 5% LLM)

> **Documento Oficial de Arquitetura de Software**  
> **Data:** 28/07/2026 | **Autor:** Arquiteto de Software Senior  
> **Filosofia:** "Regras e templates resolvem 95% dos casos. IA resolve os 5% de exceções."

---

## 📌 1. Visão Geral

O **REPASSAI Hybrid Engine** é um motor de geração de sites que prioriza **DETERMINISMO PURISTA** em 95% das requisições, recorrendo à inteligência artificial (LLM) apenas em casos estritamente necessários.

### Benefícios Medidos:
- **Custo:** R$ 0,00 por site no modo determinístico (economia de 99% em chamadas de API LLM).
- **Desempenho:** Compilação em **~0.7s** (vs 4.5s com LLM).
- **Confiabilidade:** Zero alucinações de marca, dados em português nativo e integridade determinística.

---

## 🏛️ 2. Pirâmide de Decisão (5 Camadas)

```text
┌──────────────────────────────────────────────┐
│  CAMADA 5: LLM Fallback (5% dos casos)       │ → Chatbot / Alterações / Nicho Exótico
├──────────────────────────────────────────────┤
│  CAMADA 4: Regras de Nicho & Categoria (40%) │ → Mapeamento de templates por categoria
├──────────────────────────────────────────────┤
│  CAMADA 3: Regras de Texto & Copywriting (40%)│ → Templates de copy por nicho
├──────────────────────────────────────────────┤
│  CAMADA 2: Validação & Sanitização (10%)    │ → Pydantic / Sanitizador E.164
├──────────────────────────────────────────────┤
│  CAMADA 1: Biblioteca de Assets (5%)         │ → Catalogo local (asset_library)
└──────────────────────────────────────────────┘
```

---

## 🛠️ 3. Regras de Disparo de LLM (Triggers Explicitos)

A inteligência artificial (LLM via `llm_gateway.py`) é ativada **SOMENTE E EXCLUSIVAMENTE** quando:

1. **Comando de Linguagem Natural no Chatbot:** O usuário digita uma instrução customizada no editor (ex: *"Mude o botão para azul e altere o título"*).
2. **Nicho Exótico sem Mapeamento:** O lead possui uma categoria completamente desconhecida que não coincide com nenhum padrão do `regras_categorizacao.py`.
3. **Prompt Livre de IA:** O usuário inicia a geração via aba *Descrever* fornecendo uma descrição longa e não estruturada.

Em todos os outros casos (varredura de leads, Google Places, templates catalogados), a geração é **100% determinística**.

---

## 📁 4. Estrutura de Arquivos

- `backend/hybrid_engine.py`: Orquestrador principal da decisão.
- `backend/rules/regras_validacao.py`: Sanitização de dados de contato (WhatsApp, E.164, Endereço).
- `backend/rules/regras_categorizacao.py`: Mapeamento determinístico de nichos comerciais.
- `backend/rules/regras_texto.py`: Gerador de textos e CTAs por segmento sem alucinação.
- `backend/test_hybrid_engine.py`: Testes unitários do motor híbrido.
