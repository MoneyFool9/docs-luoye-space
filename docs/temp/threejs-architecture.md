# three.js 架构概览

下面是 three.js 的高层架构划分，聚焦于运行时的核心模块与常见扩展位置。

## 架构要点

- 渲染核心：`Renderer` 负责把 `Scene` 与 `Camera` 组合成最终画面（`render(scene, camera)`）。
- 场景图：`Scene` 作为根节点，`Object3D` 构成层级树，`Mesh`、`Light` 等作为节点参与渲染。
- 几何与材质：`Mesh = BufferGeometry + Material`，`Material` 可引用 `Texture`。
- 资源加载：`Loader` 体系（配合 `LoadingManager`）从外部资源构建场景、几何、材质、纹理与动画数据。
- 动画系统：`AnimationMixer` 驱动 `AnimationClip/Action` 并作用在 `Object3D` 上。
- 扩展/示例：`Controls`、`Effects` 等作为附加模块插入渲染流程或交互流程。

## Mermaid 架构图

```mermaid
flowchart TB
  subgraph App["Application"]
    Loop["Render Loop / setAnimationLoop"]
    Controls["Controls (addons)\nOrbitControls"]
  end

  subgraph Core["three.js Core"]
    Renderer["Renderer / WebGLRenderer"]
    Scene["Scene"]
    Camera["Camera"]
    Object3D["Object3D (Scene Graph Node)"]
    Mesh["Mesh"]
    Geometry["BufferGeometry"]
    Material["Material"]
    Texture["Texture"]
    Light["Light"]
    Animation["Animation System\nAnimationMixer + Clips/Actions"]
    Loaders["Loader + LoadingManager"]
    RenderCall["render(scene,camera)"]
  end

  subgraph Assets["Assets"]
    Files["Models/Textures\n(e.g., glTF)"]
  end

  subgraph Addons["Addons"]
    Effects["Effects (examples)\nOutlineEffect/AsciiEffect"]
  end

  Loop --> Renderer
  Controls --> Camera

  Renderer --> RenderCall --> Scene
  Renderer --> Camera

  Scene --> Object3D
  Object3D --> Mesh
  Object3D --> Light
  Mesh --> Geometry
  Mesh --> Material
  Material --> Texture

  Loaders --> Files
  Loaders --> Scene
  Loaders --> Geometry
  Loaders --> Material
  Loaders --> Texture
  Loaders --> Animation

  Animation --> Object3D

  Effects --> Renderer
```

## Mermaid 渲染管线细化图

```mermaid
flowchart TB
  subgraph App2["Application"]
    Loop2["Render Loop"]
    Scene2["Scene"]
    Camera2["Camera"]
  end

  subgraph Renderer2["Renderer Internals"]
    RenderEntry["render(scene,camera)"]
    RenderLists["Render Lists"]
    Sorting["Sorting (opaque/transparent)"]
    ShadowPass["Shadow Map Pass"]
    RenderPass["Main Render Pass"]
    State["WebGL State"]
    Programs["Program/Shader Cache"]
    Uniforms["Uniforms + Lights"]
    Buffers["Geometry Buffers\n(VAO/VBO/IBO)"]
    Textures["Textures + Samplers"]
    Targets["Render Targets\n(FBO)"]
    Output["Canvas Output"]
  end

  subgraph Materials2["Materials & Shaders"]
    Material2["Material"]
    ShaderLib["ShaderLib / Nodes"]
    Defines["Defines/Keywords"]
  end

  subgraph Post2["Post-processing (addons)"]
    Composer["EffectComposer"]
    Passes["Render/Effect Passes"]
  end

  Loop2 --> RenderEntry
  Scene2 --> RenderEntry
  Camera2 --> RenderEntry

  RenderEntry --> RenderLists
  RenderLists --> Sorting
  RenderEntry --> ShadowPass
  ShadowPass --> Targets
  RenderEntry --> RenderPass

  RenderPass --> State
  RenderPass --> Buffers
  RenderPass --> Textures
  RenderPass --> Uniforms
  RenderPass --> Programs

  Material2 --> Defines --> Programs
  ShaderLib --> Programs
  Uniforms --> Programs

  RenderPass --> Targets --> Output

  RenderEntry --> Composer --> Passes --> Output
```
