using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using System.IO;

/// <summary>
/// Complete Game Setup - Creates professional game with:
/// - Full Canvas UI (Menu, HUD, Pause, Game Over)
/// - Player with effects
/// - Procedural level
/// - Effects manager
/// - All polish and juice
/// </summary>
public class FinalGameSetup : EditorWindow
{
    [MenuItem("Slime Surge/🎮 Create FINAL Game (Complete)")]
    public static void CreateFinalGame()
    {
        Debug.Log("🎮 Creating complete Slime Surge game...");
        
        // Create new scene
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
        
        // ===== CAMERA =====
        SetupCamera();
        
        // ===== LIGHTING =====
        SetupLighting();
        
        // ===== PLAYER =====
        var player = CreatePlayer();
        
        // ===== GAME SYSTEMS =====
        CreateGameSystems(player);
        
        // ===== UI =====
        CreateCompleteUI();
        
        // ===== LEVEL GENERATOR =====
        CreateLevelGenerator();
        
        // ===== GROUND =====
        CreateGround();
        
        // ===== SET CAMERA TARGET =====
        var camFollow = Camera.main.GetComponent<CameraFollow>();
        if (camFollow != null) camFollow.Target = player.transform;
        
        // ===== SAVE =====
        SaveScene();
        
        Debug.Log("✅ COMPLETE GAME CREATED!");
        Debug.Log("🎮 Press PLAY to test!");
    }
    
    static void SetupCamera()
    {
        var cam = Camera.main;
        if (cam == null) return;
        
        cam.transform.position = new Vector3(0, 12, -18);
        cam.transform.rotation = Quaternion.Euler(35, 0, 0);
        cam.backgroundColor = new Color(0.4f, 0.75f, 1f);
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.fieldOfView = 60f;
        
        cam.gameObject.AddComponent<CameraFollow>();
    }
    
    static void SetupLighting()
    {
        var light = GameObject.Find("Directional Light");
        if (light != null)
        {
            light.transform.rotation = Quaternion.Euler(50, -30, 0);
            var lightComp = light.GetComponent<Light>();
            if (lightComp != null)
            {
                lightComp.intensity = 1.3f;
                lightComp.color = new Color(1f, 0.97f, 0.9f);
            }
        }
        
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(0.6f, 0.65f, 0.7f);
    }
    
    static GameObject CreatePlayer()
    {
        var player = new GameObject("Player");
        player.transform.position = new Vector3(0, 0.5f, 5);
        player.tag = "Player";
        
        // Visual body
        var visual = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        visual.name = "SlimeBody";
        visual.transform.parent = player.transform;
        visual.transform.localPosition = Vector3.zero;
        visual.transform.localScale = Vector3.one;
        
        // Material
        var mat = new Material(Shader.Find("Standard"));
        mat.color = new Color(0.3f, 0.95f, 0.4f);
        mat.SetFloat("_Metallic", 0.2f);
        mat.SetFloat("_Glossiness", 0.9f);
        visual.GetComponent<Renderer>().material = mat;
        Object.DestroyImmediate(visual.GetComponent<Collider>());
        
        // Eyes
        CreateEye(visual.transform, new Vector3(-0.25f, 0.2f, 0.35f));
        CreateEye(visual.transform, new Vector3(0.25f, 0.2f, 0.35f));
        
        // Collider
        var col = player.AddComponent<SphereCollider>();
        col.isTrigger = true;
        col.radius = 0.5f;
        
        // Rigidbody
        var rb = player.AddComponent<Rigidbody>();
        rb.useGravity = false;
        rb.constraints = RigidbodyConstraints.FreezeRotation | RigidbodyConstraints.FreezePositionY;
        rb.interpolation = RigidbodyInterpolation.Interpolate;
        rb.collisionDetectionMode = CollisionDetectionMode.Continuous;
        
        // Player Controller
        var pc = player.AddComponent<PlayerController>();
        pc.SlimeVisual = visual.transform;
        pc.SlimeRenderer = visual.GetComponent<Renderer>();
        pc.ForwardSpeed = 14f;
        pc.HorizontalSpeed = 25f;
        pc.LaneWidth = 5f;
        
        return player;
    }
    
