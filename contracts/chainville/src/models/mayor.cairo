use starknet::{ContractAddress, get_block_timestamp, get_tx_info};
use core::num::traits::Zero;
use core::hash::HashStateTrait;
use core::poseidon::PoseidonTrait;

// Skill points structure for the mayor
#[derive(Copy, Drop, Serde, Debug)]
pub struct MayorSkills {
    pub leadership: u8,       // Affects overall city performance
    pub economy: u8,          // Affects resource production
    pub diplomacy: u8,        // Affects relations with other players
    pub engineering: u8,      // Affects building costs and durability
    pub administration: u8,   // Affects tax efficiency
    pub innovation: u8,       // Affects research speed
    pub charisma: u8,         // Affects happiness and tourism
    pub security: u8,         // Affects city defense
}

// Titles/Awards that mayor can earn
#[derive(Drop, Copy,PartialEq, Serde, Introspect, Debug)]
pub enum MayorTitle {
    None,
    Novice,           // New mayor
    Established,      // Mayor of a level 3+ city
    Respected,        // Mayor with 50+ total skill points
    Visionary,        // Mayor with 10+ innovation
    GreatBuilder,     // Mayor with 50+ total buildings
    MasterEconomist,  // Mayor with 10+ economy skill
    Diplomat,         // Mayor with 10+ diplomacy skill
    Beloved,          // Mayor with 90%+ city happiness
    Defender,         // Mayor with 10+ security skill
    Legend            // Mayor of a level 10 city
}

// Mayor model
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Mayor {
    #[key]
    pub game_id: u32,                 // Reference to the parent game
    #[key]
    pub player: ContractAddress,      // Player who controls this mayor
    
    // Mayor information
    pub name: felt252,                // Mayor's name
    pub experience: u32,              // Total experience points
    pub level: u8,                    // Mayor level (1-20)
    pub skill_points_available: u8,   // Unspent skill points
    pub skills: MayorSkills,          // Mayor's skill allocation
    
    // Mayor statistics
    pub cities_founded: u8,           // Number of cities founded
    pub buildings_constructed: u16,   // Total buildings built
    pub resources_collected: u64,     // Total resources collected
    pub total_population: u32,        // Sum of population across all cities
    pub taxes_collected: u64,         // Total taxes collected
    
    // Mayor status
    pub joined_date: u64,             // When the mayor joined the game
    pub last_active: u64,             // Last activity timestamp
    pub title: MayorTitle,            // Mayor's current title
    pub consecutive_days: u16,        // Consecutive days of activity
    pub reputation: i16,              // Reputation score (-1000 to 1000)
    pub active: bool,                 // Whether this mayor is active
}

// Error constants for mayor operations
pub mod errors {
    pub const MAYOR_NOT_OWNER: felt252 = 'Mayor: caller is not owner';
    pub const MAYOR_INVALID_OWNER: felt252 = 'Mayor: invalid owner address';
    pub const MAYOR_NOT_ACTIVE: felt252 = 'Mayor: mayor is not active';
    pub const MAYOR_INVALID_NAME: felt252 = 'Mayor: invalid name';
    pub const MAYOR_INVALID_SKILL: felt252 = 'Mayor: invalid skill value';
    pub const MAYOR_NO_SKILL_POINTS: felt252 = 'Mayor: points Unavailable';
    pub const MAYOR_MAX_SKILL: felt252 = 'Mayor: skill already at maximum';
    pub const MAYOR_MAX_LEVEL: felt252 = 'Mayor: already at maximum level';
}

