import {
    Scene,
    Engine,
    Vector3,
    Mesh,
    MeshBuilder,
    StandardMaterial,
    Color3,
    Camera,
    ArcRotateCamera,
    HemisphericLight,
    DirectionalLight,
    ShadowGenerator,
    AssetContainer,
    PointerEventTypes,
    Matrix,
    Plane,
    KeyboardEventTypes
  } from "@babylonjs/core";
  
  import { GridSystem } from "./GridSystem";
  import { EntityManager } from "./EntityManager";
  import { SpatialPartitioning } from "./SpatialPartitioning";
  import { ChainVilleAssetManager } from "./ChainVilleAssetManager";
  import modelCategories from "./models";
import { ChainVilleUI } from "./ChainVilleUI";
  /**
   * WorldManager class to demonstrate the optimized grid system
   */
  export class WorldManager {
    private engine: Engine;
    private scene: Scene;
    private camera: ArcRotateCamera;
    private light: DirectionalLight;
    
    // Core systems
    private gridSystem: GridSystem;
    private entityManager: EntityManager;
    private spatialSystem: SpatialPartitioning;
    private assetManager: ChainVilleAssetManager;
    private chainVilleUI: ChainVilleUI;


    private assetsLoaded: boolean = false;
    private shadowGenerator: ShadowGenerator;
    
  
    // Configuration
    private baseUrl: string = "/";
    private assetLoadCallback: () => void;
    
    // Performance tracking
    private visibleEntityCount: number = 0;
    private totalEntityCount: number = 0;
    private activeDistrictCount: number = 0;
    
    // Visibility range
    private visibilityRadius: number = 500;

    private previewMesh: Mesh | null;

    private isPlacementMode: boolean = false;
    private currentRotation: number = 0;
    private rotationIncrement: number = Math.PI / 4; // 45 degrees rotation increment
    private currentRotationToUse: number = 0;
    
    /**
     * Create a new WorldManager
     * @param canvas Canvas element
     * @param worldSize World size in districts
     * @param districtSize Size of each district
     */
    constructor(
        engine: Engine,
        scene: Scene,
        camera: ArcRotateCamera,
      worldSize: number = 25,
      districtSize: number = 100
    ) {
      // Create engine and scene
      this.engine =engine;
      this.scene = scene;
      this.camera = camera;
      
      // Create camera
    //   this.camera = new ArcRotateCamera(
    //     "camera",
    //     -Math.PI / 2,
    //     Math.PI / 3,
    //     500,
    //     Vector3.Zero(),
    //     this.scene
    //   );
    //   this.camera.attachControl(canvas, true);
    //   this.camera.upperBetaLimit = Math.PI / 2.2;
    //   this.camera.wheelPrecision = 0.5;
      
      // Create lights
      //this.createLights();

      this.chainVilleUI = new ChainVilleUI(scene);
      
      // Initialize systems
      this.gridSystem = new GridSystem(this.scene, {
        districtGridSize: worldSize,
        districtSize: districtSize,
        districtSpacing: districtSize,
        cellsPerDistrict: 160
      });
      
      
      this.spatialSystem = new SpatialPartitioning(districtSize);
      
          // Load assets
    this.assetManager = new ChainVilleAssetManager(
        this.scene,
        this.baseUrl,
        modelCategories,
        this.onAssetsLoaded.bind(this)
      );


      this.entityManager = new EntityManager(this.scene, this.gridSystem, this.assetManager);
      // Register event handlers
      this.setupEventHandlers();

          // Register grid selection events
      // this.setupGridEvents();

      this.setupPlacementPreview();
      

      // Start rendering
      this.engine.runRenderLoop(() => {
        this.update();
        this.scene.render();
      });
      
      // Handle window resize
      window.addEventListener("resize", () => {
        this.engine.resize();
      });
    }
    
    /**
     * Create scene lights
     */
    private createLights(): void {
    // Ambient light
    const ambientLight = new HemisphericLight(
        "ambientLight",
        new Vector3(0, 1, 0),
        this.scene
      );
      ambientLight.intensity = 0.5;
      
      // Directional light for shadows
      this.light = new DirectionalLight(
        "directionalLight",
        new Vector3(-0.5, -1, -0.5),
        this.scene
      );
      this.light.intensity = 0.7;
      
    // Shadow generator
    this.shadowGenerator = new ShadowGenerator(2048, this.light);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 8;
    }


    // Set up the placement preview system
    // Set up the placement preview system
private setupPlacementPreview() {
  // Enter placement mode when a resource is selected
  this.chainVilleUI.onResourceSelected.add((selectedResource) => {
    if (selectedResource) {
      this.enterPlacementMode(selectedResource as { model: string, category: string } | null);
    } else {
      this.exitPlacementMode();
    }
  });

  // Update preview on pointer move
  this.scene.onPointerObservable.add((pointerInfo) => {
    // Only process POINTERMOVE events for preview
    if (pointerInfo.type !== PointerEventTypes.POINTERMOVE) return;
    if (!this.isPlacementMode || !this.previewMesh) return;
    
    // Get the ray from the camera through the pointer position
    const ray = this.scene.createPickingRay(
      this.scene.pointerX, 
      this.scene.pointerY, 
      Matrix.Identity(), 
      this.scene.activeCamera
    );
    
    // Find intersection with ground plane (y=0)
    const ground = new Plane(0, 1, 0, 0); // y-up plane at y=0
    let distance = ray.intersectsPlane(ground);
    
    if (distance !== null) {
      // Calculate the intersection point
      const worldPos = ray.origin.add(ray.direction.scale(distance));
      
      // Get the nearest grid cell
      const nearestCell = this.gridSystem.getCellAtPosition(worldPos);
      
      if (nearestCell) {
        // Update the preview position
        this.previewMesh.position = new Vector3(
          nearestCell.worldX,
          this.previewMesh.position.y, // Maintain y offset
          nearestCell.worldZ
        );
        
        // Update preview validity
        const canPlace = !nearestCell.isOccupied;
        this.updatePreviewValidity(canPlace);
      }
    }
  });
  
  // Handle rotation with keyboard
  this.scene.onKeyboardObservable.add((kbInfo) => {
    if (!this.isPlacementMode || !this.previewMesh) return;
    
    if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
      // Use "1" key for rotation (keyCode 49)
      if (kbInfo.event.keyCode === 49) {
        this.rotatePreview();
      }
    }
  });
}