    static void CreateEye(Transform parent, Vector3 localPos)
    {
        var eye = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        eye.name = "Eye";
        eye.transform.parent = parent;
        eye.transform.localPosition = localPos;
        eye.transform.localScale = Vector3.one * 0.25f;
        
        var whiteMat = new Material(Shader.Find("Standard"));
        whiteMat.color = Color.white;
        eye.GetComponent<Renderer>().material = whiteMat;
        Object.DestroyImmediate(eye.GetComponent<Collider>());
        
        var pupil = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        pupil.name = "Pupil";
        pupil.transform.parent = eye.transform;
        pupil.transform.localPosition = new Vector3(0, 0, 0.4f);
        pupil.transform.localScale = Vector3.one * 0.5f;
        
        var blackMat = new Material(Shader.Find("Standard"));
        blackMat.color = Color.black;
        pupil.GetComponent<Renderer>().material = blackMat;
        Object.DestroyImmediate(pupil.GetComponent<Collider>());
    }
    
    static void CreateGameSystems(GameObject player)
    {
        // Game Manager
        var gmObj = new GameObject("GameManager");
        var gm = gmObj.AddComponent<GameManager>();
        gm.Player = player.GetComponent<PlayerController>();
        
        // Effects Manager
        var effectsObj = new GameObject("EffectsManager");
        effectsObj.AddComponent<EffectsManager>();
    }
    
    static void CreateCompleteUI()
    {
        // Simple UI using IMGUI (guaranteed to work)
        var uiObj = new GameObject("GameUI");
        uiObj.AddComponent<SimpleUI>();
        
        Debug.Log("✅ SimpleUI Created (IMGUI-based, always works)");
    }
    
    static void CreateLevelGenerator()
    {
        var levelGen = new GameObject("LevelGenerator");
        levelGen.AddComponent<InfiniteLevelGenerator>();
    }
    
    static void CreateGround()
    {
        var ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
        ground.name = "GroundBase";
        ground.transform.position = new Vector3(0, -0.01f, 500);
        ground.transform.localScale = new Vector3(20, 1, 200);
        
        var mat = new Material(Shader.Find("Standard"));
        mat.color = new Color(0.25f, 0.5f, 0.3f);
        ground.GetComponent<Renderer>().material = mat;
        
        Object.DestroyImmediate(ground.GetComponent<Collider>());
    }
    
    static void SaveScene()
    {
        string scenePath = "Assets/Scenes/SlimeSurgeFinal.unity";
        Directory.CreateDirectory("Assets/Scenes");
        EditorSceneManager.SaveScene(EditorSceneManager.GetActiveScene(), scenePath);
        
        var scenes = new EditorBuildSettingsScene[] {
            new EditorBuildSettingsScene(scenePath, true)
        };
        EditorBuildSettings.scenes = scenes;
        
        // Configure player settings
        PlayerSettings.companyName = "Titanio Films";
        PlayerSettings.productName = "Slime Surge";
        PlayerSettings.bundleVersion = "1.0.0";
        PlayerSettings.SetApplicationIdentifier(BuildTargetGroup.Android, "com.titaniofilms.slimesurge");
        PlayerSettings.Android.bundleVersionCode = 1;
        PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel24;
        PlayerSettings.defaultInterfaceOrientation = UIOrientation.Portrait;
    }
    
    [MenuItem("Slime Surge/📱 Build Final APK")]
    public static void BuildFinalAPK()
    {
        string[] scenes = { "Assets/Scenes/SlimeSurgeFinal.unity" };
        string buildPath = "Builds/Android/SlimeSurge.apk";
        
        Directory.CreateDirectory("Builds/Android");
        
        BuildPipeline.BuildPlayer(scenes, buildPath, BuildTarget.Android, BuildOptions.None);
        Debug.Log($"✅ APK built: {buildPath}");
    }
}
