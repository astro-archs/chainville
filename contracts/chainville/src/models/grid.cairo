use starknet::{ContractAddress, get_block_timestamp, get_tx_info};
use core::num::traits::Zero;
use core::hash::HashStateTrait;
use core::poseidon::PoseidonTrait;
use chainville::models::resource::{ResourceType};
use chainville::constants::{CELL_SPACING,CELLS_PER_DISTRICT,DISTRICT_GRID_SIZE,DISTRICT_SIZE,DISTRICT_SPACING};



// Cell position structure
#[derive(Copy, Drop, Serde, Debug)]
pub struct Coordinates {
    pub x: u32,
    pub y: u32,
    pub z: u32,
}

#[derive(Copy, Drop, Serde, Debug)]
pub struct GridPosition {
    pub row: u16,
    pub col: u16,
}

// Cell structure - smallest unit in the grid
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Cell {
    #[key]
    pub game_id: u32,              // Reference to the parent game
    #[key]
    pub district_id: u32,          // Reference to the parent district
    #[key]
    pub cell_id: felt252,          // Unique identifier for the cell (format: district_x_z)
    
    // Cell position within district
    pub grid_x: u32,
    pub grid_y: u32,
    pub grid_z: u32,
    
    // Cell state
    pub is_occupied: bool,
    pub building_id: felt252,      // Empty if not occupied
    pub building_type: u8,         // 0 if not occupied
    pub owner: ContractAddress,    // 0 if not owned
    
    // Visual properties
    pub height_offset: u16,        // Height offset for terrain variations
    pub terrain_type: u8,          // 0: normal, 1: water, 2: forest, etc.
    
    // Last update timestamp
    pub last_update: u64,
}
// District structure - container for cells
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct District {
    #[key]
    pub game_id: u32,              // Reference to the parent game
    #[key]
    pub district_id: u32,          // Unique identifier for the district
    #[key]
    pub grid_id: u32,
    #[key]
    pub owner: ContractAddress,    // District owner (0 if not owned)
    
    // District position in the world grid
    pub grid_x: u32,
    pub grid_y: u32,
    pub grid_z: u32,
    
    // District properties
    pub name: felt252,
    pub size: u32,                 // Size of the district (width/height)
    pub cells_per_side: u32,        // Number of cells per side of district
    pub total_cells: u32,          // Total number of cells in district
    pub occupied_cells: u16,       // Number of occupied cells
    
    // Specialization
    pub district_type: DistrictType,         // 0: mixed, 1: residential, 2: commercial, 3: industrial, etc.
    pub district_level: u8,        // District development level
    
    // status
    pub is_developed: bool,        // Whether this district has been developed
    pub is_locked: bool,           // Whether this district is locked (unavailable)
    
    // Last update timestamp
    pub last_update: u64,
}
// Main Grid structure - container for all districts
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Grid {
    #[key]
    pub game_id: u32,              // Reference to the parent game
    #[key]
    pub grid_id: u32,
    #[key]
    pub city_id: u32, 
    #[key]
    pub owner: ContractAddress,    // District owner (0 if not owned)

    // Grid dimensions
    pub grid_size: u32,            // Width/height of the grid in districts
    pub cells_per_district: u32,    // Cells per side in each district
    pub unlocked_districts: u32,   // Number of unlocked/available districts
    pub grid_position: GridPosition,
    
    // Grid spacing
    pub district_size: u32,        // Size of each district
    pub district_spacing: u32,     // Spacing between districts
    pub cell_spacing: u32,         // Spacing between cells (fraction * 1000000)
 
    
    // Grid state
    pub is_initialized: bool,      // Whether the grid has been fully initialized
    pub last_selected_district: u32, // Last selected district ID
    pub last_selected_cell: felt252, // Last selected cell ID
    
    // Last update timestamp
    pub created_at: u64,
    pub last_update: u64,
}

#[derive(Drop, Copy, Serde, Introspect, Debug)]
pub enum DistrictType {
    Mixed,          // 0: General purpose district with mixed buildings
    Residential,    // 1: Primarily housing and residential buildings
    Commercial,     // 2: Business, shops, and commercial establishments
    Industrial,     // 3: Factories, warehouses, and production facilities
    Utilities,      // 4: Power plants, water treatment, service facilities
    Parks,          // 5: Green spaces, recreation areas, public spaces
    Transport,      // 6: Roads, transportation hubs, infrastructure
    Special,        // 7: Unique buildings, landmarks, government facilities
}

