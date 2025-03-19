use starknet::{ContractAddress, get_block_timestamp, get_tx_info};
use core::num::traits::Zero;
use core::hash::HashStateTrait;
use core::poseidon::PoseidonTrait;

/// Game struct - Central game hub for the entire city builder ecosystem
/// This acts as the global state coordinator for all city instances
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Game {
    #[key]
    pub game_id: u32,                 
    pub admin: ContractAddress,       
    pub world_name: felt252,         
    pub world_seed: felt252,          
    pub creation_time: u64,           
    pub last_update: u64,             
    
    // Global statistics
    pub total_cities: u32,           
    pub total_players: u32,           
    pub total_buildings: u32,         
    pub total_resources: u64,        

    // Game configuration
    pub max_cities_per_player: u8,    
    pub max_buildings_per_city: u32,  
    pub global_difficulty: u8,        
    pub resource_multiplier: u16,     
    pub build_speed_factor: u16,      
    
    // Economy settings
    pub base_tax_rate: u16,           
    pub inflation_rate: u16,          
    pub resource_decay_rate: u16,     
    pub tech_research_cost_multiplier: u16,
    pub market_volatility: u16,       
    pub trade_tariff: u16,            
    pub loan_interest_rate: u16,      
    pub treasure_vault: u64,          
    pub global_supply_cap: u64,       
    
    // Game state
    pub active: bool,                 
    pub maintenance_mode: bool,       
    pub version: felt252,            
}

// Error constants for game operations
pub mod errors {
    pub const GAME_NOT_ADMIN: felt252 = 'Game: caller is not admin';
    pub const GAME_NOT_ACTIVE: felt252 = 'Game: world is not active';
    pub const GAME_IN_MAINTENANCE: felt252 = 'Game: world in maintenance mode';
    pub const GAME_INVALID_ADMIN: felt252 = 'Game: invalid admin address';
    pub const GAME_CITY_LIMIT_REACHED: felt252 = 'Game: city limit reached';
    pub const GAME_INVALID_DIFFICULTY: felt252 = 'Game: invalid difficulty';
    pub const GAME_INVALID_RATE: felt252 = 'Game: invalid rate value';
}

#[generate_trait]
pub impl GameImpl of GameTrait {
    /// Creates a new game world with default settings
    #[inline(always)]
    fn new(
        game_id: u32, 
        admin: ContractAddress, 
        world_name: felt252
    ) -> Game {
        // Validate admin address
        assert(admin != Zero::zero(), errors::GAME_INVALID_ADMIN);
        
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        // Generate world seed using transaction info
        let tx_info = get_tx_info().unbox();
        let mut state = PoseidonTrait::new();
        state = state.update(game_id.into());
        state = state.update(admin.into());
        state = state.update(current_time.into());
        state = state.update(tx_info.transaction_hash);
        let world_seed = state.finalize();
        
        // Return new game with default settings
        Game {
            game_id,
            admin,
            world_name,
            world_seed,
            creation_time: current_time,
            last_update: current_time,
            
            // Initialize statistics
            total_cities: 0,
            total_players: 0,
            total_buildings: 0,
            total_resources: 0,
            
            // Default configuration
            max_cities_per_player: 3,
            max_buildings_per_city: 100,
            global_difficulty: 2,  // Medium difficulty
            resource_multiplier: 100, // Normal rate (1.0x)
            build_speed_factor: 100, // Normal speed (1.0x)
            
            // Default economy settings
            base_tax_rate: 50,     // 5%
            inflation_rate: 10,     // 1%
            resource_decay_rate: 5, // 0.5%
            tech_research_cost_multiplier: 100, // 1.0x
            market_volatility: 20,  // 20%
            trade_tariff: 30,       // 3%
            loan_interest_rate: 100, // 10%
            treasure_vault: 100000, // Initial treasury
            global_supply_cap: 100000000, // Initial global cap
            
            // Game state
            active: true,
            maintenance_mode: false,
            version: 'v1.0.0',
        }
    }
    