// Enter placement mode with a specific resource
private enterPlacementMode(selectedResource:  {model: string, category: string } | null) {
  if (selectedResource){

    this.exitPlacementMode();

    
  const modelName = selectedResource.model.replace('.glb', '');
  const templateName = `${selectedResource.category}_${modelName}`;
  const template = this.entityManager.getTemplate(templateName);
  
  if (template) {
    // Create preview mesh from template
    const container = template.sourceMesh;
    if (container) {
      const instances = container.instantiateModelsToScene(
        (name) => `preview_${name}`,
        false,
        { doNotInstantiate: false }
      );
      
      if (instances && instances.rootNodes.length > 0) {
        this.previewMesh = instances.rootNodes[0] as Mesh;
        this.previewMesh.scaling = new Vector3(
          template.scale, 
          template.scale, 
          template.scale
        );
        
        // Apply y offset
        this.previewMesh.position.y = template.yOffset;
        
        // Make it semi-transparent
       this.makePreviewTransparent(this.previewMesh);
        
        // Reset rotation
        this.currentRotation = 0;
        this.previewMesh.rotation = new Vector3(0, this.currentRotation, 0);
        
        this.isPlacementMode = true;
      }
    }
  }
  }
}

// Exit placement mode
public exitPlacementMode() {
  if (this.previewMesh) {
    this.previewMesh.dispose();
    this.previewMesh = null;
  }
  this.isPlacementMode = false;
}

// Rotate the preview mesh
private rotatePreview() {
  if (!this.previewMesh) return;
  
  this.currentRotation += this.rotationIncrement;
  // Normalize rotation to keep it between 0 and 2*PI
  if (this.currentRotation >= Math.PI * 2) {
    this.currentRotation -= Math.PI * 2;
  }

  this.currentRotationToUse = this.currentRotation;
  
  this.previewMesh.rotation = new Vector3(0, this.currentRotation, 0);
}

