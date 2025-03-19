use starknet::{ContractAddress, get_block_timestamp, get_tx_info};
use core::num::traits::Zero;
use core::hash::HashStateTrait;
use core::poseidon::PoseidonTrait;
use chainville::constants::{DISTRICT_GRID_SIZE};

// City coordinates
#[derive(Copy, Drop, Serde, Debug)]
pub struct Coordinates {
    pub x: u32,
    pub y: u32,
}

// Resources structure for the city
#[derive(Copy, Drop, Serde, Debug)]
pub struct CityResources {
    pub gold: u64,
    pub food: u64,
    pub wood: u64,
    pub stone: u64,
    pub iron: u64,
    pub energy: u64,
    pub water: u64,
    pub luxury: u64,
    pub research_points: u64,
}

// City stats
#[derive(Copy, Drop, Serde, Debug)]
pub struct CityStats {
    pub population: u32,
    pub happiness: u16,      // Scaled by 100 (e.g., 7500 = 75%)
    pub health: u16,         // Scaled by 100
    pub education: u16,      // Scaled by 100
    pub environment: u16,    // Scaled by 100
    pub safety: u16,         // Scaled by 100
    pub employment: u16,     // Scaled by 100
    pub tourism: u32,        // Tourism visitors per day
    pub defense_rating: u16, // City defense against disasters/attacks
}

// City model
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct City {
    #[key]
    pub game_id: u32,        // Reference to the parent game
    #[key]
    pub city_id: u32,        // Unique identifier within the game
    #[key]
    pub owner: ContractAddress,  // Player who owns this city
    
    // City information
    pub name: felt252,
    pub founded_time: u64,   // When the city was founded
    pub last_update: u64,    // Last time the city was updated
    pub coordinates: Coordinates,
    pub level: u8,           // City level (determines boundaries, max buildings)
    pub district_count: u16,
    
    // Resources
    pub resources: CityResources,
    pub production_rate: CityResources, // Resources generated per hour
    pub storage_capacity: CityResources, // Maximum storable resources
    
    // City buildings
    pub residential_count: u16,
    pub commercial_count: u16,
    pub industrial_count: u16,
    pub entertainment_count: u16,
    pub utility_count: u16,
    pub special_count: u16,
    pub total_buildings: u16,
    
    // Stats
    pub stats: CityStats,
    
    // City state
    pub tax_rate: u16,       // City-specific tax rate (scaled by 1000)
    pub development_focus: u8, // 0: Balanced, 1: Economy, 2: Population, 3: Technology, 4: Military
    pub is_capital: bool,    // Whether this is the player's capital city
    pub active: bool,        // Whether this city is active
}

// Error constants for city operations
pub mod errors {
    pub const CITY_NOT_OWNER: felt252 = 'City: caller is not owner';
    pub const CITY_INVALID_OWNER: felt252 = 'City: invalid owner address';
    pub const CITY_NOT_ACTIVE: felt252 = 'City: city is not active';
    pub const CITY_INVALID_COORDINATES: felt252 = 'City: invalid coordinates';
    pub const CITY_INVALID_NAME: felt252 = 'City: invalid name';
    pub const CITY_INVALID_TAX_RATE: felt252 = 'City: invalid tax rate';
    pub const CITY_BUILDING_LIMIT: felt252 = 'City: building limit reached';
    pub const CITY_INSUFFICIENT_RESOURCES: felt252 = 'City: insufficient resources';
    pub const CITY_RESOURCE_STORAGE_FULL: felt252 = 'City: resource storage full';
}