// Cell resource counts structure
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct CellResourceCounts {
    #[key]
    pub game_id: u32,
    #[key]
    pub district_id: u32,
    #[key]
    pub cell_id: felt252,
    
    // Resource counts by type
    pub residential: u8,
    pub commercial: u8,
    pub industrial: u8,
    pub utilities: u8,
    pub parks: u8,
    pub roads: u8,
    pub special: u8,
    
    // Last update timestamp
    pub last_update: u64,
}

// District resource counts structure
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct DistrictResourceCounts {
    #[key]
    pub game_id: u32,
    #[key]
    pub district_id: u32,
    
    // Resource counts by type
    pub residential: u16,
    pub commercial: u16,
    pub industrial: u16,
    pub utilities: u16,
    pub parks: u16,
    pub roads: u16,
    pub special: u16,
    
    // Last update timestamp
    pub last_update: u64,
}

// Error constants for grid operations
pub mod errors {
    pub const GRID_NOT_INITIALIZED: felt252 = 'Grid: not initialized';
    pub const GRID_ALREADY_INITIALIZED: felt252 = 'Grid: already initialized';
    pub const GRID_INVALID_DISTRICT: felt252 = 'Grid: invalid district ID';
    pub const GRID_INVALID_CELL: felt252 = 'Grid: invalid cell ID';
    pub const GRID_DISTRICT_LOCKED: felt252 = 'Grid: district is locked';
    pub const GRID_CELL_OCCUPIED: felt252 = 'Grid: cell is already occupied';
    pub const GRID_CELL_NOT_OCCUPIED: felt252 = 'Grid: cell is not occupied';
    pub const GRID_INVALID_OWNER: felt252 = 'Grid: invalid owner';
    pub const GRID_NOT_OWNER: felt252 = 'Grid: caller is not owner';
    pub const GRID_INVALID_TERRAIN: felt252 = 'Grid: invalid terrain type';
}


#[generate_trait]
pub impl GridImpl of GridTrait {
    /// Creates a new grid with default settings
    #[inline(always)]
    fn new(
        game_id: u32,
        grid_id: u32,
        city_id: u32,
        caller: ContractAddress,
        grid_position: GridPosition
    ) -> Grid {
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        // Calculate total districts

        
        // Return new grid
        Grid {
            game_id,
            grid_id,
            city_id,
            owner: caller,
            grid_size: DISTRICT_GRID_SIZE,
            cells_per_district: CELLS_PER_DISTRICT,
            unlocked_districts: 0, // Start with 1 unlocked district (center)
            grid_position: grid_position,
            district_size: DISTRICT_SIZE,
            district_spacing: DISTRICT_SPACING,
            cell_spacing: CELL_SPACING, // 10% spacing by default (0.0001/1000000)
            is_initialized: true,
            last_selected_district: 0,
            last_selected_cell: '',
            created_at: current_time,
            last_update: current_time,
        }
    }
    
    /// Initialize all districts in the grid
    fn initialize_district(
        ref self: Grid,
    ) -> u32 {
        // Ensure grid is not already initialized
        assert(!self.is_initialized, errors::GRID_ALREADY_INITIALIZED);
        
        // Set districts as initialized
        self.is_initialized = true;
        
        // Update timestamp
        self.last_update = get_block_timestamp();


        
        // Return number of unlocked districts
        self.unlocked_districts
    }
    

    
    /// Create a new cell within a district
    fn create_cell(
        ref self: Grid,
        district_id: u32,
        grid_x: u32,
        grid_y: u32,
        grid_z: u32,
        terrain_type: u8,
    ) -> Cell {
        // Ensure grid is initialized
        assert(self.is_initialized, errors::GRID_NOT_INITIALIZED);
        
        // Ensure valid district
        assert(district_id < self.district_count, errors::GRID_INVALID_DISTRICT);
        
        // Ensure valid cell coordinates
        assert(grid_x < self.cells_per_district.into() && grid_z < self.cells_per_district.into(), errors::GRID_INVALID_CELL);
        
        // Generate a unique cell ID using format: district_x_z
        let cell_id = PoseidonTrait::new()
            .update(district_id.into())
            .update(grid_x.into())
            .update(grid_y.into())
            .update(grid_z.into())
            .finalize();
        
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        // Create and return cell
        Cell {
            game_id: self.game_id,
            district_id,
            cell_id,
            grid_x,
            grid_y,
            grid_z,
            is_occupied: false,
            building_id: '',
            building_type: 0,
            owner: Zero::zero(),
            height_offset: 0,
            terrain_type,
            last_update: current_time,
        }
    }
    
