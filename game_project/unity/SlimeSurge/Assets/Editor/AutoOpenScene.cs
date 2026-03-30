using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;

[InitializeOnLoad]
public static class AutoOpenScene
{
    static AutoOpenScene()
    {
        EditorApplication.delayCall += () =>
        {
            if (!EditorApplication.isPlaying && !EditorApplication.isCompiling)
            {
                string scenePath = "Assets/Scenes/SlimeSurge.unity";
                if (System.IO.File.Exists(scenePath))
                {
                    EditorSceneManager.OpenScene(scenePath);
                    Debug.Log("🎮 SLIME SURGE loaded! Press PLAY ▶️ to test!");
                }
            }
        };
    }
}