#[generate_trait]
pub impl CityImpl of CityTrait {
    /// Creates a new city with default settings
    #[inline(always)]
    fn new(
        game_id: u32,
        city_id: u32,
        owner: ContractAddress,
        name: felt252,
        coordinates: Coordinates,
        is_capital: bool
    ) -> City {
        // Validate owner address
        assert(owner != Zero::zero(), errors::CITY_INVALID_OWNER);
        
        // Validate name is not empty
        assert(name != '', errors::CITY_INVALID_NAME);
        
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        // Default resources
        let starting_resources = if is_capital {
            // Capital cities start with more resources
            CityResources {
                gold: 5000,
                food: 2000,
                wood: 2000,
                stone: 1000,
                iron: 500,
                energy: 1000,
                water: 1000,
                luxury: 100,
                research_points: 0,
            }
        } else {
            // Regular cities
            CityResources {
                gold: 2000,
                food: 1000,
                wood: 1000,
                stone: 500,
                iron: 200,
                energy: 500,
                water: 500,
                luxury: 50,
                research_points: 0,
            }
        };
        
        // Initial production rates
        let initial_production = CityResources {
            gold: 100,    // 100 gold per hour
            food: 50,
            wood: 50,
            stone: 20,
            iron: 10,
            energy: 20,
            water: 20,
            luxury: 5,
            research_points: 1,
        };
        
        // Initial storage capacity
        let initial_capacity = CityResources {
            gold: 10000,
            food: 5000,
            wood: 5000,
            stone: 3000,
            iron: 2000,
            energy: 2000,
            water: 2000,
            luxury: 1000,
            research_points: 1000,
        };
        
        // Initial stats
        let initial_stats = CityStats {
            population: if is_capital { 1000 } else { 500 },
            happiness: 7500,    // 75%
            health: 7000,       // 70%
            education: 5000,    // 50%
            environment: 8000,  // 80%
            safety: 7000,       // 70%
            employment: 9000,   // 90%
            tourism: 10,
            defense_rating: 2000, // 20%
        };
        
        // Return new city
        City {
            game_id,
            city_id,
            owner,
            name,
            founded_time: current_time,
            last_update: current_time,
            coordinates,
            level: 1,
            district_count:0,
            resources: starting_resources,
            production_rate: initial_production,
            storage_capacity: initial_capacity,
            residential_count: 1,  // Start with 1 residential building
            commercial_count: 0,
            industrial_count: 0,
            entertainment_count: 0,
            utility_count: 0,
            special_count: 0,
            total_buildings: 1,    // Total is 1 (the residential)
            stats: initial_stats,
            tax_rate: 50,          // 5% default tax rate
            development_focus: 0,  // Balanced by default
            is_capital,
            active: true,
        }
    }
    
    /// Collects resources based on production rates and time elapsed
    fn collect_resources(ref self: City) -> CityResources {
        // Ensure city is active
        assert(self.active, errors::CITY_NOT_ACTIVE);
        
        // Get current time
        let current_time = get_block_timestamp();
        
        // Calculate hours elapsed (simplified to seconds for testing)
        // In production, you'd divide by 3600 for proper hours
        let hours_elapsed = (current_time - self.last_update) / 3600;
        
        // No resources to collect if no time has passed
        if hours_elapsed == 0 {
            return self.resources;
        }
        
        // Calculate resources to add based on production rate and time
        let new_gold = self.production_rate.gold * hours_elapsed;
        let new_food = self.production_rate.food * hours_elapsed;
        let new_wood = self.production_rate.wood * hours_elapsed;
        let new_stone = self.production_rate.stone * hours_elapsed;
        let new_iron = self.production_rate.iron * hours_elapsed;
        let new_energy = self.production_rate.energy * hours_elapsed;
        let new_water = self.production_rate.water * hours_elapsed;
        let new_luxury = self.production_rate.luxury * hours_elapsed;
        let new_research = self.production_rate.research_points * hours_elapsed;
        
        // Update resources (respecting storage limits)
        self.resources.gold = if self.resources.gold + new_gold > self.storage_capacity.gold {
            self.storage_capacity.gold
        } else {
            self.resources.gold + new_gold
        };
        
        self.resources.food = if self.resources.food + new_food > self.storage_capacity.food {
            self.storage_capacity.food
        } else {
            self.resources.food + new_food
        };
        
        self.resources.wood = if self.resources.wood + new_wood > self.storage_capacity.wood {
            self.storage_capacity.wood
        } else {
            self.resources.wood + new_wood
        };
        
        self.resources.stone = if self.resources.stone + new_stone > self.storage_capacity.stone {
            self.storage_capacity.stone
        } else {
            self.resources.stone + new_stone
        };
        
        self.resources.iron = if self.resources.iron + new_iron > self.storage_capacity.iron {
            self.storage_capacity.iron
        } else {
            self.resources.iron + new_iron
        };
        
        self.resources.energy = if self.resources.energy + new_energy > self.storage_capacity.energy {
            self.storage_capacity.energy
        } else {
            self.resources.energy + new_energy
        };
        
        self.resources.water = if self.resources.water + new_water > self.storage_capacity.water {
            self.storage_capacity.water
        } else {
            self.resources.water + new_water
        };
        
        self.resources.luxury = if self.resources.luxury + new_luxury > self.storage_capacity.luxury {
            self.storage_capacity.luxury
        } else {
            self.resources.luxury + new_luxury
        };
        
        self.resources.research_points = if self.resources.research_points + new_research > self.storage_capacity.research_points {
            self.storage_capacity.research_points
        } else {
            self.resources.research_points + new_research
        };
        
        // Update last update time
        self.last_update = current_time;
        
        // Return updated resources
        self.resources
    }
    
