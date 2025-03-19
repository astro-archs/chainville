import {
    Scene, 
    Mesh, 
    MeshBuilder,
    Vector3,
    Color3,
    StandardMaterial,
    ActionManager,
    ExecuteCodeAction,
    HighlightLayer,
    TransformNode
  } from "@babylonjs/core";
  
  // Cell data interface
  export interface CellData {
    id: string;
    districtId: number;
    gridX: number;
    gridZ: number;
    mesh: Mesh;
    isOccupied: boolean;
    itemMesh?: Mesh;
  }
  
  // District data interface
  export interface DistrictData {
    id: number;
    mesh: Mesh;
    cells: CellData[];
    position: Vector3;
    size: number;
  }
  
  /**
   * GridSystem class to manage a hierarchical grid system with districts and cells
   */
  export class GridSystem {
    private scene: Scene;
    private districts: DistrictData[] = [];
    private highlightLayer: HighlightLayer;
    
    // Selection state
    private selectedDistrictId: number | null = null;
    private selectedCellId: string | null = null;
    
    // Configuration
    private districtGridSize: number;
    private districtSize: number;
    private districtSpacing: number;
    private cellsPerDistrict: number;
    private cellSpacing: number;
    
    // Selection colors
    private districtHighlightColor = new Color3(0.3, 0.6, 1); // Blue
    private cellHighlightColor = new Color3(1, 0.6, 0.3); // Orange
    
    // Callback functions
    private onDistrictSelected: (districtId: number | null) => void;
    private onCellSelected: (cellId: string | null, cellData: CellData | null) => void;
    
    /**
     * Create a new GridSystem
     * @param scene Babylon.js Scene
     * @param config Grid configuration options
     * @param callbacks Callback functions for selection events
     */
    constructor(
      scene: Scene, 
      config: {
        districtGridSize?: number,
        districtSize?: number,
        districtSpacing?: number,
        cellsPerDistrict?: number,
        cellSpacing?: number,
      } = {},
      callbacks: {
        onDistrictSelected?: (districtId: number | null) => void,
        onCellSelected?: (cellId: string | null, cellData: CellData | null) => void
      } = {}
    ) {
      this.scene = scene;
      
      // Set configuration with defaults
      this.districtGridSize = config.districtGridSize || 3;
      this.districtSize = config.districtSize || 10;
      this.districtSpacing = config.districtSpacing || 15;
      this.cellsPerDistrict = config.cellsPerDistrict || 4;
      this.cellSpacing = config.cellSpacing || 0.1; // Gap between cells
      
      // Create highlight layer for selections
      this.highlightLayer = new HighlightLayer("gridHighlightLayer", this.scene);
      
      // Set callbacks
      this.onDistrictSelected = callbacks.onDistrictSelected || (() => {});
      this.onCellSelected = callbacks.onCellSelected || (() => {});
      
      // Initialize grid
      this.createGrid();
    }
    
    /**
     * Create the entire grid system
     */
    private createGrid(): void {
      // Create parent node for all districts
      const districtsParent = new TransformNode("districtsParent", this.scene);
      
      // Create districts
      for (let x = 0; x < this.districtGridSize; x++) {
        for (let z = 0; z < this.districtGridSize; z++) {
          const districtId = x * this.districtGridSize + z;
          
          // Position for this district
          const posX = (x - Math.floor(this.districtGridSize/2)) * this.districtSpacing;
          const posZ = (z - Math.floor(this.districtGridSize/2)) * this.districtSpacing;
          
          this.createDistrict(districtId, new Vector3(posX, 0.05, posZ));
        }
      }
    }
    
    /**
     * Create a single district
     * @param id District ID
     * @param position District position
     */
    private createDistrict(id: number, position: Vector3): void {
      // Create district ground
      const district = MeshBuilder.CreateGround(
        `district_${id}`,
        { width: this.districtSize, height: this.districtSize },
        this.scene
      );
      
      district.position = position;
      
      // District material
      const districtMaterial = new StandardMaterial(`districtMat_${id}`, this.scene);
      districtMaterial.diffuseColor = new Color3(0.96, 0.64, 0.38);
      district.material = districtMaterial;
      
      // Add metadata
      district.metadata = {
        type: 'district',
        id: id
      };
      
      // Create district data object
      const districtData: DistrictData = {
        id,
        mesh: district,
        cells: [],
        position,
        size: this.districtSize
      };
      
      // Make district selectable
      district.actionManager = new ActionManager(this.scene);
      district.actionManager.registerAction(
        new ExecuteCodeAction(
          ActionManager.OnPickTrigger,
          () => {
            this.selectDistrict(id);
          }
        )
      );
      
      // Create cells for this district
      this.createCells(districtData);
      
      // Add to districts array
      this.districts.push(districtData);
    }
    
    /**
     * Create cells within a district
     * @param districtData District data
     */
    private createCells(districtData: DistrictData): void {
      const { id, position, size } = districtData;
      const cellSize = size / this.cellsPerDistrict;
      
      // Calculate start position (top-left corner of district)
      const startX = position.x - size/2 + cellSize/2;
      const startZ = position.z - size/2 + cellSize/2;
      
      // Create cells
      for (let x = 0; x < this.cellsPerDistrict; x++) {
        for (let z = 0; z < this.cellsPerDistrict; z++) {
          const cellId = `${id}_${x}_${z}`;
          
          // Position for this cell
          const posX = startX + x * cellSize;
          const posZ = startZ + z * cellSize;
          
          // Create cell ground with spacing
          const cell = MeshBuilder.CreateGround(
            `cell_${cellId}`,
            { width: cellSize * (1 - this.cellSpacing), height: cellSize * (1 - this.cellSpacing) },
            this.scene
          );
          
          cell.position.x = posX;
          cell.position.z = posZ;
          cell.position.y = 0.1; // Above district
          
          // Initially all cells are invisible until district is selected
          cell.isVisible = false;
          
          // Cell material
          const cellMaterial = new StandardMaterial(`cellMat_${cellId}`, this.scene);
          cellMaterial.diffuseColor = new Color3(0.7, 0.7, 0.7);
          cell.material = cellMaterial;
          
          // Add metadata
          cell.metadata = {
            type: 'cell',
            id: cellId,
            districtId: id,
            gridX: x,
            gridZ: z
          };
          
          // Create cell data
          const cellData: CellData = {
            id: cellId,
            districtId: id,
            gridX: x,
            gridZ: z,
            mesh: cell,
            isOccupied: false
          };
          
          // Make cell selectable
          cell.actionManager = new ActionManager(this.scene);
          cell.actionManager.registerAction(
            new ExecuteCodeAction(
              ActionManager.OnPickTrigger,
              () => {
                this.selectCell(cellId);
              }
            )
          );
          
          // Add to cells array
          districtData.cells.push(cellData);
        }
      }
    }
    
    /**
     * Select a district
     * @param districtId District ID to select
     */
    public selectDistrict(districtId: number): void {
      // Deselect previously selected district
      if (this.selectedDistrictId !== null) {
        // Hide cells of previously selected district
        const prevDistrict = this.getDistrictById(this.selectedDistrictId);
        if (prevDistrict) {
          prevDistrict.cells.forEach(cell => {
            cell.mesh.isVisible = false;
          });
        }
        
        // Remove all highlights
        this.highlightLayer.removeAllMeshes();
      }
      
      // If clicking on already selected district, deselect it
      if (this.selectedDistrictId === districtId) {
        this.selectedDistrictId = null;
        this.selectedCellId = null;
        this.onDistrictSelected(null);
        this.onCellSelected(null, null);
        return;
      }
      
      // Select new district
      this.selectedDistrictId = districtId;
      this.selectedCellId = null;
      
      // Notify listeners
      this.onDistrictSelected(districtId);
      this.onCellSelected(null, null);
      
      // Get district data
      const district = this.getDistrictById(districtId);
      if (!district) return;
      
      // Highlight selected district
      this.highlightLayer.addMesh(district.mesh, this.districtHighlightColor);
      
      // Show cells of selected district
      district.cells.forEach(cell => {
        cell.mesh.isVisible = true;
      });
    }
    
    /**
     * Select a cell
     * @param cellId Cell ID to select
     */
    public selectCell(cellId: string): void {
      const cellData = this.getCellById(cellId);
      if (!cellData) return;
      
      // If clicking on already selected cell, deselect it
      if (this.selectedCellId === cellId) {
        this.selectedCellId = null;
        this.onCellSelected(null, null);
        
        // Find all cells in current district and remove cell highlights
        if (this.selectedDistrictId !== null) {
          const district = this.getDistrictById(this.selectedDistrictId);
          if (district) {
            district.cells.forEach(cell => {
              this.highlightLayer.removeMesh(cell.mesh);
            });
            
            // Keep district highlighted
            this.highlightLayer.addMesh(district.mesh, this.districtHighlightColor);
          }
        }
        return;
      }
      
      // Select new cell
      this.selectedCellId = cellId;
      
      // Notify listeners
      this.onCellSelected(cellId, cellData);
      
      // Find this cell and highlight it
      if (this.selectedDistrictId !== null) {
        const district = this.getDistrictById(this.selectedDistrictId);
        if (district) {
          // Remove cell highlights but keep district highlight
          district.cells.forEach(cell => {
            if (cell.id === cellId) {
              this.highlightLayer.addMesh(cell.mesh, this.cellHighlightColor);
            } else {
              this.highlightLayer.removeMesh(cell.mesh);
            }
          });
        }
      }
    }
    
    /**
     * Place an item on a cell
     * @param cellId Cell ID to place item on
     * @param itemCreateFn Function to create the item mesh
     * @returns Success flag
     */
    public placeItem(cellId: string, itemCreateFn: (position: Vector3) => Mesh): boolean {
      const cellData = this.getCellById(cellId);
      if (!cellData || cellData.isOccupied) return false;
      
      // Get cell position
      const position = new Vector3(
        cellData.mesh.position.x,
        cellData.mesh.position.y,
        cellData.mesh.position.z
      );
      
      // Create item at cell position
      const itemMesh = itemCreateFn(position);
      
      // Mark cell as occupied
      cellData.isOccupied = true;
      cellData.itemMesh = itemMesh;
      
      return true;
    }
    
    /**
     * Remove an item from a cell
     * @param cellId Cell ID to remove item from
     */
    public removeItem(cellId: string): boolean {
      const cellData = this.getCellById(cellId);
      if (!cellData || !cellData.isOccupied || !cellData.itemMesh) return false;
      
      // Dispose item mesh
      cellData.itemMesh.dispose();
      
      // Mark cell as unoccupied
      cellData.isOccupied = false;
      cellData.itemMesh = undefined;
      
      return true;
    }
    
    /**
     * Clear all items from the grid
     */
    public clearAllItems(): void {
      this.districts.forEach(district => {
        district.cells.forEach(cell => {
          if (cell.isOccupied && cell.itemMesh) {
            cell.itemMesh.dispose();
            cell.isOccupied = false;
            cell.itemMesh = undefined;
          }
        });
      });
    }
    
    /**
     * Get currently selected district ID
     */
    public getSelectedDistrictId(): number | null {
      return this.selectedDistrictId;
    }
    
    /**
     * Get currently selected cell ID
     */
    public getSelectedCellId(): string | null {
      return this.selectedCellId;
    }
    
    /**
     * Get district by ID
     * @param id District ID
     */
    public getDistrictById(id: number): DistrictData | undefined {
      return this.districts.find(district => district.id === id);
    }
    
    /**
     * Get cell by ID
     * @param id Cell ID
     */
    public getCellById(id: string): CellData | undefined {
      for (const district of this.districts) {
        const cell = district.cells.find(cell => cell.id === id);
        if (cell) return cell;
      }
      return undefined;
    }
    
    /**
     * Show all districts
     */
    public showAllDistricts(): void {
      this.districts.forEach(district => {
        district.mesh.isVisible = true;
      });
    }
    
    /**
     * Hide all districts
     */
    public hideAllDistricts(): void {
      this.districts.forEach(district => {
        district.mesh.isVisible = false;
      });
    }
    
    /**
     * Dispose the grid system
     */
    public dispose(): void {
      // Dispose all meshes
      this.districts.forEach(district => {
        district.mesh.dispose();
        district.cells.forEach(cell => {
          cell.mesh.dispose();
          if (cell.itemMesh) {
            cell.itemMesh.dispose();
          }
        });
      });
      
      // Clear highlight layer
      this.highlightLayer.dispose();
    }
  }