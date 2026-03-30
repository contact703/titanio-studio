using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using System.IO;

public class CompleteGameSetup : EditorWindow
{
    [MenuItem("Slime Surge/🎮 Create Complete Game")]
    public static void CreateCompleteGame()
    {
        // Create new scene
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
        
        // ===== CAMERA =====
        var mainCam = Camera.main;
        if (mainCam != null)
        {
            mainCam.transform.position = new Vector3(0, 12, -18);
            mainCam.transform.rotation = Quaternion.Euler(35, 0, 0);
            mainCam.backgroundColor = new Color(0.4f, 0.75f, 1f); // Sky blue
            mainCam.clearFlags = CameraClearFlags.SolidColor;
            mainCam.fieldOfView = 60f;
            
            var camFollow = mainCam.gameObject.AddComponent<CameraFollow>();
        }
        
        // ===== LIGHTING =====
        var light = GameObject.Find("Directional Light");
        if (light != null)
        {
            light.transform.rotation = Quaternion.Euler(50, -30, 0);
            var lightComp = light.GetComponent<Light>();
            if (lightComp != null)
            {
                lightComp.intensity = 1.3f;
                lightComp.color = new Color(1f, 0.95f, 0.9f);
            }
        }
        
        // Add ambient light
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = new Color(0.6f, 0.65f, 0.7f);
        
        // ===== PLAYER =====
        var player = CreatePlayer();
        
        // ===== GAME MANAGER =====
        var gmObj = new GameObject("GameManager");
        var gm = gmObj.AddComponent<GameManager>();
        gm.Player = player.GetComponent<PlayerController>();
        
        // ===== UI =====
        var uiObj = new GameObject("UI");
        uiObj.AddComponent<SimpleUI>();
        
        // ===== LEVEL GENERATOR =====
        var levelGen = new GameObject("LevelGenerator");
        levelGen.AddComponent<InfiniteLevelGenerator>();
        
        // ===== GROUND PLANE (infinite visual) =====
        var groundBase = GameObject.CreatePrimitive(PrimitiveType.Plane);
        groundBase.name = "GroundBase";
        groundBase.transform.position = new Vector3(0, -0.01f, 500);
        groundBase.transform.localScale = new Vector3(20, 1, 200);
        var groundMat = new Material(Shader.Find("Standard"));
        groundMat.color = new Color(0.25f, 0.5f, 0.3f);
        groundBase.GetComponent<Renderer>().material = groundMat;
        Destroy(groundBase.GetComponent<Collider>());
        
        // ===== SET CAMERA TARGET =====
        if (mainCam != null)
        {
            var camFollow = mainCam.GetComponent<CameraFollow>();
            if (camFollow != null)
            {
                camFollow.Target = player.transform;
                camFollow.Offset = new Vector3(0, 12, -18);
                camFollow.SmoothSpeed = 5f;
            }
        }
        
        // ===== SAVE SCENE =====
        string scenePath = "Assets/Scenes/SlimeSurge.unity";
        Directory.CreateDirectory("Assets/Scenes");
        EditorSceneManager.SaveScene(scene, scenePath);
        
        // Add to build settings
        var scenes = new EditorBuildSettingsScene[] {
            new EditorBuildSettingsScene(scenePath, true)
        };
        EditorBuildSettings.scenes = scenes;
        
        // Configure player settings
        ConfigurePlayerSettings();
        
        Debug.Log("✅ SLIME SURGE - Complete game created!");
        Debug.Log("🎮 Press PLAY to test!");
        Debug.Log("📱 Controls: Arrow keys / A-D / Mouse drag / Touch");
    }
    