    /// Add a new building to the city
    fn add_building(
        ref self: City, 
        building_type: u8, // 0:Residential, 1:Commercial, 2:Industrial, 3:Entertainment, 4:Utility, 5:Special
        cost: CityResources
    ) -> u16 {
        // Ensure city is active
        assert(self.active, errors::CITY_NOT_ACTIVE);
        
        // Ensure building limit not reached (based on city level)
        let max_buildings = 10 + (self.level * 5);
        assert(self.total_buildings < max_buildings.into(), errors::CITY_BUILDING_LIMIT);
        
        // Check if we have enough resources
        assert(self.resources.gold >= cost.gold, errors::CITY_INSUFFICIENT_RESOURCES);
        assert(self.resources.wood >= cost.wood, errors::CITY_INSUFFICIENT_RESOURCES);
        assert(self.resources.stone >= cost.stone, errors::CITY_INSUFFICIENT_RESOURCES);
        assert(self.resources.iron >= cost.iron, errors::CITY_INSUFFICIENT_RESOURCES);
        
        // Subtract resources
        self.resources.gold -= cost.gold;
        self.resources.wood -= cost.wood;
        self.resources.stone -= cost.stone;
        self.resources.iron -= cost.iron;
        
        // Add building based on type
        match building_type {
            0 => { // Residential
                self.residential_count += 1;
                self.stats.population += 100; // Each residential building adds 100 population
                // Increase happiness slightly
                if self.stats.happiness < 9900 {
                    self.stats.happiness += 100;
                }
            },
            1 => { // Commercial
                self.commercial_count += 1;
                self.production_rate.gold += 50; // Each commercial building adds 50 gold/hour
                // Increase employment
                if self.stats.employment < 9900 {
                    self.stats.employment += 100;
                }
            },
            2 => { // Industrial
                self.industrial_count += 1;
                // Each industrial building adds production of basic resources
                self.production_rate.wood += 10;
                self.production_rate.stone += 5;
                self.production_rate.iron += 2;
                // Decrease environment quality
                if self.stats.environment > 200 {
                    self.stats.environment -= 200;
                }
            },
            3 => { // Entertainment
                self.entertainment_count += 1;
                self.production_rate.luxury += 10;
                self.stats.tourism += 5;
                // Increase happiness
                if self.stats.happiness < 9900 {
                    self.stats.happiness += 200;
                }
            },
            4 => { // Utility
                self.utility_count += 1;
                self.production_rate.energy += 20;
                self.production_rate.water += 20;
                // Increase health
                if self.stats.health < 9900 {
                    self.stats.health += 100;
                }
            },
            5 => { // Special
                self.special_count += 1;
                self.production_rate.research_points += 5;
                // Increase education
                if self.stats.education < 9900 {
                    self.stats.education += 200;
                }
            },
            _ => { // Invalid building type
                panic(array!['Invalid building type']);
            }
        }
        
        // Update total buildings
        self.total_buildings += 1;
        
        // Update storage capacity based on new buildings
        self.update_storage_capacity();
        
        // Update last update time
        self.last_update = get_block_timestamp();
        
        // Return new total
        self.total_buildings
    }
    
