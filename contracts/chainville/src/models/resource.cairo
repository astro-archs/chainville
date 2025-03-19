use starknet::{ContractAddress, get_block_timestamp, get_tx_info};
use core::num::traits::Zero;

/// Position in 3D space (x, y, z coordinates)
#[derive(Copy, Drop, Serde, Debug)]
pub struct Position {
    pub x: u32,
    pub y: u32,
    pub z: u32,
}

/// Resource Type Enum
#[derive(Drop, Copy, Serde, Introspect, Debug)]
pub enum ResourceType {
    None,
    Residential,  // Housing, apartments, homes
    Commercial,   // Shops, offices, entertainment
    Industrial,   // Factories, warehouses, production
    Utilities,    // Power plants, water treatment, services
    Parks,        // Green spaces, recreation areas
    Roads,        // Transportation infrastructure
    Special,      // Unique buildings, landmarks, government
}

/// Resource model - represents buildings and placeable items in the game
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Resource {
    #[key]
    pub game_id: u32,            // Reference to the parent game
    #[key]
    pub resource_id: felt252,    // Unique identifier for this resource
    
    // Resource metadata
    pub resource_type: ResourceType, // Type of resource
    pub name: felt252,               // Resource name
    pub level: u8,                   // Resource level (can be upgraded)
    
    // Placement information
    pub position: Position,          // 3D position in world
    pub district_id: u32,            // District this resource belongs to
    pub cell_id: felt252,            // Cell this resource is placed on
    pub rotation: u8,                // Rotation in 90-degree steps (0, 1, 2, 3)
    pub width: u8,                   // Width in cells
    pub height: u8,                  // Height in cells
    
    // Resource properties
    pub construction_time: u64,      // Time required to build (seconds)
    pub construction_start: u64,     // When construction started
    pub is_completed: bool,          // Whether construction is complete
    pub health: u8,                  // Health/condition (0-100)
    pub efficiency: u8,              // Operating efficiency (0-100)
    
    // Economic information
    pub build_cost: u64,             // Cost to build
    pub maintenance_cost: u16,       // Hourly upkeep cost
    pub income: u16,                 // Hourly income generated
    pub happiness_effect: i16,       // Effect on happiness (-100 to 100)
    pub population_capacity: u16,    // Population supported (residential only)
    pub employment_capacity: u16,    // Jobs provided (commercial/industrial only)
    
    // Ownership and state
    pub owner: ContractAddress,      // Who owns this resource
    pub is_active: bool,             // Whether it's currently operational
    pub created_at: u64,             // When resource was created
    pub last_update: u64,            // Last update timestamp
}

// Display properties will be handled by the client side

// Error constants for resource operations
pub mod errors {
    pub const RESOURCE_INVALID_TYPE: felt252 = 'Resource: invalid type';
    pub const RESOURCE_INVALID_OWNER: felt252 = 'Resource: invalid owner';
    pub const RESOURCE_NOT_OWNER: felt252 = 'Resource: not the owner';
    pub const RESOURCE_ALREADY_COMPLETED: felt252 = 'Resource: already completed';
    pub const RESOURCE_NOT_COMPLETED: felt252 = 'Resource: not completed';
    pub const RESOURCE_INVALID_LEVEL: felt252 = 'Resource: invalid level';
    pub const RESOURCE_CONSTRUCTION_IN_PROGRESS: felt252 = 'Resource: const- in progress';
}

#[generate_trait]
pub impl ResourceImpl of ResourceTrait {
    /// Creates a new resource
    #[inline(always)]
    fn new(
        game_id: u32,
        resource_id: felt252,
        resource_type: ResourceType,
        name: felt252,
        position: Position,
        district_id: u32,
        cell_id: felt252,
        rotation: u8,
        width: u8,
        height: u8,
        build_cost: u64,
        construction_time: u64,
        owner: ContractAddress,
    ) -> Resource {
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        // Set default values based on resource type
        let (maintenance_cost, income, happiness_effect, population_capacity, employment_capacity) = 
            match resource_type {
                ResourceType::Residential => (5, 10, 5, 20, 0),
                ResourceType::Commercial => (8, 20, 3, 0, 15),
                ResourceType::Industrial => (12, 30, -5, 0, 25),
                ResourceType::Utilities => (15, 8, -2, 0, 5),
                ResourceType::Parks => (5, 2, 15, 0, 2),
                ResourceType::Roads => (2, 0, 0, 0, 0),
                ResourceType::Special => (20, 15, 10, 10, 10),
                ResourceType::None => (0, 0, 0, 0, 0),
            };
        
        // Create new resource
        Resource {
            game_id,
            resource_id,
            resource_type,
            name,
            level: 1,
            position,
            district_id,
            cell_id,
            rotation,
            width,
            height,
            construction_time,
            construction_start: current_time,
            is_completed: false,
            health: 100,
            efficiency: 100,
            build_cost,
            maintenance_cost,
            income,
            happiness_effect,
            population_capacity,
            employment_capacity,
            owner,
            is_active: false, // Not active until construction is complete
            created_at: current_time,
            last_update: current_time,
        }
    }
    