    /// Unlock a new district ring around the center
    fn unlock_districts(ref self: Grid) -> u32 {
        // Ensure grid is initialized
        assert(self.is_initialized, errors::GRID_NOT_INITIALIZED);
        
        // Increase unlocked districts count
        // Each "ring" of districts around the center has more districts
        // So we increment by the appropriate amount based on current unlocked count
        self.unlocked_districts += 1;
        
        // Ensure we don't unlock more than what's available
        if self.unlocked_districts > self.grid_size {
            self.unlocked_districts = self.grid_size;
        }
        
        // Update timestamp
        self.last_update = get_block_timestamp();
        
        // Return new count
        self.unlocked_districts
    }
    
    /// Select a district - updates the last selected values
    fn select_district(ref self: Grid, district_id: u32) -> u32 {
        // Ensure grid is initialized
        assert(self.is_initialized, errors::GRID_NOT_INITIALIZED);
        
        // Update last selected district
        self.last_selected_district = district_id;
        self.last_selected_cell = '';
        
        // Update timestamp
        self.last_update = get_block_timestamp();
        
        // Return selected district ID
        district_id
    }
    
    /// Select a cell - updates the last selected values
    fn select_cell(ref self: Grid, cell_id: felt252) -> felt252 {
        // Ensure grid is initialized
        assert(self.is_initialized, errors::GRID_NOT_INITIALIZED);
        
        // Update last selected cell
        self.last_selected_cell = cell_id;
        
        // Update timestamp
        self.last_update = get_block_timestamp();
        
        // Return selected cell ID
        cell_id
    }
    
    /// Place a building on a cell
    fn place_building(
        ref self: Grid,
        cell_id: felt252,
        building_id: felt252,
        building_type: u8,
        owner: ContractAddress,
    ) -> bool {
        // Ensure grid is initialized
        assert(self.is_initialized, errors::GRID_NOT_INITIALIZED);
        
        // Building logic would update a cell's occupied status
        // This would be implemented in the actual contract as it needs to modify Cell entities
        
        // For simulation, we just update selection info
        self.last_selected_cell = cell_id;
        
        // Update timestamp
        self.last_update = get_block_timestamp();
        
        // Return success indication
        true
    }
    
    /// Update a district's development status
    fn develop_district(
        ref self: Grid,
        district_id: u32,
        new_name: felt252,
        new_type: u8,
    ) -> bool {
        // Ensure grid is initialized
        assert(self.is_initialized, errors::GRID_NOT_INITIALIZED);
        
        // District development logic would update the district status
        // This would be implemented in the actual contract as it needs to modify District entities
        
        // Update selection info
        self.last_selected_district = district_id;
        
        // Update timestamp
        self.last_update = get_block_timestamp();
        
        // Return success indication
        true
    }
    
    /// Get cell coordinate in world space
    fn get_cell_world_position(
        self: Grid,
        district_id: u32,
        cell_x: u32,
        cell_y: u32,
        cell_z: u32,
    ) -> Coordinates {
        // Calculate district position in grid
        let district_x = district_id / self.grid_size;
        let district_z = district_id % self.grid_size;
        
        // Calculate district position in world
        let district_pos_x = (district_x - (self.grid_size / 2)) * (self.district_spacing);
        let district_pos_z = (district_z - (self.grid_size / 2)) * (self.district_spacing);
        
        // Calculate cell size
        let cell_size = self.district_size / (self.cells_per_district.into());
        
        // Calculate cell offset within district
        let cell_offset_x = (cell_x) * (cell_size) - ((self.district_size) / 2) + ((cell_size) / 2);
        let cell_offset_z = (cell_z) * (cell_size) - ((self.district_size) / 2) + ((cell_size) / 2);
        
        // Use height_offset for y-coordinate (could be adjusted based on actual terrain)
        // This is a placeholder - you might want to calculate y differently
        let world_y = cell_y;
        
        // Final world position
        let world_x = (district_pos_x + cell_offset_x).into();
        let world_z = (district_pos_z + cell_offset_z).into();
        
        Coordinates { x: world_x, y: world_y, z: world_z }
    }
    