    /// Update city tax rate
    fn set_tax_rate(ref self: City, new_tax_rate: u16) {
        // Ensure city is active
        assert(self.active, errors::CITY_NOT_ACTIVE);
        
        // Validate tax rate (0-30%)
        assert(new_tax_rate <= 300, errors::CITY_INVALID_TAX_RATE);
        
        // Calculate happiness impact
        let happiness_change = if new_tax_rate > self.tax_rate {
            // Tax increase decreases happiness
            let tax_difference = new_tax_rate - self.tax_rate;
            // Each 1% increase in tax decreases happiness by 1%
            (tax_difference * 100) / 10
        } else {
            // Tax decrease increases happiness
            let tax_difference = self.tax_rate - new_tax_rate;
            // Each 1% decrease in tax increases happiness by 0.5%
            (tax_difference * 50) / 10
        };
        
        // Update happiness based on tax change
        if new_tax_rate > self.tax_rate {
            // Decreasing happiness
            if self.stats.happiness > happiness_change {
                self.stats.happiness -= happiness_change;
            } else {
                self.stats.happiness = 0;
            }
        } else {
            // Increasing happiness
            if self.stats.happiness + happiness_change < 10000 {
                self.stats.happiness += happiness_change;
            } else {
                self.stats.happiness = 10000;
            }
        }
        
        // Update gold production based on new tax rate
        // Base production + tax percentage of population
        let base_production = 100 + (50 * self.commercial_count);
        let tax_income = (self.stats.population * new_tax_rate.into()) / 1000;
        self.production_rate.gold = base_production.into() + tax_income.into();
        
        // Set new tax rate
        self.tax_rate = new_tax_rate;
        
        // Update timestamp
        self.last_update = get_block_timestamp();
    }
    
    /// Calculate happiness impact on productivity
    fn happiness_multiplier(self: City) -> u16 {
        // Scale happiness (0-10000) to productivity multiplier (50-150)
        // At 0% happiness, productivity is 50% (0.5x)
        // At 100% happiness, productivity is 150% (1.5x)
        50 + (self.stats.happiness / 100)
    }
    
    /// Calculate city score (for rankings)
    fn calculate_score(self: City) -> u32 {
        // Base score from population
        let population_score = self.stats.population / 10;
        
        // Building score
        let building_score = self.total_buildings * 50;
        
        // Stats contribution
        let stats_score = (
            self.stats.happiness +
            self.stats.health +
            self.stats.education +
            self.stats.environment +
            self.stats.safety
        ) / 100;
        
        // Level bonus
        let level_bonus = (self.level.into()) * 500;
        
        // Sum all components
        population_score + building_score.into() + stats_score.into() + level_bonus
    }
    
    /// Update storage capacity based on buildings and level
    fn update_storage_capacity(ref self: City) {
        // Base capacity increased by city level and utility buildings
        let level_multiplier = self.level.into();
        let utility_multiplier = self.utility_count.into();
        
        self.storage_capacity = CityResources {
            gold: 10000 + (5000 * level_multiplier) + (1000 * self.commercial_count.into()),
            food: 5000 + (2000 * level_multiplier) + (500 * utility_multiplier),
            wood: 5000 + (2000 * level_multiplier) + (1000 * self.industrial_count.into()),
            stone: 3000 + (1000 * level_multiplier) + (500 * self.industrial_count.into()),
            iron: 2000 + (1000 * level_multiplier) + (500 * self.industrial_count.into()),
            energy: 2000 + (1000 * level_multiplier) + (1000 * utility_multiplier),
            water: 2000 + (1000 * level_multiplier) + (1000 * utility_multiplier),
            luxury: 1000 + (500 * level_multiplier) + (200 * self.entertainment_count.into()),
            research_points: 1000 + (500 * level_multiplier) + (500 * self.special_count.into()),
        };
    }
    
    /// Level up the city if requirements are met
    fn level_up(ref self: City) -> u8 {
        // Check if we have enough buildings for next level
        // Requirement: 5 buildings per level
        let buildings_required = 5 * self.level.into();
        assert(self.total_buildings >= buildings_required, errors::CITY_INSUFFICIENT_RESOURCES);
        
        // Check if we have enough gold for upgrade
        let gold_required = 5000 * self.level.into();
        assert(self.resources.gold >= gold_required, errors::CITY_INSUFFICIENT_RESOURCES);
        
        // Check if we have enough resources for upgrade
        let resources_required = 1000 * self.level.into();
        assert(self.resources.stone >= resources_required, errors::CITY_INSUFFICIENT_RESOURCES);
        assert(self.resources.wood >= resources_required, errors::CITY_INSUFFICIENT_RESOURCES);
        
        // Deduct resources
        self.resources.gold -= gold_required;
        self.resources.stone -= resources_required;
        self.resources.wood -= resources_required;
        
        // Increase level
        self.level += 1;
        
        // Update storage capacity for new level
        self.update_storage_capacity();
        
        // Update city stats for new level
        self.stats.happiness += 500; // +5% happiness
        if self.stats.happiness > 10000 {
            self.stats.happiness = 10000;
        }
        
        // Update timestamp
        self.last_update = get_block_timestamp();
        
        // Return new level
        self.level
    }
}