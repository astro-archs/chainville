import {
  Scene,
  Vector3,
  Color3,
  StandardMaterial,
  MeshBuilder,
  Mesh,
  HighlightLayer,
  Ray,
  PickingInfo,
  Observable,
  LinesMesh,
  VertexData
} from "@babylonjs/core";

// Cell data interface (now primarily logical)
export interface CellData {
  id: string;
  worldX: number;  // World position X
  worldZ: number;  // World position Z
  gridX: number;   // Grid coordinates X
  gridZ: number;   // Grid coordinates Z
  district: number; // District ID
  isOccupied: boolean;
  itemId?: string;  // Reference to item by ID instead of mesh
}

// District data interface (now primarily logical)
export interface DistrictData {
  id: number;
  gridX: number;   // Grid coordinates X
  gridZ: number;   // Grid coordinates Z
  worldX: number;  // World position X
  worldZ: number;  // World position Z
  size: number;
  cellsPerSide: number;
  visualMesh?: Mesh; // Optional visual representation
}

/**
 * OptimizedGridSystem class for large-scale grid systems
 * Uses mathematical calculations instead of individual meshes
 */
export class GridSystem {
  private scene: Scene;
  private districts: Map<number, DistrictData> = new Map();
  private cells: Map<string, CellData> = new Map();
  private highlightLayer: HighlightLayer;
  private gridLines: LinesMesh[] = [];
  
  // Configuration
  private districtGridSize: number;
  private districtSize: number;
  private districtSpacing: number;
  private cellsPerDistrict: number;
  private cellSize: number;
  
  // Visual representation
  private groundPlane: Mesh;
  private activeDistrictVisual: Mesh | null = null;
  private activeCellVisual: Mesh | null = null;
  
  // Selection state
  private selectedDistrictId: number | null = null;
  private selectedCellId: string | null = null;
  
  // Observables for selection events
  public onDistrictSelectedObservable = new Observable<number | null>();
  public onCellSelectedObservable = new Observable<CellData | null>();
  
  /**
   * Create a new OptimizedGridSystem
   * @param scene Babylon.js Scene
   * @param config Grid configuration options
   */
  constructor(
    scene: Scene,
    config: {
      districtGridSize?: number,
      districtSize?: number,
      districtSpacing?: number,
      cellsPerDistrict?: number,
    } = {}
  ) {
    this.scene = scene;
    
    // Set configuration with defaults
    this.districtGridSize = config.districtGridSize || 10;
    this.districtSize = config.districtSize || 100;
    this.districtSpacing = config.districtSpacing || 100;
    this.cellsPerDistrict = config.cellsPerDistrict || 10;
    
    // Calculate cell size
    this.cellSize = this.districtSize / this.cellsPerDistrict;
    
    // Create highlight layer for selections
    this.highlightLayer = new HighlightLayer("gridHighlightLayer", this.scene);
    
    // Create ground plane
    this.groundPlane = this.createGroundPlane();
    
    // Initialize the logical grid
    this.initializeLogicalGrid();
    
    // Create visual grid lines for active area
    this.createGridLines();
    
    // Setup picking
    this.setupPicking();
  }
  
  /**
   * Create a ground plane for the entire grid
   */
  private createGroundPlane(): Mesh {
    // Calculate total grid size
    const totalSize = this.districtGridSize * this.districtSpacing;
    
    // Create ground mesh
    const ground = MeshBuilder.CreateGround(
      "gridGround",
      { width: totalSize, height: totalSize },
      this.scene
    );
    
    // Ground material
    const groundMaterial = new StandardMaterial("groundMaterial", this.scene);
    groundMaterial.diffuseColor = new Color3(0.2, 0.5, 0.2); // Natural green
    groundMaterial.specularColor = new Color3(0, 0, 0); // Less shiny = more natural
    ground.material = groundMaterial;
    
    
    return ground;
  }
  
  /**
   * Initialize the logical grid without creating meshes
   */
  private initializeLogicalGrid(): void {
    // Calculate district offsets
    const offset = Math.floor(this.districtGridSize / 2);
    
    // Create districts
    for (let x = 0; x < this.districtGridSize; x++) {
      for (let z = 0; z < this.districtGridSize; z++) {
        const districtId = x * this.districtGridSize + z;
        
        // Calculate district world position
        const worldX = (x - offset) * this.districtSpacing;
        const worldZ = (z - offset) * this.districtSpacing;
        
        // Create district data
        const districtData: DistrictData = {
          id: districtId,
          gridX: x,
          gridZ: z,
          worldX,
          worldZ,
          size: this.districtSize,
          cellsPerSide: this.cellsPerDistrict
        };
        
        this.districts.set(districtId, districtData);
        
        // Create cells for this district
        this.createLogicalCells(districtData);
      }
    }
  }
  
