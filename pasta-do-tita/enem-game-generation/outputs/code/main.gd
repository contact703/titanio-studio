extends Node2D

class_name GameMain

# Player and Game state
var player: Player
var current_scene: String = "overworld"
var game_state: GameState
var questions: Array = []

func _ready():
	"""Initialize the game"""
	print("🎮 ENEM Quest - Initializing...")
	
	# Initialize game state
	game_state = GameState.new()
	player = Player.new()
	
	# Load questions from JSON
	load_questions("res://data/questions.json")
	
	# Change to starting scene
	change_scene("overworld")
	
	print("✅ Game initialized successfully")

func _process(delta):
	"""Main game loop"""
	if current_scene == "overworld":
		update_overworld(delta)
	elif current_scene == "battle":
		update_battle(delta)

func load_questions(path: String) -> void:
	"""Load questions from JSON file"""
	var file = FileAccess.open(path, FileAccess.READ)
	if file:
		var json = JSON.new()
		var error = json.parse(file.get_as_text())
		if error == OK:
			var data = json.data
			if data.has("questions"):
				questions = data["questions"]
				print("✅ Loaded %d questions" % questions.size())
		else:
			print("❌ Error parsing JSON: %s" % file.get_error())
	else:
		print("❌ Could not open file: %s" % path)

func change_scene(scene_name: String) -> void:
	"""Change game scene"""
	current_scene = scene_name
	print("📍 Changing to scene: %s" % scene_name)
	
	match scene_name:
		"overworld":
			$Overworld.visible = true
			$BattleSystem.visible = false
		"battle":
			$Overworld.visible = false
			$BattleSystem.visible = true
		_:
			print("⚠️ Unknown scene: %s" % scene_name)

func update_overworld(delta: float) -> void:
	"""Update overworld scene"""
	# Handle player input and world updates
	pass

func update_battle(delta: float) -> void:
	"""Update battle scene"""
	# Handle combat updates
	pass

func save_game() -> void:
	"""Save game state"""
	game_state.save_game()
	print("💾 Game saved")

func load_game() -> void:
	"""Load game state"""
	var data = game_state.load_game()
	if data:
		print("📂 Game loaded")
	else:
		print("⚠️ No save found")

# Signal definitions
signal level_up(new_level: int)
signal question_answered(correct: bool)
signal game_over