// Make the preview mesh semi-transparent
private makePreviewTransparent(mesh: Mesh) {
  // Apply transparency to all meshes in the hierarchy
  mesh.getChildMeshes().forEach(childMesh => {
    if (childMesh.material) {
      childMesh.material = childMesh.material.clone(`${childMesh.material.name}_preview`);
      childMesh.material!.alpha = 0.5;
    }
  });
  
  // Apply to the root mesh if it has a material
  if (mesh.material) {
    mesh.material = mesh.material.clone(`${mesh.material.name}_preview`);
    mesh.material!.alpha = 0.5;
  }
}

  // Update preview mesh to show valid/invalid placement
  private updatePreviewValidity(isValid: boolean) {
    if (!this.previewMesh) return;
    
    const color = isValid ? new Color3(0.2, 1, 0.2) : new Color3(1, 0.2, 0.2);
    const alpha = isValid ? 0.5 : 0.7;
    
    // Apply color tint to all materials
    this.previewMesh.getChildMeshes().forEach(childMesh => {
      if (childMesh.material) {
        //childMesh.material.emissiveColor = color;
        childMesh.material.alpha = alpha;
      }
    });
    
    if (this.previewMesh.material) {
      //this.previewMesh.material.emissiveColor = color;
      this.previewMesh.material.alpha = alpha;
    }
  }

    
    /**
     * Setup event handlers
     */
    private setupEventHandlers(): void {
      // Handle district selection
      this.gridSystem.onDistrictSelectedObservable.add((districtId) => {
        if (districtId !== null) {
          console.log(`Selected district: ${districtId}`);
          this.activeDistrictCount = 1;
        } else {
          console.log("Deselected district");
          this.activeDistrictCount = 0;
        }
      });

     


      
              // Handle cell selection
      this.gridSystem.onCellSelectedObservable.add((cell) => {
        const selectedResource = this.chainVilleUI.getSelectedResource();
        if (selectedResource){

          const modelName = selectedResource.model.replace('.glb', '');


          if (cell !== null) {
            console.log(`Selected cell: ${cell.id} at ${cell.worldX}, ${cell.worldZ}`);
            
            // If cell is empty, place a random entity
            if (!cell.isOccupied) {
              // const entityTypes = ["Utilities_data-center", "Utilities_firetruck", "Commercial_building-office", "Commercial_building-office", "Industrial_construction-small"];
              // const randomType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
              // const randomRotation = Math.random() * Math.PI * 2;

              const entityToCreate = selectedResource.category + "_" + modelName;

              console.log(this.currentRotation,this.currentRotationToUse)
              
              const entityId = this.entityManager.createEntity(entityToCreate, cell.id, this.currentRotationToUse);
              if (entityId) {
                console.log(`Created ${entityToCreate} with ID ${entityId}`);
                
                // Add to spatial system
                this.spatialSystem.addEntity(entityId, new Vector3(cell.worldX, 0, cell.worldZ));
                this.totalEntityCount++;
              }
            } 
            // If cell has an entity, remove it
            else if (cell.itemId) {
              console.log(`Removing entity ${cell.itemId}`);
              
              // Remove from spatial system
              this.spatialSystem.removeEntity(cell.itemId);
              
              // Remove from entity manager
              this.entityManager.removeEntity(cell.itemId);
              this.totalEntityCount--;
            }
          } else {
            console.log("Deselected cell");
          }
        }
        });
      
      

    }

    
    /**
     * Update loop
     */
    private update(): void {
      // Get camera position
      const cameraPosition = this.camera.position;
      
      // Update entity visibility based on camera position
      const visibleEntities = this.spatialSystem.getEntitiesInRadius(
        cameraPosition,
        this.visibilityRadius
      );
      
      this.visibleEntityCount = visibleEntities.length;
      
      // Performance optimization: only show entities in range
      this.entityManager.showEntitiesInRange(cameraPosition, this.visibilityRadius);
    }
    
    /**
     * Generate random entities in the world
     * @param count Number of entities to generate
     */
    public generateRandomEntities(count: number): void {
      const entityTypes = ["tree", "building", "rock"];
      const worldSize = this.gridSystem.getDistrict(0)?.size || 100;
      const worldExtent = (this.gridSystem.getDistrict(0)?.size || 100) * 
                         (this.gridSystem.getDistrict(0)?.cellsPerSide || 10);
      
      for (let i = 0; i < count; i++) {
        // Generate random position
        const x = (Math.random() - 0.5) * worldExtent;
        const z = (Math.random() - 0.5) * worldExtent;
        const position = new Vector3(x, 0, z);
        
        // Find cell at position
        const cell = this.gridSystem.getCellAtPosition(position);
        if (!cell || cell.isOccupied) continue;
        
        // Random entity type and rotation
        const randomType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
        const randomRotation = Math.random() * Math.PI * 2;
        
        // Create entity
        const entityId = this.entityManager.createEntity(randomType, cell.id, randomRotation);
        if (entityId) {
          // Add to spatial system
          this.spatialSystem.addEntity(entityId, new Vector3(cell.worldX, 0, cell.worldZ));
          this.totalEntityCount++;
        }
      }
      
      console.log(`Generated ${this.totalEntityCount} entities`);
    }
    
    /**
     * Save the world state
     * @returns World state
     */
    public saveWorld(): any {
      return {
        entities: this.entityManager.serialize(),
        timestamp: Date.now()
      };
    }
    
    /**
     * Load world state
     * @param data World state data
     */
    public loadWorld(data: any): void {
      // Clear existing entities
      this.entityManager.clear();
      this.spatialSystem.clear();
      this.totalEntityCount = 0;
      
      // Load entities
      const entityIds = this.entityManager.deserialize(data.entities);
      
      // Add to spatial system
      for (const entityId of entityIds) {
        const entity = this.entityManager.getEntity(entityId);
        if (entity) {
          const cell = this.gridSystem.getCell(entity.cellId);
          if (cell) {
            this.spatialSystem.addEntity(entityId, new Vector3(cell.worldX, 0, cell.worldZ));
            this.totalEntityCount++;
          }
        }
      }
      
      console.log(`Loaded ${this.totalEntityCount} entities`);
    }

    private onAssetsLoaded(): void {
        console.log("All assets loaded successfully");
        this.assetsLoaded = true;

                // Register templates with the entity manager
        this.registerEntityTemplates();
        
                
        // Notify parent
        this.assetLoadCallback();

      }
    


    /**
     * Get performance statistics
     */
    public getStats(): any {
      return {
        totalEntities: this.totalEntityCount,
        visibleEntities: this.visibleEntityCount,
        activeDistricts: this.activeDistrictCount,
        frameRate: this.engine.getFps().toFixed(2)
      };
    }


    /**
 * Register asset models as entity templates
 */