  /**
   * Create logical cells for a district
   * @param district District data
   */
  private createLogicalCells(district: DistrictData): void {
    const { id, worldX, worldZ, size, cellsPerSide } = district;
    const cellSize = size / cellsPerSide;
    
    // Calculate cell offset
    const offset = size / 2 - cellSize / 2;
    
    // Create cells
    for (let x = 0; x < cellsPerSide; x++) {
      for (let z = 0; z < cellsPerSide; z++) {
        const cellId = `${id}_${x}_${z}`;
        
        // Calculate cell world position
        const cellWorldX = worldX - offset + x * cellSize;
        const cellWorldZ = worldZ - offset + z * cellSize;
        
        // Create cell data
        const cellData: CellData = {
          id: cellId,
          worldX: cellWorldX,
          worldZ: cellWorldZ,
          gridX: x,
          gridZ: z,
          district: id,
          isOccupied: false
        };
        
        this.cells.set(cellId, cellData);
      }
    }
  }
  
  /**
   * Create grid lines for visual representation
   */
  private createGridLines(): void {
    // This will be called when a district is selected
    // to show the grid lines for the active district
  }
  
  /**
   * Create visual representation of a district
   * @param districtId District ID
   */
  private createDistrictVisual(districtId: number): Mesh {
    const district = this.districts.get(districtId);
    if (!district) {
      throw new Error(`District ${districtId} not found`);
    }
    
    // Create district visual mesh
    const districtMesh = MeshBuilder.CreateGround(
      `districtVisual_${districtId}`,
      { width: district.size, height: district.size },
      this.scene
    );
    
    // Position the mesh
    districtMesh.position.x = district.worldX;
    districtMesh.position.z = district.worldZ;
    districtMesh.position.y = 0.01; // Slightly above ground
    
    // Material
    const material = new StandardMaterial(`districtMaterial_${districtId}`, this.scene);
    material.diffuseColor = new Color3(0.8, 0.6, 0.3);
    material.alpha = 0.5; // Semi-transparent
    districtMesh.material = material;
    
    return districtMesh;
  }
  
  /**
   * Create visual representation of a cell
   * @param cellId Cell ID
   */
  private createCellVisual(cellId: string): Mesh {
    const cell = this.cells.get(cellId);
    if (!cell) {
      throw new Error(`Cell ${cellId} not found`);
    }
    
    // Create cell visual mesh
    const cellMesh = MeshBuilder.CreateGround(
      `cellVisual_${cellId}`,
      { width: this.cellSize * 0.9, height: this.cellSize * 0.9 },
      this.scene
    );
    
    // Position the mesh
    cellMesh.position.x = cell.worldX;
    cellMesh.position.z = cell.worldZ;
    cellMesh.position.y = 0.02; // Slightly above district
    
    // Material
    const material = new StandardMaterial(`cellMaterial_${cellId}`, this.scene);
    material.diffuseColor = new Color3(0.3, 0.6, 0.8);
    material.alpha = 0.6; // Semi-transparent
    cellMesh.material = material;
    
    return cellMesh;
  }
  
  /**
   * Setup picking for the ground plane
   */
  private setupPicking(): void {
    // Setup picking on the ground plane
    this.scene.onPointerDown = (evt) => {
      const pick = this.scene.pick(
        this.scene.pointerX,
        this.scene.pointerY,
        (mesh) => mesh === this.groundPlane
      );
      
      if (pick.hit) {
        const worldPosition = pick.pickedPoint;
        if (worldPosition) {
          // Find the district and cell at this position
          const result = this.getCellAndDistrictAtPosition(worldPosition);
          
          if (result) {
            const { districtId, cellId } = result;
            
            // If clicking on a different district, select it
            if (this.selectedDistrictId !== districtId) {
              this.selectDistrict(districtId);
            }
            
            // Select the cell
            this.selectCell(cellId);
          }
        }
      }
    };
  }
  