    /// Updates the construction status of a resource
    fn update_construction(ref self: Resource) -> bool {
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        // If already completed, no need to check
        if self.is_completed {
            return true;
        }
        
        // Check if construction time has elapsed
        let elapsed_time = current_time - self.construction_start;
        let is_now_complete = elapsed_time >= self.construction_time;
        
        // Update completed status if time has elapsed
        if is_now_complete {
            self.is_completed = true;
            self.is_active = true; // Activate once completed
        }
        
        // Update last update time
        self.last_update = current_time;
        
        // Return completion status
        self.is_completed
    }
    
    /// Upgrades the resource to the next level
    fn upgrade(ref self: Resource, cost: u64, time: u64) -> u8 {
        // Ensure resource is completed
        assert(self.is_completed, errors::RESOURCE_NOT_COMPLETED);
        
        // Ensure not already at max level (10)
        assert(self.level < 10, errors::RESOURCE_INVALID_LEVEL);
        
        // Increase level
        self.level += 1;
        
        // Set construction parameters for upgrade
        self.construction_start = get_block_timestamp();
        self.construction_time = time;
        self.is_completed = false;
        self.is_active = false; // Deactivate during upgrade
        
        // Update resource properties based on new level
        // Each level adds 20% to key stats
        let level_multiplier = (self.level.into()) * 20; // 20% per level
        
        self.maintenance_cost = (self.maintenance_cost * (100 + level_multiplier / 10)) / 100;
        self.income = (self.income * (100 + level_multiplier / 5)) / 100;
        
        // Population and employment scale with level
        self.population_capacity = (self.population_capacity * (100 + level_multiplier / 10)) / 100;
        self.employment_capacity = (self.employment_capacity * (100 + level_multiplier / 10)) / 100;
        
        // Happiness effect improves slightly with levels
        if self.happiness_effect > 0 {
            // Positive effects improve
            self.happiness_effect += 1;
        } else if self.happiness_effect < 0 {
            // Negative effects reduce (get closer to 0)
            self.happiness_effect += 1;
        }
        
        // Update last update time
        self.last_update = get_block_timestamp();
        
        // Return new level
        self.level
    }
    
    /// Toggles the active state of a resource (if completed)
    fn toggle_active(ref self: Resource) -> bool {
        // Ensure resource is completed
        assert(self.is_completed, errors::RESOURCE_NOT_COMPLETED);
        
        // Toggle active state
        self.is_active = !self.is_active;
        
        // Update last update time
        self.last_update = get_block_timestamp();
        
        // Return new active state
        self.is_active
    }
    
    /// Repairs the resource to restore health
    fn repair(ref self: Resource, cost: u64) -> u8 {
        // Ensure resource is completed
        assert(self.is_completed, errors::RESOURCE_NOT_COMPLETED);
        
        // Restore health to 100%
        self.health = 100;
        
        // Update last update time
        self.last_update = get_block_timestamp();
        
        // Return new health
        self.health
    }
    
    /// Calculates the current hourly income from this resource
    fn calculate_income(self: Resource) -> u16 {
        // If not active, no income
        if !self.is_active || !self.is_completed {
            return 0;
        }
        
        // Base income scaled by efficiency and health
        let health_factor = (self.health.into());
        let efficiency_factor = (self.efficiency.into());
        
        // Calculate income - affected by both health and efficiency
        (self.income * health_factor * efficiency_factor) / 10000
    }
    
    /// Calculates the current hourly maintenance cost
    fn calculate_maintenance(self: Resource) -> u16 {
        // Base maintenance cost - reduced if not active but still costs something
        if !self.is_active {
            return self.maintenance_cost / 2;
        }
        
        // Full maintenance when active
        self.maintenance_cost
    }
    
    // Display properties will be handled by the client side
}