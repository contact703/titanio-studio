# 🎬 Vídeo 5: I Built an AI Agent Army with Openclaw to Make 1M/year
**URL:** https://www.youtube.com/watch?v=3hgXhB_Wy2U
**Canal:** @codingknowledge (harry)
**Analisado:** 2026-03-26 10:49 BRT

## Conteúdo Bruto Extraído
```
[10:49:23] 📥 Baixando transcrição/descrição: I Built an AI Agent Army with Openclaw to Make 1M/year
TÍTULO: I Built an AI Agent Army with Openclaw to Make 1M/year
CANAL: Dubibubii
DURAÇÃO: 13:56
VIEWS: 38553
DATA: 20260228
DESCRIÇÃO:
AUTO APP FACTORY SIGN UP: https://manalabs.wtf/appfactory
LARRYBRAIN: https://larrybrain.com/dubi-k

In this video, I break down the exact autonomous AI app factory I built using OpenClaw, Claude Code, and 11 specialized AI agents running 24/7.

This system researches app ideas, validates them, builds the apps, reviews the code, adds monetization, designs the icon, creates screenshots, generates promo videos, and prepares everything for App Store submission with almost no manual input.

Just recently, it built 7 apps in a single afternoon while using less than 5% of my OpenClaw context window.

Inside this breakdown, I cover:

• how my 11-agent system is structured
• why I rebuilt my OpenClaw setup 3 times before it finally worked
• how I solved context bloat by turning OpenClaw into an orchestrator instead of the builder
• the 9-step framework every app goes through from idea to App Store
• the exact AI models I use for building, reviewing, routing, and logging
• how the factory handles quality control and rejection prevention
• how each app gets monetized with StoreKit
• how I plan to automate the marketing engine using Larry and niche content accounts
• how promo videos are generated automatically with Remotion inside Claude Code

This is not about building one perfect app.

It is about building a pipeline that ships fast, learns fast, and improves with every release.

If you are interested in AI agents, OpenClaw, Claude Code, autonomous businesses, or building profitable apps with AI, this video will show you the blueprint I am using right now.

I’m Dubi, a former marketer turned AI builder, and I’m documenting my challenge to reach $100K using AI.

If you want early access to the autonomous app factory, use the first link above.

If you want Larry and the skills stack behind the marketing engine, use the Larrybrain link above.

Join my community here:
https://discord.gg/e2J2cnDymf

Follow me on X: https://x.com/Dubibubiii

Watch my other video on how OpenClaw agents are already making real money: https://www.youtube.com/watch?v=v2cPHF5oXcI&t=118s

Subscribe if you want more videos on:
AI agents, OpenClaw, Claude Code, autonomous app businesses, AI monetization, vibecoding, and building with AI in public.

#OpenClaw #AIAgents #ClaudeCode #Vibecoding #BuildInPublic #AIApps #Automation #IndieHacker #AppBusiness #Entrepreneurship
CAPÍTULOS:
[youtube] Extracting URL: https://www.youtube.com/watch?v=3hgXhB_Wy2U
[youtube] 3hgXhB_Wy2U: Downloading webpage
[youtube] 3hgXhB_Wy2U: Downloading android vr player API JSON
[youtube] 3hgXhB_Wy2U: Downloading web player API JSON
[youtube] 3hgXhB_Wy2U: Downloading web safari player API JSON
[info] 3hgXhB_Wy2U: Downloading subtitles: en
[info] 3hgXhB_Wy2U: Downloading 1 format(s): 401+251
[info] Writing video subtitles to: /tmp/yt-subs-17375/I Built an AI Agent Army with Openclaw to Make 1M⧸year.en.vtt
[download] Destination: /tmp/yt-subs-17375/I Built an AI Agent Army with Openclaw to Make 1M⧸year.en.vtt
[download]    1.00KiB at  Unknown B/s (00:00:00)[download]    3.00KiB at  Unknown B/s (00:00:00)[download]    7.00KiB at  Unknown B/s (00:00:00)[download]   15.00KiB at  Unknown B/s (00:00:00)[download]   31.00KiB at   22.07MiB/s (00:00:00)[download]   63.00KiB at   21.97MiB/s (00:00:00)[download]  127.00KiB at    6.57MiB/s (00:00:00)[download]  134.59KiB at    6.65MiB/s (00:00:00)[download] 100% of  134.59KiB in 00:00:00 at 672.99KiB/s
TRANSCRIÇÃO (primeiros 3000 chars):
  I have 11 AI agents running 24/7 I have 11 AI agents running 24/7   I have 11 AI agents running 24/7 autonomously around the clock and my autonomously around the clock and my   autonomously around the clock and my OpenClaw agent manages all of them to OpenClaw agent manages all of them to   OpenClaw agent manages all of them to build profitable apps while I sleep. build profitable apps while I sleep.   build profitable apps while I sleep. Just yesterday, they built seven apps, Just yesterday, they built seven apps,   Just yesterday, they built seven apps, tested them, added payments, and tested them, added payments, and   tested them, added payments, and uploaded them to the app store, all in a uploaded them to the app store, all in a   uploaded them to the app store, all in a single afternoon using less than 5% of single afternoon using less than 5% of   single afternoon using less than 5% of my open clause context window. my open clause context window.   my open clause context window. &gt;&gt; All apps go through a ninestep rigorous &gt;&gt; All apps go through a ninestep rigorous   &gt;&gt; All apps go through a ninestep rigorous framework. things like research, idea framework. things like research, idea   framework. things like research, idea validation, building the app, validation, building the app,   validation, building the app, monetization strategies, designing the monetization strategies, designing the   monetization strategies, designing the icons, and even creating promo videos. icons, and even creating promo videos.   icons, and even creating promo videos. It took me three failed attempts to get It took me three failed attempts to get   It took me three failed attempts to get here, and over 100 hours of testing, and here, and over 100 hours of testing, and   here, and over 100 hours of testing, and I'm going to break down the exact I'm going to break down the exact   I'm going to break down the exact blueprint I used to build this thing, blueprint I used to build this thing,   blueprint I used to build this thing, the lessons that I learned along the the lessons that I learned along the   the lessons that I learned along the way, and how I plan to autonomously way, and how I plan to autonomously   way, and how I plan to autonomously market these apps to generate millions market these apps to generate millions   market these apps to generate millions of views. And if we haven't met yet, I'm of views. And if we haven't met yet, I'm   of views. And if we haven't met yet, I'm Doobie. I'm a former marketer who now Doobie. I'm a former marketer who now   Doobie. I'm a former marketer who now builds AI apps live on stream. I'm builds AI apps live on stream. I'm   builds AI apps live on stream. I'm currently documenting a challenge to currently documenting a challenge to   currently documenting a challenge to reach 100K using AI. And in just one reach 100K using AI. And in just one   reach 100K using AI. And in just one month, I've alread
```

## Análise do OpenRouter
ERROR: 'choices'

---