    /// Generate a string cell ID from components
    fn generate_cell_id(
        district_id: u32,
        cell_x: u32,
        cell_y: u32,
        cell_z: u32,
    ) -> felt252 {
        // Use Poseidon hash to create a unique ID
        PoseidonTrait::new()
            .update(district_id.into())
            .update(cell_x.into())
            .update(cell_y.into())
            .update(cell_z.into())
            .finalize()
    }
}

// Implementation for Cell Resource Counts
#[generate_trait]
pub impl CellResourceCountsImpl of CellResourceCountsTrait {
    // Create a new CellResourceCounts
    fn new(
        game_id: u32,
        district_id: u32,
        cell_id: felt252,
    ) -> CellResourceCounts {
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        CellResourceCounts {
            game_id,
            district_id,
            cell_id,
            residential: 0,
            commercial: 0,
            industrial: 0,
            utilities: 0,
            parks: 0,
            roads: 0,
            special: 0,
            last_update: current_time,
        }
    }
    
    // Add a resource to the cell
    fn add_resource(
        ref self: CellResourceCounts,
        resource_type: ResourceType,
    ) -> bool {
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        // Update count based on resource type
        match resource_type {
            ResourceType::None => {},
            ResourceType::Residential => { self.residential += 1; },
            ResourceType::Commercial => { self.commercial += 1; },
            ResourceType::Industrial => { self.industrial += 1; },
            ResourceType::Utilities => { self.utilities += 1; },
            ResourceType::Parks => { self.parks += 1; },
            ResourceType::Roads => { self.roads += 1; },
            ResourceType::Special => { self.special += 1; },
        }
        
        // Update timestamp
        self.last_update = current_time;
        
        true
    }
    
    // Remove a resource from the cell
    fn remove_resource(
        ref self: CellResourceCounts,
        resource_type: ResourceType,
    ) -> bool {
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        // Update count based on resource type
        match resource_type {
            ResourceType::None => {},
            ResourceType::Residential => { 
                if self.residential > 0 {
                    self.residential -= 1;
                }
            },
            ResourceType::Commercial => { 
                if self.commercial > 0 {
                    self.commercial -= 1;
                }
            },
            ResourceType::Industrial => { 
                if self.industrial > 0 {
                    self.industrial -= 1;
                }
            },
            ResourceType::Utilities => { 
                if self.utilities > 0 {
                    self.utilities -= 1;
                }
            },
            ResourceType::Parks => { 
                if self.parks > 0 {
                    self.parks -= 1;
                }
            },
            ResourceType::Roads => { 
                if self.roads > 0 {
                    self.roads -= 1;
                }
            },
            ResourceType::Special => { 
                if self.special > 0 {
                    self.special -= 1;
                }
            },
        }
        
        // Update timestamp
        self.last_update = current_time;
        
        true
    }
    
    // Get count for a specific resource type
    fn get_resource_count(
        self: CellResourceCounts,
        resource_type: ResourceType,
    ) -> u8 {
        match resource_type {
            ResourceType::None => 0,
            ResourceType::Residential => self.residential,
            ResourceType::Commercial => self.commercial,
            ResourceType::Industrial => self.industrial,
            ResourceType::Utilities => self.utilities,
            ResourceType::Parks => self.parks,
            ResourceType::Roads => self.roads,
            ResourceType::Special => self.special,
        }
    }
    
    // Get total resources in the cell
    fn get_total_resources(self: CellResourceCounts) -> u8 {
        self.residential + 
        self.commercial + 
        self.industrial + 
        self.utilities + 
        self.parks + 
        self.roads + 
        self.special
    }
    