    static GameObject CreatePlayer()
    {
        // Parent object
        var player = new GameObject("Player");
        player.transform.position = new Vector3(0, 0.5f, 5);
        player.tag = "Player";
        
        // Visual (the slime body)
        var visual = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        visual.name = "SlimeBody";
        visual.transform.parent = player.transform;
        visual.transform.localPosition = Vector3.zero;
        visual.transform.localScale = Vector3.one;
        
        // Slime material - vibrant green with glow
        var mat = new Material(Shader.Find("Standard"));
        mat.color = new Color(0.3f, 0.95f, 0.4f);
        mat.SetFloat("_Metallic", 0.2f);
        mat.SetFloat("_Glossiness", 0.9f);
        mat.EnableKeyword("_EMISSION");
        mat.SetColor("_EmissionColor", new Color(0.1f, 0.3f, 0.1f));
        visual.GetComponent<Renderer>().material = mat;
        
        // Remove visual collider
        Object.DestroyImmediate(visual.GetComponent<Collider>());
        
        // Add eyes
        CreateEye(visual.transform, new Vector3(-0.25f, 0.2f, 0.35f));
        CreateEye(visual.transform, new Vector3(0.25f, 0.2f, 0.35f));
        
        // Player collider
        var col = player.AddComponent<SphereCollider>();
        col.isTrigger = true;
        col.radius = 0.5f;
        
        // Rigidbody
        var rb = player.AddComponent<Rigidbody>();
        rb.useGravity = false;
        rb.constraints = RigidbodyConstraints.FreezeRotation | RigidbodyConstraints.FreezePositionY;
        rb.interpolation = RigidbodyInterpolation.Interpolate;
        rb.collisionDetectionMode = CollisionDetectionMode.Continuous;
        
        // Player controller
        var pc = player.AddComponent<PlayerController>();
        pc.SlimeVisual = visual.transform;
        pc.SlimeRenderer = visual.GetComponent<Renderer>();
        pc.ForwardSpeed = 14f;
        pc.HorizontalSpeed = 25f;
        pc.LaneWidth = 5f;
        pc.SpeedIncreaseRate = 0.15f;
        
        return player;
    }
    
    static void CreateEye(Transform parent, Vector3 localPos)
    {
        // Eye white
        var eye = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        eye.name = "Eye";
        eye.transform.parent = parent;
        eye.transform.localPosition = localPos;
        eye.transform.localScale = Vector3.one * 0.25f;
        
        var whiteMat = new Material(Shader.Find("Standard"));
        whiteMat.color = Color.white;
        eye.GetComponent<Renderer>().material = whiteMat;
        Object.DestroyImmediate(eye.GetComponent<Collider>());
        
        // Pupil
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
    
    static void ConfigurePlayerSettings()
    {
        // Company and product
        PlayerSettings.companyName = "Titanio Films";
        PlayerSettings.productName = "Slime Surge";
        PlayerSettings.bundleVersion = "1.0.0";
        
        // Android
        PlayerSettings.SetApplicationIdentifier(BuildTargetGroup.Android, "com.titaniofilms.slimesurge");
        PlayerSettings.Android.bundleVersionCode = 1;
        PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel24;
        PlayerSettings.Android.targetSdkVersion = AndroidSdkVersions.AndroidApiLevelAuto;
        
        // Default orientation - Portrait
        PlayerSettings.defaultInterfaceOrientation = UIOrientation.Portrait;
        
        // Quality
        QualitySettings.vSyncCount = 0;
        Application.targetFrameRate = 60;
        
        Debug.Log("✅ Player settings configured for Titanio Films!");
    }
    
    [MenuItem("Slime Surge/📱 Build Android APK")]
    public static void BuildAndroid()
    {
        string[] scenes = { "Assets/Scenes/SlimeSurge.unity" };
        string buildPath = "Builds/Android/SlimeSurge.apk";
        
        Directory.CreateDirectory("Builds/Android");
        
        var options = new BuildPlayerOptions
        {
            scenes = scenes,
            locationPathName = buildPath,
            target = BuildTarget.Android,
            options = BuildOptions.None
        };
        
        var report = BuildPipeline.BuildPlayer(options);
        
        if (report.summary.result == UnityEditor.Build.Reporting.BuildResult.Succeeded)
        {
            Debug.Log($"✅ Android APK built: {buildPath}");
            Debug.Log($"📦 Size: {report.summary.totalSize / 1024 / 1024}MB");
        }
        else
        {
            Debug.LogError("❌ Build failed!");
        }
    }
    
    [MenuItem("Slime Surge/🖥️ Build PC")]
    public static void BuildPC()
    {
        string[] scenes = { "Assets/Scenes/SlimeSurge.unity" };
        
        #if UNITY_EDITOR_OSX
        string buildPath = "Builds/Mac/SlimeSurge.app";
        BuildTarget target = BuildTarget.StandaloneOSX;
        #else
        string buildPath = "Builds/Windows/SlimeSurge.exe";
        BuildTarget target = BuildTarget.StandaloneWindows64;
        #endif
        
        Directory.CreateDirectory(Path.GetDirectoryName(buildPath));
        
        BuildPipeline.BuildPlayer(scenes, buildPath, target, BuildOptions.None);
        Debug.Log($"✅ PC build: {buildPath}");
    }
}
