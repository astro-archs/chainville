import {
    Scene,
    SceneLoader,
    AssetsManager,
    Texture,
    StandardMaterial,
    Color3,
    Mesh,
    AbstractMesh,
    Vector3,
    PBRMaterial,
    TransformNode,
    AssetContainer,
    Material
  } from "@babylonjs/core";
  
  // Import the GLTF loader
  import "@babylonjs/loaders/glTF";
  
  // Define the models interface for categorized structure
  interface CategoryModels {
    [category: string]: string[];
  }
  
  // Asset Manager class for Babylon.js with AssetContainer support
  export class ChainVilleAssetManager {
    private scene: Scene;
    private assetsManager: AssetsManager;
    private baseUrl: string;
    
    
    // Collections of loaded assets as AssetContainers
    private assetContainers: Map<string, AssetContainer> = new Map();
    private containersByCategory: Map<string, Map<string, AssetContainer>> = new Map();
    
    // Reference meshes for quick access
    private rootMeshes: Map<string, AbstractMesh> = new Map();
    private rootMeshesByCategory: Map<string, Map<string, AbstractMesh>> = new Map();
    
    // Textures and icons
    private textures: Map<string, Texture> = new Map();
    private statusIcons: Map<string, Texture> = new Map();
    
    // Tracking loads
    private modelCount: number = 0;
    private loadedModelCount: number = 0;
    private onLoadCallback: () => void;
    
    /**
     * Create a new ChainVilleAssetManager
     * @param scene Babylon.js Scene
     * @param baseUrl Base URL for assets
     * @param modelDefinitions Categorized model definitions
     * @param onLoadCallback Callback to execute when all assets are loaded
     */
    constructor(
      scene: Scene, 
      baseUrl: string, 
      modelDefinitions: CategoryModels, 
      onLoadCallback: () => void
    ) {
      this.scene = scene;
      this.baseUrl = baseUrl;
      this.assetsManager = new AssetsManager(scene);
      this.onLoadCallback = onLoadCallback;
      
      // Load textures
      this.loadTextures();
      
      // Load status icons
      this.loadStatusIcons();
      
      // Count total models
      this.modelCount = Object.values(modelDefinitions).reduce(
        (count, models) => count + models.length, 0
      );
      this.loadedModelCount = 0;
      
      // Load models from definitions by category
      for (const [category, filenames] of Object.entries(modelDefinitions)) {
        // Create a category map if it doesn't exist
        if (!this.containersByCategory.has(category)) {
          this.containersByCategory.set(category, new Map());
          this.rootMeshesByCategory.set(category, new Map());
        }
        
        // Load each model in the category
        for (const filename of filenames) {
          // Generate model name from filename (remove extension)
          const modelName = filename.replace('.glb', '');
          this.loadModelAsContainer(category, modelName, filename);
        }
      }
      
      // Start loading assets
      this.assetsManager.onFinish = () => {
        console.log("All assets loaded successfully");
        this.onLoadCallback();
      };
      
      this.assetsManager.load();
    }
    
    /**
     * Load textures used for materials
     */
    private loadTextures(): void {
      // Base texture
      const baseTextureTask = this.assetsManager.addTextureTask(
        "baseTexture", 
        `${this.baseUrl}textures/base.png`
      );
      baseTextureTask.onSuccess = (task) => {
        this.textures.set('base', task.texture);
      };
      
      // Specular texture
      const specularTextureTask = this.assetsManager.addTextureTask(
        "specularTexture", 
        `${this.baseUrl}textures/specular.png`
      );
      specularTextureTask.onSuccess = (task) => {
        this.textures.set('specular', task.texture);
      };
      
      // Grid texture
      const gridTextureTask = this.assetsManager.addTextureTask(
        "gridTexture", 
        `${this.baseUrl}textures/grid.png`
      );
      gridTextureTask.onSuccess = (task) => {
        this.textures.set('grid', task.texture);
      };
    }
    
    /**
     * Load status icons
     */
    private loadStatusIcons(): void {
      // No power icon
      const noPowerIconTask = this.assetsManager.addTextureTask(
        "noPowerIcon", 
        `${this.baseUrl}statusIcons/no-power.png`
      );
      noPowerIconTask.onSuccess = (task) => {
        task.texture.hasAlpha = true;
        this.statusIcons.set('no-power', task.texture);
      };
      
      // No road access icon
      const noRoadAccessIconTask = this.assetsManager.addTextureTask(
        "noRoadAccessIcon", 
        `${this.baseUrl}statusIcons/no-road-access.png`
      );
      noRoadAccessIconTask.onSuccess = (task) => {
        task.texture.hasAlpha = true;
        this.statusIcons.set('no-road-access', task.texture);
      };
    }
  
    /**
     * Load a 3D model as an AssetContainer
     * @param category Model category
     * @param modelName Model identifier
     * @param filename Model filename
     */
    private loadModelAsContainer(category: string, modelName: string, filename: string): void {
      const modelUrl = `${this.baseUrl}models/${filename}`;
      const fullModelName = `${category}_${modelName}`;
      
      // Load the model using SceneLoader
      SceneLoader.LoadAssetContainer(
        "", 
        modelUrl, 
        this.scene, 
        (container) => {
          // Apply standard processing to the model
          this.processModelContainer(container, category, modelName);
          
          // Store the container for future instantiation
          this.assetContainers.set(fullModelName, container);
          
          // Get the root mesh for reference
          if (container.meshes.length > 0) {
            const rootMesh = container.meshes[0];
            this.rootMeshes.set(fullModelName, rootMesh);
            
            // Also store by category
            const categoryRootMap = this.rootMeshesByCategory.get(category);
            const categoryContainerMap = this.containersByCategory.get(category);
            
            if (categoryRootMap && categoryContainerMap) {
              categoryRootMap.set(modelName, rootMesh);
              categoryContainerMap.set(modelName, container);
            }
          }
          
          // Track loaded count
          this.loadedModelCount++;
          
          // Log progress
          if (this.loadedModelCount % 10 === 0 || this.loadedModelCount === this.modelCount) {
            console.log(`Loaded ${this.loadedModelCount}/${this.modelCount} models`);
          }
          
          // Check if loading is complete
          if (this.loadedModelCount === this.modelCount) {
            this.onLoadCallback();
          }
        },
        undefined,
        (scene, message, exception) => {
          console.error(`Error loading model ${category}/${modelName}:`, message, exception);
          
          // Increment counter even on error to avoid hanging
          this.loadedModelCount++;
          
          // Check if all models are loaded
          if (this.loadedModelCount === this.modelCount) {
            console.log("All models loading completed with some errors");
            this.onLoadCallback();
          }
        }
      );
    }
    
    /**
     * Process a loaded model container to apply standard materials and settings
     * @param container The asset container
     * @param category Model category
     * @param modelName Model name
     */
    private processModelContainer(container: AssetContainer, category: string, modelName: string): void {
      if (container.meshes.length > 0) {
        const rootMesh = container.meshes[0];
        rootMesh.name = `${category}_${modelName}`;
        
        // Apply standard scale
        const scale = 1/30;
        rootMesh.scaling = new Vector3(scale, scale, scale);
        
        // Process all meshes in the container
        container.meshes.forEach((mesh) => {
          if (mesh.material) {
            // Replace materials with our standard material if desired
            const originalMaterial = mesh.material;
            const stdMaterial = new StandardMaterial(`${modelName}_material`, this.scene);
            
            // Set textures if available
            const baseTexture = this.textures.get('base');
            const specularTexture = this.textures.get('specular');
            
            if (baseTexture) {
              stdMaterial.diffuseTexture = baseTexture.clone();
              stdMaterial.diffuseTexture.hasAlpha = false;
            }
            
            if (specularTexture) {
              stdMaterial.specularTexture = specularTexture.clone();
            }
            
            // Set default shadow properties
            mesh.receiveShadows = true;
            
            // If you want to use standardized materials:
            // mesh.material = stdMaterial;
            
            // If you want to keep original materials, just apply properties:
            if (originalMaterial instanceof StandardMaterial) {
              if (baseTexture && !originalMaterial.diffuseTexture) {
                originalMaterial.diffuseTexture = baseTexture.clone();
              }
              if (specularTexture && !originalMaterial.specularTexture) {
                originalMaterial.specularTexture = specularTexture.clone();
              }
            }
          }
        });
      }
    }
    
    /**
     * Get a model from the manager
     * @param modelName Model name (without extension)
     * @param simObject The simulation object that corresponds to this mesh
     * @param options Optional configuration for the model instance
     * @returns New instance of the model
     */
    public getModel(category: string, modelName: string, simObject: any, options: {
      transparent?: boolean,
      scale?: number,
      rotation?: number
    } = {}): AssetContainer | null {
      // Get the container for the model
      const fullModelName = `${category}_${modelName}`;
      const container = this.assetContainers.get(fullModelName);
      if (!container) {
        console.warn(`Model '${modelName}' not found`);
        return null;
      }
      
    //   // Instantiate the model
    //   const instances = container.instantiateModelsToScene(
    //     (name) => `${name}_${Date.now()}`,
    //     false, // Don't clone materials by default
    //     {
    //       doNotInstantiate: false // We do want to instantiate
    //     }
    //   );
      
    //   if (!instances || instances.rootNodes.length === 0) {
    //     console.error(`Failed to instantiate model '${modelName}'`);
    //     return null;
    //   }
      
    //   // Get the root node of the instantiated model
    //   const rootMesh = instances.rootNodes[0];
      
    //   // Apply custom scale if provided
    //   if (options.scale !== undefined) {
    //     const scale = options.scale / 30;
    //     rootMesh.scaling = new Vector3(scale, scale, scale);
    //   }
      
    //   // Apply custom rotation if provided
    //   if (options.rotation !== undefined) {
    //     const rotationRad = options.rotation * (Math.PI / 180);
    //     rootMesh.rotation = new Vector3(0, rotationRad, 0);
    //   }
      
    //   // Attach the sim object to metadata for all meshes
    //   rootMesh.getChildMeshes().forEach((mesh) => {
    //     mesh.metadata = simObject;
        
    //     // Handle transparency if needed
    //     if (options.transparent && mesh.material) {
    //       const material = mesh.material;
    //       if (material instanceof StandardMaterial) {
    //         material.alpha = 0.7;
    //       }
    //     }
    //   });
      
      return container;
    }
    
    /**
     * Get a model by category and name
     * @param category Model category
     * @param modelName Model name (without the category prefix)
     * @param simObject The simulation object that corresponds to this mesh
     * @param options Optional configuration for the model instance
     * @returns New instance of the model
     */
    public getModelByCategory(category: string, modelName: string, simObject: any, options: {
      transparent?: boolean,
      scale?: number,
      rotation?: number
    } = {}): AssetContainer | null {
      
      return this.getModel(category, modelName, simObject, options);
    }
    
    /**
     * Get a random model from a category
     * @param category Model category
     * @param simObject The simulation object that corresponds to this mesh
     * @param options Optional configuration for the model instance
     * @returns New instance of the model
     */
    public getRandomModelFromCategory(category: string, simObject: any, options: {
      transparent?: boolean,
      scale?: number,
      rotation?: number
    } = {}): AssetContainer | null {
      const categoryMap = this.containersByCategory.get(category);
      if (!categoryMap || categoryMap.size === 0) {
        console.warn(`Category '${category}' not found or empty`);
        return null;
      }
      
      // Get all model names in this category
      const modelNames = Array.from(categoryMap.keys());
      
      // Select a random model
      const randomIndex = Math.floor(Math.random() * modelNames.length);
      const randomModelName = modelNames[randomIndex];
      
      // Get the model
      return this.getModelByCategory(category, randomModelName, simObject, options);
    }
    
    /**
     * Get available categories
     * @returns Array of category names
     */
    public getCategories(): string[] {
      return Array.from(this.containersByCategory.keys());
    }
    
    /**
     * Get model names in a category
     * @param category Category name
     * @returns Array of model names or empty array if category not found
     */
    public getModelNamesInCategory(category: string): string[] {
      const categoryMap = this.containersByCategory.get(category);
      if (!categoryMap) {
        console.warn(`Category '${category}' not found`);
        return [];
      }
      
      return Array.from(categoryMap.keys());
    }
    
    /**
     * Get a texture by name
     * @param name Texture name
     * @returns Texture or null if not found
     */
    public getTexture(name: string): Texture | null {
      return this.textures.get(name) || null;
    }
    
    /**
     * Get a status icon by name
     * @param name Icon name
     * @returns Texture or null if not found
     */
    public getStatusIcon(name: string): Texture | null {
      return this.statusIcons.get(name) || null;
    }

    // In ChainVilleAssetManager
    public applyTexturesToMesh(mesh: Mesh): Mesh {
        mesh.getChildMeshes().forEach((childMesh) => {


            
        

            


        
        });

        return mesh
    }
    
    /**
     * Dispose all assets
     */
    public dispose(): void {
      // Dispose textures
      this.textures.forEach((texture) => {
        texture.dispose();
      });
      
      // Dispose status icons
      this.statusIcons.forEach((texture) => {
        texture.dispose();
      });
      
      // Dispose asset containers
      this.assetContainers.forEach((container) => {
        container.dispose();
      });
      
      // Clear maps
      this.textures.clear();
      // Clear maps
      this.textures.clear();
      this.statusIcons.clear();
      this.assetContainers.clear();
    }
  }