    // Reset all resource counts
    fn reset(ref self: CellResourceCounts) {
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        self.residential = 0;
        self.commercial = 0;
        self.industrial = 0;
        self.utilities = 0;
        self.parks = 0;
        self.roads = 0;
        self.special = 0;
        
        // Update timestamp
        self.last_update = current_time;
    }
    
    // Get dominant resource type
    fn get_dominant_resource(self: CellResourceCounts) -> ResourceType {
        let mut max_count = 0;
        let mut dominant = ResourceType::None;
        
        if self.residential > max_count {
            max_count = self.residential;
            dominant = ResourceType::Residential;
        }
        
        if self.commercial > max_count {
            max_count = self.commercial;
            dominant = ResourceType::Commercial;
        }
        
        if self.industrial > max_count {
            max_count = self.industrial;
            dominant = ResourceType::Industrial;
        }
        
        if self.utilities > max_count {
            max_count = self.utilities;
            dominant = ResourceType::Utilities;
        }
        
        if self.parks > max_count {
            max_count = self.parks;
            dominant = ResourceType::Parks;
        }
        
        if self.roads > max_count {
            max_count = self.roads;
            dominant = ResourceType::Roads;
        }
        
        if self.special > max_count {
            max_count = self.special;
            dominant = ResourceType::Special;
        }
        
        dominant
    }
}

// Implementation for District Resource Counts
#[generate_trait]
pub impl DistrictResourceCountsImpl of DistrictResourceCountsTrait {
    // Create a new DistrictResourceCounts
    fn new(
        game_id: u32,
        district_id: u32,
    ) -> DistrictResourceCounts {
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        DistrictResourceCounts {
            game_id,
            district_id,
            residential: 0,
            commercial: 0,
            industrial: 0,
            utilities: 0,
            parks: 0,
            roads: 0,
            special: 0,
            last_update: current_time,
        }
    }
    
    // Add a resource to the district
    fn add_resource(
        ref self: DistrictResourceCounts,
        resource_type: ResourceType,
        count: u16,
    ) -> bool {
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        // Update count based on resource type
        match resource_type {
            ResourceType::None => {},
            ResourceType::Residential => { self.residential += count; },
            ResourceType::Commercial => { self.commercial += count; },
            ResourceType::Industrial => { self.industrial += count; },
            ResourceType::Utilities => { self.utilities += count; },
            ResourceType::Parks => { self.parks += count; },
            ResourceType::Roads => { self.roads += count; },
            ResourceType::Special => { self.special += count; },
        }
        
        // Update timestamp
        self.last_update = current_time;
        
        true
    }
    
    // Remove a resource from the district
    fn remove_resource(
        ref self: DistrictResourceCounts,
        resource_type: ResourceType,
        count: u16,
    ) -> bool {
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        // Update count based on resource type
        match resource_type {
            ResourceType::None => {},
            ResourceType::Residential => { 
                if self.residential >= count {
                    self.residential -= count;
                } else {
                    self.residential = 0;
                }
            },
            ResourceType::Commercial => { 
                if self.commercial >= count {
                    self.commercial -= count;
                } else {
                    self.commercial = 0;
                }
            },
            ResourceType::Industrial => { 
                if self.industrial >= count {
                    self.industrial -= count;
                } else {
                    self.industrial = 0;
                }
            },
            ResourceType::Utilities => { 
                if self.utilities >= count {
                    self.utilities -= count;
                } else {
                    self.utilities = 0;
                }
            },
            ResourceType::Parks => { 
                if self.parks >= count {
                    self.parks -= count;
                } else {
                    self.parks = 0;
                }
            },
            ResourceType::Roads => { 
                if self.roads >= count {
                    self.roads -= count;
                } else {
                    self.roads = 0;
                }
            },
            ResourceType::Special => { 
                if self.special >= count {
                    self.special -= count;
                } else {
                    self.special = 0;
                }
            },
        }
        
        // Update timestamp
        self.last_update = current_time;
        
        true
    }
    