#[generate_trait]
pub impl MayorImpl of MayorTrait {
    /// Creates a new mayor with default settings
    #[inline(always)]
    fn new(
        game_id: u32,
        player: ContractAddress,
        name: felt252
    ) -> Mayor {
        // Validate player address
        assert(player != Zero::zero(), errors::MAYOR_INVALID_OWNER);
        
        // Validate name is not empty
        assert(name != '', errors::MAYOR_INVALID_NAME);
        
        // Get current timestamp
        let current_time = get_block_timestamp();
        
        // Default starting skills
        let starting_skills = MayorSkills {
            leadership: 1,
            economy: 1,
            diplomacy: 1,
            engineering: 1,
            administration: 1,
            innovation: 1,
            charisma: 1,
            security: 1,
        };
        
        // Return new mayor
        Mayor {
            game_id,
            player,
            name,
            experience: 0,
            level: 1,
            skill_points_available: 3, // Start with 3 unspent points
            skills: starting_skills,
            cities_founded: 0,
            buildings_constructed: 0,
            resources_collected: 0,
            total_population: 0,
            taxes_collected: 0,
            joined_date: current_time,
            last_active: current_time,
            title: MayorTitle::Novice,
            consecutive_days: 1,
            reputation: 0,
            active: true,
        }
    }
    
    /// Adds experience points to the mayor and handles level ups
    fn add_experience(ref self: Mayor, exp_points: u32) -> u8 {
        // Ensure mayor is active
        assert(self.active, errors::MAYOR_NOT_ACTIVE);
        
        // Add experience
        self.experience += exp_points;
        
        // Check for level up
        // Formula: Next level requires (current_level * 1000) exp
        let mut level_changed = false;
        loop {
            // Calculate exp needed for next level
            let next_level = self.level + 1;
            
            // Cap at level 20
            if next_level > 20 {
                break;
            }
            
            let exp_needed = (self.level.into()) * 1000;
            
            // If we have enough exp, level up
            if self.experience >= exp_needed {
                self.level = next_level;
                self.skill_points_available += 2; // Get 2 skill points per level
                level_changed = true;
                
                // Subtract the experience used for this level
                self.experience -= exp_needed;
            } else {
                // Not enough exp for another level
                break;
            }
        };
        
        // Update last active time
        self.last_active = get_block_timestamp();
        
        // Check for title updates if level changed
        if level_changed {
            self.update_title();
        }
        
        // Return current level
        self.level
    }
    
    /// Allocate a skill point to a specific skill
    fn allocate_skill_point(
        ref self: Mayor, 
        skill_id: u8 // 0:leadership, 1:economy, 2:diplomacy, 3:engineering, 4:administration, 5:innovation, 6:charisma, 7:security
    ) -> u8 {
        // Ensure mayor is active
        assert(self.active, errors::MAYOR_NOT_ACTIVE);
        
        // Check if we have skill points available
        assert(self.skill_points_available > 0, errors::MAYOR_NO_SKILL_POINTS);
        
        // Max skill value is 10
        
        // Add point to the specified skill
        match skill_id {
            0 => {
                assert(self.skills.leadership < 10, errors::MAYOR_MAX_SKILL);
                self.skills.leadership += 1;
                self.skills.leadership
            },
            1 => {
                assert(self.skills.economy < 10, errors::MAYOR_MAX_SKILL);
                self.skills.economy += 1;
                self.skills.economy
            },
            2 => {
                assert(self.skills.diplomacy < 10, errors::MAYOR_MAX_SKILL);
                self.skills.diplomacy += 1;
                self.skills.diplomacy
            },
            3 => {
                assert(self.skills.engineering < 10, errors::MAYOR_MAX_SKILL);
                self.skills.engineering += 1;
                self.skills.engineering
            },
            4 => {
                assert(self.skills.administration < 10, errors::MAYOR_MAX_SKILL);
                self.skills.administration += 1;
                self.skills.administration
            },
            5 => {
                assert(self.skills.innovation < 10, errors::MAYOR_MAX_SKILL);
                self.skills.innovation += 1;
                self.skills.innovation
            },
            6 => {
                assert(self.skills.charisma < 10, errors::MAYOR_MAX_SKILL);
                self.skills.charisma += 1;
                self.skills.charisma
            },
            7 => {
                assert(self.skills.security < 10, errors::MAYOR_MAX_SKILL);
                self.skills.security += 1;
                self.skills.security
            },
            _ => {
                panic(array!['Invalid skill ID'])
            }
        }
        
        // Decrement available skill points
        self.skill_points_available -= 1;
        
        // Update last active time
        self.last_active = get_block_timestamp();
        
        // Check for title updates
        self.update_title();
        
        // Return the new skill value
        0 // This is replaced by the actual return value in the match
    }
    
