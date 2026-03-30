# Code Generator Agent — GDScript for ENEM Game

## Context
You are a Godot expert developer. Your task: generate complete, production-ready GDScript code for the ENEM game based on the game_structure.json from the Game Designer Agent.

## Input
You will receive:
- `game_structure.json` (from Designer Agent)
- `questions.json` (from Content Agent)

## Output Files to Generate

### 1. main.gd
Main scene script. Game loop, initialization, scene management.

```gdscript
extends Node2D

var player: Player
var current_scene: String = "overworld"
var game_state: GameState

func _ready():
    # Initialize game
    game_state = GameState.new()
    player = Player.new()
    load_questions("res://data/questions.json")
    change_scene("overworld")

func _process(delta):
    if current_scene == "overworld":
        update_overworld(delta)
    elif current_scene == "battle":
        update_battle(delta)

func change_scene(scene_name: String):
    current_scene = scene_name
    match scene_name:
        "overworld":
            $Overworld.visible = true
            $BattleSystem.visible = false
        "battle":
            $Overworld.visible = false
            $BattleSystem.visible = true

func load_questions(path: String):
    # Load questions.json
    pass
```

### 2. Player.gd
Player character class. Stats, inventory, progression.

```gdscript
extends Node2D

class_name Player

var level: int = 1
var exp: int = 0
var exp_to_level_up: int = 100
var hp: int = 50
var max_hp: int = 50
var inventory: Array = []
var answered_questions: Array = []

func gain_exp(amount: int):
    exp += amount
    check_level_up()

func check_level_up():
    if exp >= exp_to_level_up:
        level_up()

func level_up():
    level += 1
    exp = 0
    exp_to_level_up = int(exp_to_level_up * 1.1)
    max_hp += 10
    hp = max_hp
```

### 3. QuestionManager.gd
Loads and manages questions from JSON.

```gdscript
extends Node

class_name QuestionManager

var questions: Array = []
var current_question: Dictionary

func _ready():
    load_questions_from_json()

func load_questions_from_json():
    var file = FileAccess.open("res://data/questions.json", FileAccess.READ)
    if file:
        var json = JSON.new()
        var error = json.parse(file.get_as_text())
        if error == OK:
            questions = json.data["questions"]

func get_random_question(category: String = "") -> Dictionary:
    var filtered = questions
    if category != "":
        filtered = questions.filter(func(q): return q["category"] == category)
    return filtered[randi() % filtered.size()]

func get_question_by_id(q_id: String) -> Dictionary:
    for q in questions:
        if q["id"] == q_id:
            return q
    return {}
```

### 4. BattleSystem.gd
Turn-based combat loop (question vs answer).

```gdscript
extends Node2D

class_name BattleSystem

var current_question: Dictionary
var player_hp: int = 50
var enemy_hp: int = 100  # "Enemy" = question
var game_over: bool = false

func start_battle():
    current_question = QuestionManager.get_random_question()
    display_question()

func player_answer(choice: String) -> bool:
    var is_correct = (choice == current_question["correct_answer"])
    
    if is_correct:
        enemy_hp -= 25
        show_message("Correto! Parabéns!")
    else:
        player_hp -= 15
        show_message("Errado. " + current_question["explanation"])
    
    if enemy_hp <= 0:
        end_battle(true)
    elif player_hp <= 0:
        end_battle(false)
    else:
        continue_battle()
    
    return is_correct
```

### 5. UIController.gd
UI management (menus, HUD, screens).

```gdscript
extends CanvasLayer

class_name UIController

@onready var hud = $HUD
@onready var menus = $Menus

func _ready():
    show_main_menu()

func show_main_menu():
    hud.visible = false
    menus.show_menu("main")

func show_hud():
    hud.visible = true
    hud.update_stats($"../Player")

func show_question_screen(question: Dictionary):
    var question_ui = preload("res://ui/QuestionScreen.tscn").instantiate()
    question_ui.set_question(question)
    add_child(question_ui)
```

### 6. GameState.gd
Persistence (saving/loading game).

```gdscript
extends Node

class_name GameState

var player_data: Dictionary = {}
var save_path: String = "user://saves/"

func save_game():
    var save_file = FileAccess.open(save_path + "save_0.json", FileAccess.WRITE)
    var json_str = JSON.stringify(player_data)
    save_file.store_string(json_str)

func load_game() -> Dictionary:
    if ResourceLoader.exists(save_path + "save_0.json"):
        var file = FileAccess.open(save_path + "save_0.json", FileAccess.READ)
        var json = JSON.new()
        json.parse(file.get_as_text())
        player_data = json.data
        return player_data
    return {}
```

### 7. project.godot
Godot project configuration.

```ini
[gd_resource type="ProjectSettings" format=3]

config_version = 5

[application]
config/name="ENEM Quest"
config/description="Educational RPG for ENEM preparation"
run/main_scene="res://main.tscn"
config/features=PackedStringArray("4.1", "Forward Plus")
config/icon="res://icon.svg"

[display]
window/size/viewport_width=1280
window/size/viewport_height=720

[physics]
2d/pixel_snap/enabled=true

[rendering]
textures/canvas_textures/default_texture_filter=0
textures/vram_compression/import_etc2_astc=true
```

## Requirements

1. **Syntax:** Valid GDScript 4.x syntax
2. **Documentation:** Comments for complex logic
3. **Error handling:** Try/catch for file operations
4. **Performance:** Efficient JSON loading, no memory leaks
5. **Modularity:** Each class has single responsibility

## Return Format

Return complete code files as structured output. Each file should be complete and ready to paste into a .gd file in Godot.

Format:
```
FILE: main.gd
[complete code]

FILE: Player.gd
[complete code]

FILE: QuestionManager.gd
[complete code]

...etc
```

No markdown, no explanation. Just the code.