    // Get count for a specific resource type
    fn get_resource_count(
        self: DistrictResourceCounts,
        resource_type: ResourceType,
    ) -> u16 {
        match resource_type {
            ResourceType::None => 0,
            ResourceType::Residential => self.residential,
            ResourceType::Commercial => self.commercial,
            ResourceType::Industrial => self.industrial,
            ResourceType::Utilities => self.utilities,
            ResourceType::Parks => self.parks,
            ResourceType::Roads => self.roads,
            ResourceType::Special => self.special,
        }
    }
    
    // Get total resources in the district
    fn get_total_resources(self: DistrictResourceCounts) -> u16 {
        self.residential + 
        self.commercial + 
        self.industrial + 
        self.utilities + 
        self.parks + 
        self.roads + 
        self.special
    }
    
    // Reset all resource counts
    fn reset(ref self: DistrictResourceCounts) {
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        self.residential = 0;
        self.commercial = 0;
        self.industrial = 0;
        self.utilities = 0;
        self.parks = 0;
        self.roads = 0;
        self.special = 0;
        
        // Update timestamp
        self.last_update = current_time;
    }
    
    // Get dominant resource type
    fn get_dominant_resource(self: DistrictResourceCounts) -> ResourceType {
        let mut max_count = 0;
        let mut dominant = ResourceType::None;
        
        if self.residential > max_count {
            max_count = self.residential;
            dominant = ResourceType::Residential;
        }
        
        if self.commercial > max_count {
            max_count = self.commercial;
            dominant = ResourceType::Commercial;
        }
        
        if self.industrial > max_count {
            max_count = self.industrial;
            dominant = ResourceType::Industrial;
        }
        
        if self.utilities > max_count {
            max_count = self.utilities;
            dominant = ResourceType::Utilities;
        }
        
        if self.parks > max_count {
            max_count = self.parks;
            dominant = ResourceType::Parks;
        }
        
        if self.roads > max_count {
            max_count = self.roads;
            dominant = ResourceType::Roads;
        }
        
        if self.special > max_count {
            max_count = self.special;
            dominant = ResourceType::Special;
        }
        
        dominant
    }
    
    // Calculate district specialization score based on resource diversity
    fn calculate_specialization_score(self: DistrictResourceCounts) -> u8 {
        let total = self.get_total_resources();
        if total == 0 {
            return 0;
        }
        
        let dominant_count = match self.get_dominant_resource() {
            ResourceType::None => 0,
            ResourceType::Residential => self.residential,
            ResourceType::Commercial => self.commercial,
            ResourceType::Industrial => self.industrial,
            ResourceType::Utilities => self.utilities,
            ResourceType::Parks => self.parks,
            ResourceType::Roads => self.roads,
            ResourceType::Special => self.special,
        };
        
        // Calculate specialization as percentage (0-100)
        // Higher score means more specialized (less diverse)
        let specialization = ((dominant_count * 100) / total);

        let specialization: u8 = specialization.try_into().unwrap();
        
        // Return as u8 (0-100)
        if specialization > 100 {
            100_u8
        } else {
            specialization
        }
    }
    
    // Add cell resources to district totals (for aggregation)
    fn aggregate_cell_resources(
        ref self: DistrictResourceCounts,
        cell_resources: CellResourceCounts,
    ) {
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        // Add cell resources to district totals
        self.residential += cell_resources.residential.into();
        self.commercial += cell_resources.commercial.into();
        self.industrial += cell_resources.industrial.into();
        self.utilities += cell_resources.utilities.into();
        self.parks += cell_resources.parks.into();
        self.roads += cell_resources.roads.into();
        self.special += cell_resources.special.into();
        
        // Update timestamp
        self.last_update = current_time;
    }
    
    // Integrates with the Cell struct to update building placement
    fn update_from_building_placement(
        ref self: DistrictResourceCounts,
        resource_type: ResourceType,
    ) -> bool {
        self.add_resource(resource_type, 1)
    }
    
    // Integrates with the Cell struct to update building removal
    fn update_from_building_removal(
        ref self: DistrictResourceCounts,
        resource_type: ResourceType,
    ) -> bool {
        self.remove_resource(resource_type, 1)
    }
}