    /// Updates mayor stats when a city is founded
    fn city_founded(ref self: Mayor) {
        // Ensure mayor is active
        assert(self.active, errors::MAYOR_NOT_ACTIVE);
        
        // Increment cities founded
        self.cities_founded += 1;
        
        // Add experience for founding a city
        let exp_gain = 500;
        self.add_experience(exp_gain);
        
        // Update last active time
        self.last_active = get_block_timestamp();
    }
    
    /// Updates mayor stats when a building is constructed
    fn building_constructed(ref self: Mayor) {
        // Ensure mayor is active
        assert(self.active, errors::MAYOR_NOT_ACTIVE);
        
        // Increment buildings constructed
        self.buildings_constructed += 1;
        
        // Add experience for building construction
        let exp_gain = 50;
        self.add_experience(exp_gain);
        
        // Update last active time
        self.last_active = get_block_timestamp();
        
        // Check for title updates
        if self.buildings_constructed >= 50 {
            // Set GreatBuilder title if not already has a better title
            match self.title {
                MayorTitle::None | MayorTitle::Novice | MayorTitle::Established => {
                    self.title = MayorTitle::GreatBuilder;
                },
                _ => {
                    // Keep current title
                }
            }
        }
    }
    
    /// Updates mayor stats when resources are collected
    fn resources_collected(ref self: Mayor, amount: u64) {
        // Ensure mayor is active
        assert(self.active, errors::MAYOR_NOT_ACTIVE);
        
        // Add to total resources collected
        self.resources_collected += amount;
        
        // Add experience based on resources (1 exp per 100 resources)
        let exp_gain = amount / 100;
        if exp_gain > 0 {
            self.add_experience(exp_gain.try_into().unwrap());
        }
        
        // Update last active time
        self.last_active = get_block_timestamp();
    }
    
    /// Updates mayor stats when taxes are collected
    fn taxes_collected(ref self: Mayor, amount: u64) {
        // Ensure mayor is active
        assert(self.active, errors::MAYOR_NOT_ACTIVE);
        
        // Add to total taxes collected
        self.taxes_collected += amount;
        
        // Add experience based on taxes (1 exp per 10 taxes)
        let exp_gain = amount / 10;
        if exp_gain > 0 {
            self.add_experience(exp_gain.try_into().unwrap());
        }
        
        // Update last active time
        self.last_active = get_block_timestamp();
    }
    
    /// Update population statistics
    fn update_population(ref self: Mayor, total_pop: u32) {
        // Ensure mayor is active
        assert(self.active, errors::MAYOR_NOT_ACTIVE);
        
        // Update total population
        self.total_population = total_pop;
        
        // Add experience if population increased (1 exp per 10 population)
        if total_pop > self.total_population {
            let pop_increase = total_pop - self.total_population;
            let exp_gain = pop_increase / 10;
            if exp_gain > 0 {
                self.add_experience(exp_gain);
            }
        }
        
        // Update last active time
        self.last_active = get_block_timestamp();
    }
    