  /**
   * Get the district and cell at a world position
   * @param position World position
   * @returns Object with districtId and cellId, or null if not found
   */
  public getCellAndDistrictAtPosition(position: Vector3): { districtId: number, cellId: string } | null {
    // Find the district at this position
    for (const [id, district] of this.districts.entries()) {
      // Check if position is within district bounds
      const halfSize = district.size / 2;
      if (
        position.x >= district.worldX - halfSize &&
        position.x <= district.worldX + halfSize &&
        position.z >= district.worldZ - halfSize &&
        position.z <= district.worldZ + halfSize
      ) {
        // Found the district, now find the cell
        const cellsPerSide = district.cellsPerSide;
        const cellSize = district.size / cellsPerSide;
        
        // Calculate relative position within district
        const relX = position.x - (district.worldX - halfSize);
        const relZ = position.z - (district.worldZ - halfSize);
        
        // Calculate cell grid coordinates
        const cellX = Math.floor(relX / cellSize);
        const cellZ = Math.floor(relZ / cellSize);
        
        // Make sure we're within bounds
        if (cellX >= 0 && cellX < cellsPerSide && cellZ >= 0 && cellZ < cellsPerSide) {
          const cellId = `${id}_${cellX}_${cellZ}`;
          return { districtId: id, cellId };
        }
      }
    }
    
    return null;
  }
  
  /**
   * Select a district
   * @param districtId District ID
   */
  public selectDistrict(districtId: number): void {
    if (this.selectedDistrictId === districtId) {
      return; // Already selected
    }
    
    // Deselect previous district
    if (this.selectedDistrictId !== null) {
      this.deselectDistrict();
    }
    
    // Select new district
    this.selectedDistrictId = districtId;
    
    // Create visual representation if it doesn't exist
    if (!this.activeDistrictVisual) {
      this.activeDistrictVisual = this.createDistrictVisual(districtId);
    } else {
      // Update existing visual
      const district = this.districts.get(districtId);
      if (district) {
        this.activeDistrictVisual.position.x = district.worldX;
        this.activeDistrictVisual.position.z = district.worldZ;
      }
    }
    
    // Show district cell grid lines
    this.createDistrictGridLines(districtId);
    
    // Notify observers
    this.onDistrictSelectedObservable.notifyObservers(districtId);
  }
  
  /**
   * Deselect the current district
   */
  private deselectDistrict(): void {
    if (this.selectedDistrictId === null) {
      return;
    }
    
    // Remove district visual
    if (this.activeDistrictVisual) {
      this.activeDistrictVisual.dispose();
      this.activeDistrictVisual = null;
    }
    
    // Remove cell visual
    if (this.activeCellVisual) {
      this.activeCellVisual.dispose();
      this.activeCellVisual = null;
    }
    
    // Remove grid lines
    this.removeDistrictGridLines();
    
    // Clear selection
    this.selectedDistrictId = null;
    this.selectedCellId = null;
    
    // Notify observers
    this.onDistrictSelectedObservable.notifyObservers(null);
    this.onCellSelectedObservable.notifyObservers(null);
  }
  
    /**
   * Select a cell
   * @param cellId Cell ID
   */
    public selectCell(cellId: string): void {
      if (this.selectedCellId === cellId) {
        return; // Already selected
      }
      
      // Deselect previous cell
      if (this.selectedCellId !== null) {
        this.deselectCell();
      }
      
      // Select new cell
      this.selectedCellId = cellId;
      
      // Get cell data
      const cell = this.cells.get(cellId);
      if (!cell) {
        console.error(`Cell ${cellId} not found`);
        return;
      }
      
      // Create visual representation if it doesn't exist
      if (!this.activeCellVisual) {
        this.activeCellVisual = this.createCellVisual(cellId);
      } else {
        // Update existing visual
        this.activeCellVisual.position.x = cell.worldX;
        this.activeCellVisual.position.z = cell.worldZ;
      }
      
      // Notify observers
      this.onCellSelectedObservable.notifyObservers(cell);
    }
    
    /**
     * Deselect the current cell
     */
    private deselectCell(): void {
      if (this.selectedCellId === null) {
        return;
      }
      
      // Remove cell visual
      if (this.activeCellVisual) {
        this.activeCellVisual.dispose();
        this.activeCellVisual = null;
      }
      
      // Clear selection
      this.selectedCellId = null;
      
      // Notify observers
      this.onCellSelectedObservable.notifyObservers(null);
    }
    
