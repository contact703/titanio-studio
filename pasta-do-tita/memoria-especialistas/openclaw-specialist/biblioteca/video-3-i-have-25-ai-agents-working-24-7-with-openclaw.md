# 🎬 Vídeo 3: I have 25 AI Agents working 24/7 with Openclaw
**URL:** https://www.youtube.com/watch?v=zwV5qC1wS6M
**Canal:** @codingknowledge (harry)
**Analisado:** 2026-03-26 10:48 BRT

## Conteúdo Bruto Extraído
```
[10:48:55] 📥 Baixando transcrição/descrição: I have 25 AI Agents working 24/7 with Openclaw
TÍTULO: I have 25 AI Agents working 24/7 with Openclaw
CANAL: Clearmud
DURAÇÃO: 12:44
VIEWS: 105034
DATA: 20260212
DESCRIÇÃO:
I built a dashboard to manage my entire AI agent team — 25 agents, 3 AI chief of staff, voice standups, task tracking, and persistent memory. All from one screen.

In this video, I walk you through the Ops module of Muddy OS — an internal AI operations dashboard I built with React, TypeScript, Tailwind, and OpenClaw. You'll see the task manager, the org chart, voice standup meetings where AI chiefs debate strategy out loud, the framework that gives agents persistent identity, and living documentation that stays current as the system evolves.

Everything here is built with free, open-source tools. OpenClaw is free. Edge TTS is free. The dashboard is React + markdown files on a Ubuntu VM. 

No paid services, no fancy infrastructure. If you're running AI agents and want better visibility into what they're doing, this is for you.

⏱️ TIMESTAMPS:
0:00 - In This Video
0:26 - Ops Dashboard Preview
0:46 - Task Manager
1:40 - Org Chart
5:53 - Voice Standups (AI Meetings)
8:50 - Workspaces (Manage AI Agents)
11:15 - Documentation
11:48 - THANK YOU @steipete
12:14 - Closing Thoughts

🎥 RELATED VIDEOS:
No Mac Mini, No VPS Hosting → https://www.youtube.com/watch?v=D8FEYFbF7wk
The EASIEST Openclaw(Clawdbot) setup guide for Windows → https://www.youtube.com/watch?v=E3D8xEWysrI
3 Things You NEED TO DO After Install → https://www.youtube.com/watch?v=Sf-MEy5m0Y4

🧰 TOOLS FEATURED:
→ OpenClaw (AI Agent Framework): https://openclaw.ai
→ React 19 + TypeScript + Vite + Tailwind
→ Edge TTS (free text-to-speech by Microsoft)

💬 What would YOUR AI operations dashboard look like? What sections would you add? Drop a comment — I read every one.

Making AI simple and easy to use. For businesses, entrepreneurs, and creatives.

#AIAgents #OpenClaw #AIAutomation #AIDashboard #BuildWithAI #AITools #Clearmud #ReactDashboard #AIWorkflow #MuddyOS #VibeCoding #AITeam #OnePersonStartup #BuildInPublic #FreeAITools
CAPÍTULOS:
  0s — In This Video
  26s — Ops Dashboard Preview
  46s — Task Manager
  100s — Org Chart
  353s — Voice Standups (AI Meetings)
  530s — Workspaces (Manage AI Agents)
  675s — Documentation
  708s — THANK YOU @steipete
  734s — Closing Thoughts
[youtube] Extracting URL: https://www.youtube.com/watch?v=zwV5qC1wS6M
[youtube] zwV5qC1wS6M: Downloading webpage
[youtube] zwV5qC1wS6M: Downloading android vr player API JSON
[youtube] zwV5qC1wS6M: Downloading web player API JSON
[youtube] zwV5qC1wS6M: Downloading web safari player API JSON
[info] zwV5qC1wS6M: Downloading subtitles: en
[info] zwV5qC1wS6M: Downloading 1 format(s): 313+251
[info] Writing video subtitles to: /tmp/yt-subs-17375/I have 25 AI Agents working 24⧸7 with Openclaw.en.vtt
[download] Destination: /tmp/yt-subs-17375/I have 25 AI Agents working 24⧸7 with Openclaw.en.vtt
[download]    1.00KiB at  Unknown B/s (00:00:00)[download]    3.00KiB at  Unknown B/s (00:00:00)[download]    7.00KiB at  Unknown B/s (00:00:00)[download]   15.00KiB at   13.41MiB/s (00:00:00)[download]   31.00KiB at   22.26MiB/s (00:00:00)[download]   63.00KiB at   13.87MiB/s (00:00:00)[download]  102.21KiB at    7.17MiB/s (00:00:00)[download] 100% of  102.21KiB in 00:00:00 at 614.83KiB/s
TRANSCRIÇÃO (primeiros 3000 chars):
  I have 25 agents running 24/7 I have 25 agents running 24/7   I have 25 agents running 24/7 autonomously around the clock. I have a autonomously around the clock. I have a   autonomously around the clock. I have a CTO inspired by Elon Musk, a CMO CTO inspired by Elon Musk, a CMO   CTO inspired by Elon Musk, a CMO inspired by Gary Vaynerchuk, and then a inspired by Gary Vaynerchuk, and then a   inspired by Gary Vaynerchuk, and then a CRO inspired by Warren Buffett, and I CRO inspired by Warren Buffett, and I   CRO inspired by Warren Buffett, and I manage all of them from one dashboard manage all of them from one dashboard   manage all of them from one dashboard that I've been slowly building out and that I've been slowly building out and   that I've been slowly building out and improving on. Today, I'm going to show improving on. Today, I'm going to show   improving on. Today, I'm going to show you exactly how it works. So, without you exactly how it works. So, without   you exactly how it works. So, without squiroo, let's build. As you can see squiroo, let's build. As you can see   squiroo, let's build. As you can see here on the screen, here's Muddy OS. I here on the screen, here's Muddy OS. I   here on the screen, here's Muddy OS. I have different applications within it. have different applications within it.   have different applications within it. This is the operations application. I'm This is the operations application. I'm   This is the operations application. I'm not going to dig into these right now. not going to dig into these right now.   not going to dig into these right now. We'll save that for another video. But I We'll save that for another video. But I   We'll save that for another video. But I replicated, you know, a mix between replicated, you know, a mix between   replicated, you know, a mix between Windows and Mac, right? We put these Windows and Mac, right? We put these   Windows and Mac, right? We put these these icons on the top right, which these icons on the top right, which   these icons on the top right, which that's just the Windows guy and me. But that's just the Windows guy and me. But   that's just the Windows guy and me. But let's dig into the tabs, shall we? The let's dig into the tabs, shall we? The   let's dig into the tabs, shall we? The task manager shows off how many sessions task manager shows off how many sessions   task manager shows off how many sessions are running, what's idle, how many are running, what's idle, how many   are running, what's idle, how many tokens, what's the estimated cost. It tokens, what's the estimated cost. It   tokens, what's the estimated cost. It shows my model fleet that we utilize shows my model fleet that we utilize   shows my model fleet that we utilize which is Opus 4.6 for a lot of the heavy which is Opus 4.6 for a lot of the heavy   which is Opus 4.6 for a lot of the heavy lifting. We have a backup for Opus 4.5 lifting. We have a backup for Opus 4.5   lifting. We have a
```

## Análise do OpenRouter
ERROR: 'choices'

---