    /// Updates mayor's daily activity streak
    fn daily_login(ref self: Mayor) -> u16 {
        // Ensure mayor is active
        assert(self.active, errors::MAYOR_NOT_ACTIVE);
        
        // Get current time
        let current_time = get_block_timestamp();
        
        // Check if it's been more than 36 hours since last login (missed a day)
        if current_time - self.last_active > 129600 { // 36 hours in seconds
            // Reset streak
            self.consecutive_days = 1;
        } else if current_time - self.last_active > 64800 { // 18 hours in seconds
            // It's been at least 18 hours, count as a new day
            self.consecutive_days += 1;
            
            // Award experience based on streak
            let exp_gain = if self.consecutive_days <= 7 {
                // 100 exp for first week
                100
            } else if self.consecutive_days <= 30 {
                // 200 exp for rest of month
                200
            } else {
                // 300 exp for 30+ day streaks
                300
            };
            
            self.add_experience(exp_gain);
        }
        
        // Update last active time
        self.last_active = current_time;
        
        // Return consecutive days
        self.consecutive_days
    }
    
    /// Update mayor's title based on achievements
    fn update_title(ref self: Mayor) -> MayorTitle {
        // Calculate total skill points
        let total_skill_points = 
            self.skills.leadership +
            self.skills.economy +
            self.skills.diplomacy +
            self.skills.engineering +
            self.skills.administration +
            self.skills.innovation +
            self.skills.charisma +
            self.skills.security;
            
        // Determine highest title eligible for
        let new_title = if self.level >= 10 {
            // Level 10+ mayors can be Legend
            MayorTitle::Legend
        } else if total_skill_points >= 50 {
            // 50+ total skill points
            MayorTitle::Respected
        } else if self.skills.economy >= 10 {
            // Economy specialist
            MayorTitle::MasterEconomist
        } else if self.skills.diplomacy >= 10 {
            // Diplomacy specialist
            MayorTitle::Diplomat
        } else if self.skills.innovation >= 10 {
            // Innovation specialist
            MayorTitle::Visionary
        } else if self.skills.security >= 10 {
            // Security specialist
            MayorTitle::Defender
        } else if self.buildings_constructed >= 50 {
            // Building specialist
            MayorTitle::GreatBuilder
        } else if self.level >= 3 {
            // Level 3+
            MayorTitle::Established
        } else {
            // Default for new mayors
            MayorTitle::Novice
        };
        
        // Update title if it's better than current
        // Note: The enum order defines the hierarchy
        let current_title_value = self.title;
        let new_title_value = new_title;
        
        // Compare title values (higher enum value = better title)
        
        self.title = new_title;
        
        
        // Return current title
        self.title
    }
    
    /// Calculate the mayor's skill bonus for city production
    fn calculate_production_bonus(self: Mayor) -> u16 {
        // Base multiplier starts at 100 (100%)
        let mut bonus: u16 = 100;
        
        // Each point of economy adds 5%
        bonus += (self.skills.economy.into()) * 5;
        
        // Each point of leadership adds 2%
        bonus += (self.skills.leadership.into()) * 2;
        
        // Each level adds 1%
        bonus += (self.level.into());
        
        // Return the bonus multiplier
        bonus
    }
    
    /// Calculate the mayor's skill bonus for building costs
    fn calculate_building_discount(self: Mayor) -> u16 {
        // Base discount starts at 0%
        let mut discount: u16 = 0;
        
        // Each point of engineering reduces cost by 2%
        discount += (self.skills.engineering.into()) * 2;
        
        // Each point of administration reduces cost by 1%
        discount += (self.skills.administration.into());
        
        // Cap discount at 30%
        if discount > 30 {
            discount = 30;
        }
        
        // Return the discount percentage
        discount
    }
    
    /// Calculate the mayor's skill bonus for city happiness
    fn calculate_happiness_bonus(self: Mayor) -> u16 {
        // Base bonus starts at 0
        let mut bonus: u16 = 0;
        
        // Each point of charisma adds 3% happiness
        bonus += (self.skills.charisma.into()) * 3;
        
        // Each point of leadership adds 1% happiness
        bonus += (self.skills.leadership.into());
        
        // Return the happiness bonus
        bonus
    }
}