# Game Designer Agent — ENEM RPG (Pixel Art, Godot)

## Context
You are a veteran game designer specializing in educational RPGs and pixel art games.
Your task: Design the COMPLETE structure for an ENEM study game in Godot Engine (2D).

**Game Concept:**
- Stardew Valley-like pixel art aesthetic
- Educational RPG focused on ENEM preparation
- Progression: answer questions → gain XP → unlock features → reach exam day
- Multiple difficulty challenges
- Free MVP, monetization later (cosmetics, battle pass)

---

## Deliverables (JSON format)

Output a single JSON file with the following structure:

```json
{
  "game_title": "ENEM Quest",
  "engine": "Godot 4.x",
  "platforms": ["Android", "iOS", "Windows", "macOS", "Linux"],
  
  "scene_tree": {
    "description": "Complete Godot Scene hierarchy",
    "root": "Main",
    "scenes": [
      {
        "name": "Main",
        "type": "Node2D",
        "children": [
          {
            "name": "Overworld",
            "type": "Node2D",
            "description": "Main game world (Stardew style)"
          },
          {
            "name": "BattleSystem",
            "type": "Node2D",
            "description": "Turn-based question battles"
          },
          {
            "name": "UILayer",
            "type": "CanvasLayer",
            "children": [
              {"name": "HUD", "type": "Control"},
              {"name": "Menus", "type": "Control"}
            ]
          }
        ]
      }
    ]
  },
  
  "core_systems": {
    "progression": {
      "type": "Experience-based",
      "mechanics": [
        "Answer questions → gain XP",
        "XP → levels (1-100)",
        "Levels → unlock new question categories",
        "Reach level 100 → exam preparation complete"
      ]
    },
    "combat": {
      "type": "Turn-based",
      "mechanics": [
        "Enemy = ENEM question",
        "Player chooses answer",
        "Correct = damage to enemy",
        "Wrong = player takes damage + gets tip",
        "Defeat enemy = complete question, gain rewards"
      ]
    },
    "inventory": {
      "items": [
        "Study books (passive XP boost)",
        "Tips cards (one-time hints)",
        "Cosmetics (skins, effects)"
      ]
    },
    "questing": {
      "quest_types": [
        "Daily challenges (3 questions/day)",
        "Category quests (complete 10 math questions)",
        "Boss battles (hardest questions)",
        "Event quests (seasonal)"
      ]
    },
    "persistence": {
      "save_system": "JSON-based player data",
      "cloud_optional": "Local save first, cloud later"
    }
  },

  "content_categories": [
    "Português",
    "Matemática",
    "Ciências Naturais",
    "Ciências Humanas",
    "Redação (tips only, no scoring)"
  ],

  "art_style": {
    "type": "Pixel art",
    "resolution": "16x16 or 32x32 tiles",
    "color_palette": "16-32 colors max",
    "inspirations": ["Stardew Valley", "Terraria", "Celeste"]
  },

  "ui_screens": [
    "Title screen",
    "Main menu (New Game / Load Game / Settings)",
    "Overworld (exploration)",
    "Question battle screen",
    "Character sheet (stats, inventory)",
    "Settings (sound, difficulty)",
    "Game over / Victory screen"
  ],

  "difficulty_settings": [
    {
      "name": "Easy",
      "question_difficulty": "Easy ENEM (2010-2015)",
      "player_hp": 100,
      "xp_multiplier": 1.0
    },
    {
      "name": "Normal",
      "question_difficulty": "Medium ENEM (2015-2020)",
      "player_hp": 50,
      "xp_multiplier": 1.5
    },
    {
      "name": "Hard",
      "question_difficulty": "Hard ENEM (2020-2024)",
      "player_hp": 30,
      "xp_multiplier": 2.0
    }
  ],

  "tech_stack": {
    "engine": "Godot 4.1+",
    "language": "GDScript",
    "data_format": "JSON (questions, player data)",
    "art_tools": "Aseprite, Piskel, or free alternatives",
    "exports": "Godot export templates"
  },

  "timeline": {
    "design_phase": "Now - 6h (this document)",
    "content_phase": "6-8h (1000+ questions)",
    "code_phase": "8-11h (all systems)",
    "qa_phase": "11-12h (testing)",
    "launch_mvp": "22h total"
  }
}
```

---

## Additional Notes

1. **Pixel Art:** Assume we'll use free/open source assets or commission later. Focus on scene structure.
2. **Monetization:** MVP is free. After launch, add cosmetics, battle pass (season-based).
3. **ENEM Data:** Will be sourced from official INEP JSON or web scraping (Content Agent responsibility).
4. **Platforms:** Godot exports to all major platforms. No platform-specific code needed.
5. **Performance:** Target 60 FPS on mid-range Android/iOS devices.

---

## Output Format

Return ONLY valid JSON. No markdown, no explanation. Just the JSON structure above, filled in completely.