    /**
     * Create grid lines for a district
     * @param districtId District ID
     */
    private createDistrictGridLines(districtId: number): void {
      // Remove existing grid lines
      this.removeDistrictGridLines();
      
      const district = this.districts.get(districtId);
      if (!district) return;
      
      const { worldX, worldZ, size, cellsPerSide } = district;
      const cellSize = size / cellsPerSide;
      const halfSize = size / 2;
      
      // Calculate boundaries
      const startX = worldX - halfSize;
      const startZ = worldZ - halfSize;
      const endX = worldX + halfSize;
      const endZ = worldZ + halfSize;
      
      // Create vertical lines
      for (let i = 0; i <= cellsPerSide; i++) {
        const x = startX + i * cellSize;
        const points = [
          new Vector3(x, 0.05, startZ),
          new Vector3(x, 0.05, endZ)
        ];
        
        const lines = MeshBuilder.CreateLines(`gridLineV_${i}`, { points }, this.scene);
        lines.color = new Color3(0.5, 0.5, 0.5);
        this.gridLines.push(lines);
      }
      
      // Create horizontal lines
      for (let i = 0; i <= cellsPerSide; i++) {
        const z = startZ + i * cellSize;
        const points = [
          new Vector3(startX, 0.05, z),
          new Vector3(endX, 0.05, z)
        ];
        
        const lines = MeshBuilder.CreateLines(`gridLineH_${i}`, { points }, this.scene);
        lines.color = new Color3(0.5, 0.5, 0.5);
        this.gridLines.push(lines);
      }
    }
    
    /**
     * Remove district grid lines
     */
    private removeDistrictGridLines(): void {
      this.gridLines.forEach(line => line.dispose());
      this.gridLines = [];
    }
    
    /**
     * Place an item at a cell
     * @param cellId Cell ID
     * @param itemId Unique ID for the item
     * @param createItemFn Function to create the item
     * @returns Success flag
     */
    public placeItem(cellId: string, itemId: string, createItemFn: (position: Vector3) => void): boolean {
      const cell = this.cells.get(cellId);
      if (!cell || cell.isOccupied) return false;
      
      // Mark as occupied
      cell.isOccupied = true;
      cell.itemId = itemId;
      
      // Create the item at the cell position
      const position = new Vector3(cell.worldX, 0, cell.worldZ);
      createItemFn(position);
      
      return true;
    }
    
    /**
     * Remove an item from a cell
     * @param cellId Cell ID
     * @returns The item ID that was removed, or null if no item
     */
    public removeItem(cellId: string): string | null {
      const cell = this.cells.get(cellId);
      if (!cell || !cell.isOccupied || !cell.itemId) return null;
      
      const itemId = cell.itemId;
      
      // Mark as unoccupied
      cell.isOccupied = false;
      cell.itemId = undefined;
      
      return itemId;
    }
    
    /**
     * Get cell by ID
     * @param cellId Cell ID
     * @returns Cell data or undefined
     */
    public getCell(cellId: string): CellData | undefined {
      return this.cells.get(cellId);
    }
    
    /**
     * Get district by ID
     * @param districtId District ID
     * @returns District data or undefined
     */
    public getDistrict(districtId: number): DistrictData | undefined {
      return this.districts.get(districtId);
    }
    
    /**
     * Get all cells in a district
     * @param districtId District ID
     * @returns Array of cell data
     */
    public getCellsInDistrict(districtId: number): CellData[] {
      const cells: CellData[] = [];
      for (const cell of this.cells.values()) {
        if (cell.district === districtId) {
          cells.push(cell);
        }
      }
      return cells;
    }
    
    /**
     * Get cell at world position
     * @param position World position
     * @returns Cell data or null if not found
     */
    public getCellAtPosition(position: Vector3): CellData | null {
      const result = this.getCellAndDistrictAtPosition(position);
      if (!result) return null;
      
      return this.cells.get(result.cellId) || null;
    }
    
    /**
     * Find path between two cells
     * @param startCellId Starting cell ID
     * @param endCellId Ending cell ID
     * @returns Array of cell IDs representing the path, or null if no path found
     */
    public findPath(startCellId: string, endCellId: string): string[] | null {
      // Simple implementation of A* pathfinding algorithm
      // This could be expanded with more sophisticated pathfinding
      
      const startCell = this.cells.get(startCellId);
      const endCell = this.cells.get(endCellId);
      
      if (!startCell || !endCell) return null;
      
      // A* pathfinding implementation would go here
      // For now, returning a straight line path
      return [startCellId, endCellId];
    }
    
    /**
     * Dispose the grid system
     */
    public dispose(): void {
      // Remove all meshes
      if (this.groundPlane) {
        this.groundPlane.dispose();
      }
      
      if (this.activeDistrictVisual) {
        this.activeDistrictVisual.dispose();
      }
      
      if (this.activeCellVisual) {
        this.activeCellVisual.dispose();
      }
      
      // Remove grid lines
      this.removeDistrictGridLines();
      
      // Dispose highlight layer
      this.highlightLayer.dispose();
      
      // Clear data structures
      this.districts.clear();
      this.cells.clear();
    }
  }