# 🎮 Jogo ENEM

**Status:** ⏸️ Parado (último output: 21/03/2026)
**Custo:** R$ 0.00 (100% bots gratuitos)
**Engine:** Godot (GDScript)

---

## O Que É
Jogo educativo de ENEM gerado 100% por IA. Questões reais formatadas como RPG/quiz. Geração autônoma por 5 bots em paralelo usando modelos gratuitos.

## Stack
- **Modelos:** Nemotron (free) + StepFlash (free) + Phi3/Llama (local)
- **Orquestração:** N8n workflows + scripts bash
- **Game Engine:** Godot (GDScript)
- **Custo:** R$ 0.00

## Bots
| Bot | Função | Modelo |
|---|---|---|
| Game Designer | Estrutura do jogo | Nemotron |
| Content Creator | Questões ENEM | StepFlash |
| Code Generator | Código GDScript | Nemotron |
| QA Tester | Testes e bugs | StepFlash |
| Pixel Artist | Assets visuais | Phi3 |

## Estrutura
```
jogo-enem/
├── docs/          ← Documentação e status
├── outputs/       ← Outputs gerados pelos bots
├── prompts/       ← Prompts de cada bot
├── src/           ← Código fonte do jogo (futuro)
├── logs/          ← Logs de execução
├── orchestration.json
├── run-agents.sh
└── enem-game-continuous-dev.sh  ← Loop de 7 dias
```

## Como Rodar
```bash
# Ligar os bots
bash run-agents.sh

# OU ligar o loop contínuo de 7 dias
bash enem-game-continuous-dev.sh
```

## Próximos Passos
- [ ] Religar o loop contínuo
- [ ] Gerar mais questões (meta: 500)
- [ ] Montar build jogável no Godot
- [ ] Testar com pessoas reais