private registerEntityTemplates(): void {
        const categories = [
          "Residential",
          "Commercial",
          "Industrial",
          "Office",
          "Water",
          "Electricity",
          "Roads",
          "Public Transport",
          "Healthcare",
          "Fire Department",
          "Police",
          "Education",
          "Parks",
          "Unique Buildings",
          "Vehicles",
          "Props",
          "Utilities", // optional if you're grouping some under this
          "Special"    // optional for general purpose/miscellaneous
        ];
  
    
    // Register one template for each category
    for (const category of categories) {
      const modelNames = this.assetManager.getModelNamesInCategory(category);

      console.log(category)
      
      if (modelNames.length > 0) {

        console.log(modelNames)
        // For each model in the category, register it as a template
        for (const modelName of modelNames) {
          // Get the original model from the asset manager
          const originalMesh = this.assetManager.getModel(category,modelName, null, { scale: 1 });

          console.log(modelName,originalMesh)
          
          if (originalMesh && originalMesh instanceof AssetContainer) {
            // Register it with the entity manager
            this.entityManager.registerTemplate(
              `${category}_${modelName}`,
              originalMesh,
              undefined,  // Use default material
              category === "Roads" ? 0.022: 0.05,     // Default scale
              category === "Roads" ? 0.0225 : 0      // Default Y offset
            );
            
            console.log(`Registered template: ${category}_${modelName}`);
          }
        }
      }
    }
  }
    
    /**
     * Dispose all resources
     */
    public dispose(): void {
      this.entityManager.dispose();
      this.gridSystem.dispose();
      this.spatialSystem.clear();
      this.scene.dispose();
      this.engine.dispose();
    }
  }