    /// Updates global economy settings
    fn update_economy(
        ref self: Game, 
        tax_rate: u16, 
        inflation: u16, 
        volatility: u16,
        tariff: u16,
        caller: ContractAddress
    ) {
        // Ensure caller is admin
        
        assert(caller == self.admin, errors::GAME_NOT_ADMIN);
        
        // Validate rate values (all must be within reasonable limits)
        assert(tax_rate <= 500, errors::GAME_INVALID_RATE); // Max 50%
        assert(inflation <= 200, errors::GAME_INVALID_RATE); // Max 20%
        assert(volatility <= 500, errors::GAME_INVALID_RATE); // Max 500%
        assert(tariff <= 300, errors::GAME_INVALID_RATE); // Max 30%
        
        // Update economy settings
        self.base_tax_rate = tax_rate;
        self.inflation_rate = inflation;
        self.market_volatility = volatility;
        self.trade_tariff = tariff;
        
        // Update last update timestamp
        self.last_update = get_block_timestamp();
    }
    
    /// Increments total cities in the game world
    fn add_city(ref self: Game) -> u32 {
        // Ensure game is active
        assert(self.active, errors::GAME_NOT_ACTIVE);
        assert(!self.maintenance_mode, errors::GAME_IN_MAINTENANCE);
        
        // Increment city count
        self.total_cities += 1;
        
        // Update timestamp
        self.last_update = get_block_timestamp();
        
        // Return new city count
        self.total_cities
    }


    fn add_builder(ref self: Game) -> u32 {
        // Ensure game is active
        assert(self.active, errors::GAME_NOT_ACTIVE);
        assert(!self.maintenance_mode, errors::GAME_IN_MAINTENANCE);
        
        // Increment city count
        self.total_players += 1;
        
        // Update timestamp
        self.last_update = get_block_timestamp();
        
        // Return new city count
        self.total_players
    }
    
    /// Increments building count
    fn add_building(ref self: Game, building_value: u64) -> u32 {
        // Ensure game is active
        assert(self.active, errors::GAME_NOT_ACTIVE);
        
        // Update statistics
        self.total_buildings += 1;
        self.total_resources += building_value;
        
        // Update timestamp
        self.last_update = get_block_timestamp();
        
        // Return new building count
        self.total_buildings
    }
    
    /// Toggle maintenance mode (admin only)
    fn toggle_maintenance(ref self: Game) -> bool {
        // Ensure caller is admin
        let caller = get_tx_info().unbox().account_contract_address;
        assert(caller == self.admin, errors::GAME_NOT_ADMIN);
        
        // Toggle maintenance flag
        self.maintenance_mode = !self.maintenance_mode;
        
        // Update timestamp
        self.last_update = get_block_timestamp();
        
        // Return new state
        self.maintenance_mode
    }
    
    /// Calculate adjusted resource multiplier based on current economic conditions
    fn get_adjusted_resource_rate(self: Game) -> u16 {
        // Base multiplier adjusted by inflation
        let inflation_impact = (self.resource_multiplier * self.inflation_rate) / 1000;
        let base_adjusted = self.resource_multiplier + inflation_impact;
        
        // Further adjustment based on total resources vs cap (scarcity factor)
        let scarcity_factor = if self.total_resources >= self.global_supply_cap {
            80 // 20% reduction if at capacity
        } else {
            let utilization = (self.total_resources * 100) / self.global_supply_cap;
            if utilization > 80 {
                90 // 10% reduction if >80% utilized
            } else if utilization > 50 {
                95 // 5% reduction if >50% utilized
            } else {
                100 // No reduction
            }
        };
        
        // Apply scarcity factor and return
        (base_adjusted * scarcity_factor) / 100
    }
    
    /// Transfer admin rights to new address
    fn transfer_admin(ref self: Game, new_admin: ContractAddress,caller: ContractAddress) {
        // Ensure caller is current admin
        assert(caller == self.admin, errors::GAME_NOT_ADMIN);
        
        // Ensure new admin is valid
        assert(new_admin != Zero::zero(), errors::GAME_INVALID_ADMIN);
        
        // Transfer admin rights
        self.admin = new_admin;
        
        // Update timestamp
        self.last_update = get_block_timestamp();
    }
}