// Function to synchronize cell resource counts to district
pub fn sync_cell_to_district(
    cell_resources: CellResourceCounts,
    ref district_resources: DistrictResourceCounts
) {
    // This function would be called when updating cell resources
    // to keep the district totals in sync
    
    // Get current timestamp
    let current_time = get_block_timestamp();
    
    // Recalculate district resources by aggregating from all cells
    // This is a simplified example - in practice, you'd query all cells
    // in the district and aggregate their resources
    district_resources.aggregate_cell_resources(cell_resources);
    
    // Update timestamp
    district_resources.last_update = current_time;
}

// Functions to integrate with existing Cell operations
pub fn update_cell_building_placement(
    ref cell: Cell, 
    ref cell_resources: CellResourceCounts,
    ref district_resources: DistrictResourceCounts,
    building_type: u8,
    resource_type: ResourceType
) -> bool {
    // Update cell building info
    cell.is_occupied = true;
    cell.building_type = building_type;
    
    // Update resource counts
    cell_resources.add_resource(resource_type);
    district_resources.update_from_building_placement(resource_type);
    
    true
}

pub fn update_cell_building_removal(
    ref cell: Cell,
    ref cell_resources: CellResourceCounts,
    ref district_resources: DistrictResourceCounts,
    resource_type: ResourceType
) -> bool {
    // Clear cell building info
    cell.is_occupied = false;
    cell.building_type = 0;
    cell.building_id = '';
    
    // Update resource counts
    cell_resources.remove_resource(resource_type);
    district_resources.update_from_building_removal(resource_type);
    
    true
}

// Usage example:
// The following functions demonstrate how to integrate with existing code
fn example_place_building(
    ref grid: Grid,
    ref cell: Cell,
    ref district: District,
    building_id: felt252,
    building_type: u8,
    resource_type: ResourceType,
    owner: ContractAddress,
) -> bool {
    // 1. Create or load resource counts
    let mut cell_resources = CellResourceCountsImpl::new(
        grid.game_id,
        cell.district_id,
        cell.cell_id
    );
    
    let mut district_resources = DistrictResourceCountsImpl::new(
        grid.game_id,
        district.district_id
    );
    
    // 2. Update cell with building info
    cell.is_occupied = true;
    cell.building_id = building_id;
    cell.building_type = building_type;
    cell.owner = owner;
    
    // 3. Update resource counts
    update_cell_building_placement(
        ref cell,
        ref cell_resources,
        ref district_resources,
        building_type,
        resource_type
    );
    
    // 4. Update district occupied cell count
    district.occupied_cells += 1;
    
    // 5. Update district type based on dominant resource if needed
    let dominant = district_resources.get_dominant_resource();
    match dominant {
        ResourceType::None => {},
        ResourceType::Residential => { district.district_type = 1; },
        ResourceType::Commercial => { district.district_type = 2; },
        ResourceType::Industrial => { district.district_type = 3; },
        ResourceType::Utilities => { district.district_type = 4; },
        ResourceType::Parks => { district.district_type = 5; },
        ResourceType::Roads => { district.district_type = 6; },
        ResourceType::Special => { district.district_type = 7; },
    }
    
    true
}


#[generate_trait]
pub impl GridPositionImpl of GridPositionTrait {

     fn validate_position(self: GridPosition) -> bool {
        if self.row < 0 || self.row > 5 {
            return false;
        }

        if self.col < 0  || self.row > 5 {
            return false;
        }

        true
     }
}

#[generate_trait]
pub impl DistrictImpl of DistrictTrait{
    /// Create a new district
    fn new(
        game_id: u32,
        district_id: u32,
        grid_id: u32,
        grid_x: u32,
        grid_y: u32,
        grid_z: u32,
        name: felt252,
        district_type: DistrictType,
        owner: ContractAddress,
    ) -> District {

        // Get current timestamp
        let current_time = get_block_timestamp();
        

        // Total cells calculation
        let cells_per_side = self.cells_per_district;
        let total_cells = cells_per_side * cells_per_side;
        
        // Create and return district
        District {
            game_id: self.game_id,
            district_id,
            grid_id,
            grid_x,
            grid_y,
            grid_z,
            name,
            size: self.district_size,
            cells_per_side,
            total_cells,
            occupied_cells: 0,
            district_type,
            district_level: 1,
            owner,
            is_developed: false,
            is_locked: false,
            last_update: current_time,
        }
    }

}