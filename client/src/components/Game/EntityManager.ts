import {
    Scene,
    Vector3,
    Mesh,
    TransformNode,
    AbstractMesh,
    InstancedMesh,
    Color3,
    Material,
    AssetContainer
  } from "@babylonjs/core";
  
  import { GridSystem, CellData } from "./GridSystem";
import { ChainVilleAssetManager } from "./ChainVilleAssetManager";
  
  // Entity data interface
  export interface EntityData {
    id: string;
    type: string;
    cellId: string;
    mesh: AbstractMesh;
    rotation: number;
    scale: number;
  }
  
  // Entity template for instancing
  interface EntityTemplate {
    type: string;
    sourceMesh: AssetContainer;
    material?: Material;
    scale: number;
    yOffset: number;
    instances: Map<string, InstancedMesh>;
  }
  
  /**
   * EntityManager class to manage entities placed on the grid
   * Uses instanced meshes for better performance
   */
  export class EntityManager {
    private scene: Scene;
    private gridSystem: GridSystem;
    private entities: Map<string, EntityData> = new Map();
    private templates: Map<string, EntityTemplate> = new Map();
    private entityRoot: TransformNode;
    private chainVilleAssetManager: ChainVilleAssetManager;
    
    /**
     * Create a new EntityManager
     * @param scene Babylon.js Scene
     * @param gridSystem OptimizedGridSystem to place entities on
     */
    constructor(scene: Scene, gridSystem: GridSystem,assetManager: ChainVilleAssetManager) {
      this.scene = scene;
      this.gridSystem = gridSystem;
      this.chainVilleAssetManager = assetManager;
      
      // Create a root transform node for all entities
      this.entityRoot = new TransformNode("entityRoot", this.scene);
    }
    
    /**
     * Register an entity template for instancing
     * @param type Entity type identifier
     * @param sourceMesh Source mesh to create instances from
     * @param material Optional material to use
     * @param scale Scale factor
     * @param yOffset Y position offset
     */
    public registerTemplate(
      type: string,
      sourceMesh: AssetContainer,
      material?: Material,
      scale: number = 1,
      yOffset: number = 0
    ): void {
 
      // Create template
      const template: EntityTemplate = {
        type,
        sourceMesh,
        material,
        scale,
        yOffset,
        instances: new Map()
      };
      
      this.templates.set(type, template);
    }
    
    /**
     * Create an entity at a cell
     * @param type Entity type
     * @param cellId Target cell ID
     * @param rotation Y-axis rotation in radians
     * @returns Created entity ID or null if failed
     */
    public createEntity(type: string, cellId: string, rotation: number = 0): string | null {
      // Get template
      const template = this.templates.get(type);
      if (!template) {
        console.error(`Entity template ${type} not found`);
        return null;
      }
      
      // Get cell
      const cell = this.gridSystem.getCell(cellId);
      if (!cell || cell.isOccupied) {
        console.error(`Cell ${cellId} not found or occupied`);
        return null;
      }
      
      // Generate unique entity ID
      const entityId = `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Place on grid
      const success = this.gridSystem.placeItem(cellId, entityId, (position) => {
        this.createEntityInstance(entityId, type, position, cell, rotation);
      });
      
      if (!success) return null;
      
      return entityId;
    }

    public getTemplate(type: string): EntityTemplate | undefined {
      return this.templates.get(type);
    }
    
    /**
     * Create entity instance (internal)
     */
    private createEntityInstance(
      entityId: string,
      type: string,
      position: Vector3,
      cell: CellData,
      rotation: number
    ): void {
      const template = this.templates.get(type);
      if (!template) return;


      const container = template.sourceMesh;

      // Instantiate the model
      const instances = container?.instantiateModelsToScene(
        (name) => `${name}_${Date.now()}`,
        false, // Don't clone materials by default
        {
            doNotInstantiate: false // We do want to instantiate
        }
        );
        
        if (!instances || instances.rootNodes.length === 0) {
        console.error(`Failed to instantiate model `);
        }
        
        // Get the root node of the instantiated model
    const rootMesh = instances.rootNodes[0] as Mesh;

    const rootMeshWithMaterial = this.chainVilleAssetManager.applyTexturesToMesh(rootMesh);

      // Position and rotate
      rootMeshWithMaterial.position = new Vector3(
        position.x,
        position.y + template.yOffset,
        position.z
      );
      rootMeshWithMaterial.rotation = new Vector3(0, rotation, 0);
      rootMeshWithMaterial.scaling = new Vector3(template.scale, template.scale, template.scale);
      
      // Store the instance
      template.instances.set(entityId, rootMeshWithMaterial as unknown as InstancedMesh);
      
      // Store entity data
      const entityData: EntityData = {
        id: entityId,
        type,
        cellId: cell.id,
        mesh: rootMeshWithMaterial,
        rotation,
        scale: template.scale
      };
      
      this.entities.set(entityId, entityData);
    }
    
    /**
     * Remove an entity
     * @param entityId Entity ID
     * @returns Success flag
     */
    public removeEntity(entityId: string): boolean {
      // Get entity
      const entity = this.entities.get(entityId);
      if (!entity) return false;
      
      // Remove from grid
      this.gridSystem.removeItem(entity.cellId);
      
      // Get template
      const template = this.templates.get(entity.type);
      if (!template) return false;
      
      // Remove instance
      const instance = template.instances.get(entityId);
      if (instance) {
        instance.dispose();
        template.instances.delete(entityId);
      }
      
      // Remove entity data
      this.entities.delete(entityId);
      
      return true;
    }
    
    /**
     * Get entity by ID
     * @param entityId Entity ID
     * @returns Entity data or undefined
     */
    public getEntity(entityId: string): EntityData | undefined {
      return this.entities.get(entityId);
    }
    
    /**
     * Move entity to a new cell
     * @param entityId Entity ID
     * @param targetCellId Target cell ID
     * @returns Success flag
     */
    public moveEntity(entityId: string, targetCellId: string): boolean {
      // Get entity
      const entity = this.entities.get(entityId);
      if (!entity) return false;
      
      // Get target cell
      const targetCell = this.gridSystem.getCell(targetCellId);
      if (!targetCell || targetCell.isOccupied) return false;
      
      // Remove from current cell
      this.gridSystem.removeItem(entity.cellId);
      
      // Place on target cell
      const success = this.gridSystem.placeItem(targetCellId, entityId, (position) => {
        // Update entity position
        entity.mesh.position.x = position.x;
        entity.mesh.position.z = position.z;
      });
      
      if (!success) {
        // Revert if failed
        this.gridSystem.placeItem(entity.cellId, entityId, () => {});
        return false;
      }
      
      // Update entity data
      entity.cellId = targetCellId;
      
      return true;
    }
    
    /**
     * Rotate entity
     * @param entityId Entity ID
     * @param rotation New Y-axis rotation in radians
     */
    public rotateEntity(entityId: string, rotation: number): void {
      const entity = this.entities.get(entityId);
      if (!entity) return;
      
      // Update rotation
      entity.mesh.rotation.y = rotation;
      entity.rotation = rotation;
    }
    
    /**
     * Scale entity
     * @param entityId Entity ID
     * @param scale New scale factor
     */
    public scaleEntity(entityId: string, scale: number): void {
      const entity = this.entities.get(entityId);
      if (!entity) return;
      
      // Update scale
      entity.mesh.scaling.setAll(scale);
      entity.scale = scale;
    }
    
    /**
     * Get entities in a district
     * @param districtId District ID
     * @returns Array of entities in this district
     */
    public getEntitiesInDistrict(districtId: number): EntityData[] {
      const result: EntityData[] = [];
      const cells = this.gridSystem.getCellsInDistrict(districtId);
      
      for (const cell of cells) {
        if (cell.isOccupied && cell.itemId) {
          const entity = this.entities.get(cell.itemId);
          if (entity) {
            result.push(entity);
          }
        }
      }
      
      return result;
    }
    
    /**
     * Show entities within a distance range from a center point
     * Used for optimized rendering of large worlds
     * @param center Center position
     * @param distance Maximum distance to show entities
     */
    public showEntitiesInRange(center: Vector3, distance: number): void {
      const distanceSquared = distance * distance;
      
      for (const entity of this.entities.values()) {
        const dx = entity.mesh.position.x - center.x;
        const dz = entity.mesh.position.z - center.z;
        const distSq = dx * dx + dz * dz;

        const isVisible = distSq <= distanceSquared;
    
        // Set visibility on root mesh and all children
        this.setMeshVisibilityRecursive(entity.mesh, isVisible);
       
      }
    }

    private setMeshVisibilityRecursive(mesh: AbstractMesh, isVisible: boolean): void {
      // Set visibility on the current mesh
      mesh.isVisible = isVisible;
      
      // Set visibility on all child meshes
      if (mesh.getChildMeshes) {
        const children = mesh.getChildMeshes();
        for (const child of children) {
          this.setMeshVisibilityRecursive(child as Mesh, isVisible);
        }
      }
    }
    
    /**
     * Find entity at a specific position
     * @param position World position
     * @param tolerance Distance tolerance
     * @returns Entity at position or null
     */
    public findEntityAtPosition(position: Vector3, tolerance: number = 0.5): EntityData | null {
      const cell = this.gridSystem.getCellAtPosition(position);
      if (!cell || !cell.isOccupied || !cell.itemId) return null;
      
      return this.entities.get(cell.itemId) || null;
    }
    
    /**
     * Apply callback to all entities
     * @param callback Function to call for each entity
     */
    public forEachEntity(callback: (entity: EntityData) => void): void {
      for (const entity of this.entities.values()) {
        callback(entity);
      }
    }
    
    /**
     * Serialize entities to JSON
     * @returns Serialized entity data
     */
    public serialize(): any {
      const data: any[] = [];
      
      for (const entity of this.entities.values()) {
        data.push({
          id: entity.id,
          type: entity.type,
          cellId: entity.cellId,
          rotation: entity.rotation,
          scale: entity.scale
        });
      }
      
      return data;
    }
    
    /**
     * Load entities from serialized data
     * @param data Serialized entity data
     * @returns Array of created entity IDs
     */
    public deserialize(data: any[]): string[] {
      const createdEntities: string[] = [];
      
      // Clear existing entities first
      this.clear();
      
      // Create entities from data
      for (const item of data) {
        const entityId = this.createEntity(item.type, item.cellId, item.rotation);
        if (entityId) {
          this.scaleEntity(entityId, item.scale);
          createdEntities.push(entityId);
        }
      }
      
      return createdEntities;
    }
    
    /**
     * Clear all entities
     */
    public clear(): void {
      // Remove all entities
      for (const entityId of this.entities.keys()) {
        this.removeEntity(entityId);
      }
    }
    
    /**
     * Dispose the entity manager
     */
    public dispose(): void {
      // Clear all entities
      this.clear();
      
      // Dispose templates
      for (const template of this.templates.values()) {
        template.sourceMesh.dispose();
      }
      
      // Clear collections
      this.templates.clear();
      this.entities.clear();
      
      // Dispose root
      this.entityRoot.dispose();
    }
  }