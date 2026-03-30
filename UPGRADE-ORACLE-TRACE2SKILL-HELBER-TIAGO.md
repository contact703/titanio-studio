# 🔮 Upgrade: Oracle + Trace2Skill + ShotStream + Agentes Honestos

> **Para:** Claw do Helber e Claw do Tiago
> **Data:** 30/03/2026

---

## Novos Especialistas

### 🔮 Oracle (39º especialista)
Estrategista visionário. Gera relatório semanal automático.
- Coleta dados de 20+ fontes (HackerNews, GitHub, Reddit 6 subs, Product Hunt, HuggingFace, Google Trends)
- Analisa tendências, detecta oportunidades, mapeia riscos
- Entrega 5 próximos passos toda semana
- Automação: collector sábado 22h → relatório domingo 10h

### 🔓 Red Team Hacker (38º)
Segurança ofensiva. Testa nossos sistemas pra encontrar vulnerabilidades.
- Pentest ético (só nossos sistemas)
- Trabalha em par com Security Guardian (Blue Team)

### 📈 Traffic Master (37º)
Tráfego pago especializado.
- Google Ads, Meta Ads, TikTok Ads, YouTube Ads
- Foco em cinema (H2O Films)

---

## Novas Features

### Trace2Skill (`bin/titanio-trace2skill.sh`)
Transfer learning entre especialistas. Lições universais de um especialista são compartilhadas com todos.
```bash
scp contacttitanio@192.168.18.174:bin/titanio-trace2skill.sh ~/workspace/bin/
chmod +x ~/workspace/bin/titanio-trace2skill.sh
bash bin/titanio-trace2skill.sh
```

### Oracle Intelligence Collector
Bot que coleta 59+ items de 20 fontes toda semana.
```bash
scp contacttitanio@192.168.18.174:projetos/oracle/bots/*.sh ~/workspace/projetos/oracle/bots/
chmod +x ~/workspace/projetos/oracle/bots/*.sh
```

### ShotStream (vídeos dinâmicos)
Upgrade do Titanio Media: Ken Burns zoom + crossfade entre imagens. Não é mais slideshow.

### "Agentes Honestos" no SOUL.md
Pilar de marca: nossos agentes discordam quando necessário. Confiança > conveniência.

---

## LaunchAgents Novos

```bash
# Oracle Collector (sábado 22h)
# Oracle Report (domingo 10h)
# Copiar plists do Mac Eduardo e ajustar paths
scp contacttitanio@192.168.18.174:~/Library/LaunchAgents/com.tita.oracle*.plist ~/Library/LaunchAgents/
# Ajustar WORKSPACE_PATH e carregar
launchctl load ~/Library/LaunchAgents/com.tita.oracle.plist
launchctl load ~/Library/LaunchAgents/com.tita.oracle-collector.plist
```

---

## Checklist
- [ ] Copiar 3 novos scripts (trace2skill, oracle collector, oracle report)
- [ ] Copiar LaunchAgents Oracle
- [ ] Ajustar paths
- [ ] `bash bin/titanio-trace2skill.sh` funciona
- [ ] `launchctl list | grep oracle` mostra 2 agentes
- [ ] SOUL.md com "Agentes Honestos"
