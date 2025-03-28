import { Vector3 } from "@babylonjs/core";

/**
 * Spatial Grid Cell for partitioning large worlds
 */
export interface SpatialCell {
  x: number;
  z: number;
  key: string;
  entities: Set<string>;
}

/**
 * SpatialPartitioning class for efficient entity queries in large worlds
 */
export class SpatialPartitioning {
  private cells: Map<string, SpatialCell> = new Map();
  private cellSize: number;
  private entityPositions: Map<string, { x: number, z: number }> = new Map();
  
  /**
   * Create a new SpatialPartitioning system
   * @param cellSize Size of each spatial cell (different from grid cells)
   */
  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
  }
  
  /**
   * Convert world coordinates to cell coordinates
   * @param worldX World X coordinate
   * @param worldZ World Z coordinate
   * @returns Cell coordinates
   */
  private worldToCell(worldX: number, worldZ: number): { x: number, z: number } {
    return {
      x: Math.floor(worldX / this.cellSize),
      z: Math.floor(worldZ / this.cellSize)
    };
  }
  
  /**
   * Generate a unique key for a cell
   * @param x Cell X coordinate
   * @param z Cell Z coordinate
   * @returns Cell key
   */
  private getCellKey(x: number, z: number): string {
    return `${x},${z}`;
  }
  
  /**
   * Get or create a spatial cell
   * @param x Cell X coordinate
   * @param z Cell Z coordinate
   * @returns Spatial cell
   */
  private getOrCreateCell(x: number, z: number): SpatialCell {
    const key = this.getCellKey(x, z);
    
    let cell = this.cells.get(key);
    if (!cell) {
      cell = {
        x,
        z,
        key,
        entities: new Set()
      };
      this.cells.set(key, cell);
    }
    
    return cell;
  }
  
  /**
   * Add an entity to the spatial partitioning system
   * @param entityId Entity ID
   * @param position World position
   */
  public addEntity(entityId: string, position: Vector3): void {
    // Convert world position to cell coordinates
    const { x, z } = this.worldToCell(position.x, position.z);
    
    // Get or create the cell
    const cell = this.getOrCreateCell(x, z);
    
    // Add entity to cell
    cell.entities.add(entityId);
    
    // Store entity position
    this.entityPositions.set(entityId, { x: position.x, z: position.z });
  }
  
  /**
   * Update entity position
   * @param entityId Entity ID
   * @param position New world position
   */
  public updateEntity(entityId: string, position: Vector3): void {
    // Get old position
    const oldPos = this.entityPositions.get(entityId);
    if (!oldPos) {
      // Entity not found, just add it
      this.addEntity(entityId, position);
      return;
    }
    
    // Convert old position to cell coordinates
    const oldCell = this.worldToCell(oldPos.x, oldPos.z);
    
    // Convert new position to cell coordinates
    const newCell = this.worldToCell(position.x, position.z);
    
    // If cell hasn't changed, just update the position
    if (oldCell.x === newCell.x && oldCell.z === newCell.z) {
      this.entityPositions.set(entityId, { x: position.x, z: position.z });
      return;
    }
    
    // Remove from old cell
    const oldCellKey = this.getCellKey(oldCell.x, oldCell.z);
    const oldCellObj = this.cells.get(oldCellKey);
    if (oldCellObj) {
      oldCellObj.entities.delete(entityId);
      
      // Clean up empty cells
      if (oldCellObj.entities.size === 0) {
        this.cells.delete(oldCellKey);
      }
    }
    
    // Add to new cell
    const newCellObj = this.getOrCreateCell(newCell.x, newCell.z);
    newCellObj.entities.add(entityId);
    
    // Update entity position
    this.entityPositions.set(entityId, { x: position.x, z: position.z });
  }
  
  /**
   * Remove an entity from the spatial partitioning system
   * @param entityId Entity ID
   */
  public removeEntity(entityId: string): void {
    // Get entity position
    const pos = this.entityPositions.get(entityId);
    if (!pos) return;
    
    // Convert to cell coordinates
    const { x, z } = this.worldToCell(pos.x, pos.z);
    
    // Get cell
    const cellKey = this.getCellKey(x, z);
    const cell = this.cells.get(cellKey);
    if (!cell) return;
    
    // Remove entity from cell
    cell.entities.delete(entityId);
    
    // Clean up empty cells
    if (cell.entities.size === 0) {
      this.cells.delete(cellKey);
    }
    
    // Remove entity position
    this.entityPositions.delete(entityId);
  }
  
  /**
   * Get all entities within a radius of a position
   * @param position Center position
   * @param radius Search radius
   * @returns Array of entity IDs
   */
  public getEntitiesInRadius(position: Vector3, radius: number): string[] {
    const result: string[] = [];
    const radiusSquared = radius * radius;
    
    // Calculate the bounds of the search in cell coordinates
    const center = this.worldToCell(position.x, position.z);
    const cellRadius = Math.ceil(radius / this.cellSize);
    
    // Iterate over cells within the search bounds
    for (let x = center.x - cellRadius; x <= center.x + cellRadius; x++) {
      for (let z = center.z - cellRadius; z <= center.z + cellRadius; z++) {
        const cellKey = this.getCellKey(x, z);
        const cell = this.cells.get(cellKey);
        
        if (!cell) continue;
        
        // Check each entity in the cell
        for (const entityId of cell.entities) {
          const entityPos = this.entityPositions.get(entityId);
          if (!entityPos) continue;
          
          // Calculate squared distance
          const dx = entityPos.x - position.x;
          const dz = entityPos.z - position.z;
          const distSquared = dx * dx + dz * dz;
          
          // Add to result if within radius
          if (distSquared <= radiusSquared) {
            result.push(entityId);
          }
        }
      }
    }
    
    return result;
  }
  
  /**
   * Get all entities in a rectangular area
   * @param minX Minimum X coordinate
   * @param minZ Minimum Z coordinate
   * @param maxX Maximum X coordinate
   * @param maxZ Maximum Z coordinate
   * @returns Array of entity IDs
   */
  public getEntitiesInArea(minX: number, minZ: number, maxX: number, maxZ: number): string[] {
    const result: string[] = [];
    
    // Calculate the bounds of the search in cell coordinates
    const minCell = this.worldToCell(minX, minZ);
    const maxCell = this.worldToCell(maxX, maxZ);
    
    // Iterate over cells within the search bounds
    for (let x = minCell.x; x <= maxCell.x; x++) {
      for (let z = minCell.z; z <= maxCell.z; z++) {
        const cellKey = this.getCellKey(x, z);
        const cell = this.cells.get(cellKey);
        
        if (!cell) continue;
        
        // Check each entity in the cell
        for (const entityId of cell.entities) {
          const entityPos = this.entityPositions.get(entityId);
          if (!entityPos) continue;
          
          // Add to result if within bounds
          if (entityPos.x >= minX && entityPos.x <= maxX && 
              entityPos.z >= minZ && entityPos.z <= maxZ) {
            result.push(entityId);
          }
        }
      }
    }
    
    return result;
  }
  
  /**
   * Get all active cells
   * @returns Array of active spatial cells
   */
  public getActiveCells(): SpatialCell[] {
    return Array.from(this.cells.values());
  }
  
  /**
   * Clear the spatial partitioning system
   */
  public clear(): void {
    this.cells.clear();
    this.entityPositions.clear();
  }
}