/// Resource property constants for simulation calculations
pub mod resource_constants {
    // Time constants (in seconds)
    pub mod construction_time {
        pub const ROAD: u64 = 60;       // 1 minute
        pub const PARK: u64 = 120;      // 2 minutes
        pub const RESIDENTIAL: u64 = 300; // 5 minutes
        pub const COMMERCIAL: u64 = 600; // 10 minutes
        pub const INDUSTRIAL: u64 = 900; // 15 minutes
        pub const UTILITY: u64 = 1200;   // 20 minutes
        pub const SPECIAL: u64 = 1800;   // 30 minutes
    }
    
    // Cost constants (in gold)
    pub mod build_cost {
        pub const ROAD: u64 = 100;
        pub const PARK: u64 = 500;
        pub const RESIDENTIAL: u64 = 1000;
        pub const COMMERCIAL: u64 = 2000;
        pub const INDUSTRIAL: u64 = 3000;
        pub const UTILITY: u64 = 5000;
        pub const SPECIAL: u64 = 10000;
    }
    
    // Maintenance cost constants (hourly)
    pub mod maintenance {
        pub const ROAD: u16 = 2;
        pub const PARK: u16 = 5;
        pub const RESIDENTIAL: u16 = 5;
        pub const COMMERCIAL: u16 = 8;
        pub const INDUSTRIAL: u16 = 12;
        pub const UTILITY: u16 = 15;
        pub const SPECIAL: u16 = 20;
    }
    
    // Income generation constants (hourly)
    pub mod income {
        pub const ROAD: u16 = 0;
        pub const PARK: u16 = 2;
        pub const RESIDENTIAL: u16 = 10;
        pub const COMMERCIAL: u16 = 20;
        pub const INDUSTRIAL: u16 = 30;
        pub const UTILITY: u16 = 8;
        pub const SPECIAL: u16 = 15;
    }
    
    // Happiness effect constants (-100 to 100)
    pub mod happiness {
        pub const ROAD: i16 = 0;
        pub const PARK: i16 = 15;
        pub const RESIDENTIAL: i16 = 5;
        pub const COMMERCIAL: i16 = 3;
        pub const INDUSTRIAL: i16 = -5;
        pub const UTILITY: i16 = -2;
        pub const SPECIAL: i16 = 10;
    }
    
    // Population capacity constants
    pub mod population {
        pub const ROAD: u16 = 0;
        pub const PARK: u16 = 0;
        pub const RESIDENTIAL: u16 = 20;
        pub const COMMERCIAL: u16 = 0;
        pub const INDUSTRIAL: u16 = 0;
        pub const UTILITY: u16 = 0;
        pub const SPECIAL: u16 = 10;
    }
    
    // Employment capacity constants
    pub mod employment {
        pub const ROAD: u16 = 0;
        pub const PARK: u16 = 2;
        pub const RESIDENTIAL: u16 = 0;
        pub const COMMERCIAL: u16 = 15;
        pub const INDUSTRIAL: u16 = 25;
        pub const UTILITY: u16 = 5;
        pub const SPECIAL: u16 = 10;
    }
    
    // Utility capacity constants
    pub mod utility_capacity {
        // Water capacity
        pub mod water {
            pub const STANDARD: u16 = 50;
            pub const LARGE: u16 = 100;
            pub const HUGE: u16 = 200;
        }
        
        // Power capacity
        pub mod power {
            pub const STANDARD: u16 = 50;
            pub const LARGE: u16 = 100;
            pub const HUGE: u16 = 200;
        }
    }
    
    // Pollution effect constants (negative is reduction)
    pub mod pollution {
        pub const ROAD: i16 = 2;
        pub const PARK: i16 = -10;
        pub const RESIDENTIAL: i16 = 0;
        pub const COMMERCIAL: i16 = 5;
        pub const INDUSTRIAL: i16 = 20;
        pub const UTILITY: i16 = 10;
        pub const SPECIAL: i16 = 0;
    }
    
    // Traffic effect constants
    pub mod traffic {
        pub const ROAD: u16 = 0;
        pub const PARK: u16 = 2;
        pub const RESIDENTIAL: u16 = 10;
        pub const COMMERCIAL: u16 = 20;
        pub const INDUSTRIAL: u16 = 15;
        pub const UTILITY: u16 = 5;
        pub const SPECIAL: u16 = 20;
    }
    
    // Crime effect constants (negative is reduction)
    pub mod crime {
        pub const ROAD: i16 = 0;
        pub const PARK: i16 = -5;
        pub const RESIDENTIAL: i16 = 0;
        pub const COMMERCIAL: i16 = 0;
        pub const INDUSTRIAL: i16 = 5;
        pub const UTILITY: i16 = 0;
        pub const SPECIAL: i16 = 0;
        pub const POLICE_STATION: i16 = -20;
    }
    
    // Land value effect constants (negative is reduction)
    pub mod land_value {
        pub const ROAD: i16 = 0;
        pub const PARK: i16 = 15;
        pub const RESIDENTIAL: i16 = 0;
        pub const COMMERCIAL: i16 = 2;
        pub const INDUSTRIAL: i16 = -10;
        pub const UTILITY: i16 = -5;
        pub const SPECIAL: i16 = 20;
    }
    
    // Standard dimensions for resources (width x height in cells)
    pub mod dimensions {
        pub const SMALL: (u8, u8) = (1, 1);
        pub const MEDIUM: (u8, u8) = (2, 2);
        pub const LARGE: (u8, u8) = (3, 3);
        pub const HUGE: (u8, u8) = (4, 4);
        pub const WIDE: (u8, u8) = (2, 1);
        pub const TALL: (u8, u8) = (1, 2);
    }
}



/// Resource metadata lookup
pub fn get_resource_metadata(resource_id: u32) -> ResourceMetadata {
    use resource_constants::{base, economic, capacity, effects};
    
    // Get the resource type
    let resource_type = get_resource_type(resource_id);
    
    // Create default base metadata for the resource type
    let base_properties = match resource_type {
        ResourceType::Residential => BaseProperties {
            width: base::SMALL.0,
            height: base::SMALL.1,
            build_cost: base::RESIDENTIAL_COST,
            construction_time: base::RESIDENTIAL_TIME,
        },
        ResourceType::Commercial => BaseProperties {
            width: base::SMALL.0,
            height: base::SMALL.1,
            build_cost: base::COMMERCIAL_COST,
            construction_time: base::COMMERCIAL_TIME,
        },
        ResourceType::Industrial => BaseProperties {
            width: base::MEDIUM.0,
            height: base::MEDIUM.1,
            build_cost: base::INDUSTRIAL_COST,
            construction_time: base::INDUSTRIAL_TIME,
        },
        ResourceType::Utilities => BaseProperties {
            width: base::MEDIUM.0,
            height: base::MEDIUM.1,
            build_cost: base::UTILITY_COST,
            construction_time: base::UTILITY_TIME,
        },
        ResourceType::Parks => BaseProperties {
            width: base::SMALL.0,
            height: base::SMALL.1,
            build_cost: base::PARK_COST,
            construction_time: base::PARK_TIME,
        },
        ResourceType::Roads => BaseProperties {
            width: base::SMALL.0,
            height: base::SMALL.1,
            build_cost: base::ROAD_COST,
            construction_time: base::ROAD_TIME,
        },
        ResourceType::Special => BaseProperties {
            width: base::MEDIUM.0,
            height: base::MEDIUM.1,
            build_cost: base::SPECIAL_COST,
            construction_time: base::SPECIAL_TIME,
        },
        ResourceType::None => BaseProperties {
            width: base::SMALL.0,
            height: base::SMALL.1,
            build_cost: 0,
            construction_time: 0,
        },
    };
    
    // Create economic properties for the resource type
    let economic_properties = match resource_type {
        ResourceType::Residential => EconomicProperties {
            maintenance_cost: economic::RESIDENTIAL_MAINTENANCE,
            income: economic::RESIDENTIAL_INCOME,
            happiness_effect: economic::RESIDENTIAL_HAPPINESS,
        },
        ResourceType::Commercial => EconomicProperties {
            maintenance_cost: economic::COMMERCIAL_MAINTENANCE,
            income: economic::COMMERCIAL_INCOME,
            happiness_effect: economic::COMMERCIAL_HAPPINESS,
        },
        ResourceType::Industrial => EconomicProperties {
            maintenance_cost: economic::INDUSTRIAL_MAINTENANCE,
            income: economic::INDUSTRIAL_INCOME,
            happiness_effect: economic::INDUSTRIAL_HAPPINESS,
        },
        ResourceType::Utilities => EconomicProperties {
            maintenance_cost: economic::UTILITY_MAINTENANCE,
            income: economic::UTILITY_INCOME,
            happiness_effect: economic::UTILITY_HAPPINESS,
        },
        ResourceType::Parks => EconomicProperties {
            maintenance_cost: economic::PARK_MAINTENANCE,
            income: economic::PARK_INCOME,
            happiness_effect: economic::PARK_HAPPINESS,
        },
        ResourceType::Roads => EconomicProperties {
            maintenance_cost: economic::ROAD_MAINTENANCE,
            income: economic::ROAD_INCOME,
            happiness_effect: economic::ROAD_HAPPINESS,
        },
        ResourceType::Special => EconomicProperties {
            maintenance_cost: economic::SPECIAL_MAINTENANCE,
            income: economic::SPECIAL_INCOME,
            happiness_effect: economic::SPECIAL_HAPPINESS,
        },
        ResourceType::None => EconomicProperties {
            maintenance_cost: 0,
            income: 0,
            happiness_effect: 0,
        },
    };
    
    // Create capacity properties for the resource type
    let capacity_properties = match resource_type {
        ResourceType::Residential => CapacityProperties {
            population_capacity: capacity::RESIDENTIAL_POPULATION,
            employment_capacity: capacity::RESIDENTIAL_EMPLOYMENT,
            water_capacity: capacity::NO_WATER,
            power_capacity: capacity::NO_POWER,
        },
        ResourceType::Commercial => CapacityProperties {
            population_capacity: capacity::COMMERCIAL_POPULATION,
            employment_capacity: capacity::COMMERCIAL_EMPLOYMENT,
            water_capacity: capacity::NO_WATER,
            power_capacity: capacity::NO_POWER,
        },
        ResourceType::Industrial => CapacityProperties {
            population_capacity: capacity::INDUSTRIAL_POPULATION,
            employment_capacity: capacity::INDUSTRIAL_EMPLOYMENT,
            water_capacity: capacity::NO_WATER,
            power_capacity: capacity::NO_POWER,
        },
        ResourceType::Utilities => CapacityProperties {
            population_capacity: capacity::UTILITY_POPULATION,
            employment_capacity: capacity::UTILITY_EMPLOYMENT,
            water_capacity: capacity::MEDIUM_WATER,
            power_capacity: capacity::MEDIUM_POWER,
        },
        ResourceType::Parks => CapacityProperties {
            population_capacity: capacity::PARK_POPULATION,
            employment_capacity: capacity::PARK_EMPLOYMENT,
            water_capacity: capacity::NO_WATER,
            power_capacity: capacity::NO_POWER,
        },
        ResourceType::Roads => CapacityProperties {
            population_capacity: capacity::ROAD_POPULATION,
            employment_capacity: capacity::ROAD_EMPLOYMENT,
            water_capacity: capacity::NO_WATER,
            power_capacity: capacity::NO_POWER,
        },
        ResourceType::Special => CapacityProperties {
            population_capacity: capacity::SPECIAL_POPULATION,
            employment_capacity: capacity::SPECIAL_EMPLOYMENT,
            water_capacity: capacity::NO_WATER,
            power_capacity: capacity::NO_POWER,
        },
        ResourceType::None => CapacityProperties {
            population_capacity: 0,
            employment_capacity: 0,
            water_capacity: 0,
            power_capacity: 0,
        },
    };
    
    // Create effect properties for the resource type
    let effect_properties = match resource_type {
        ResourceType::Residential => EffectProperties {
            pollution_effect: effects::RESIDENTIAL_POLLUTION,
            traffic_effect: effects::RESIDENTIAL_TRAFFIC,
            crime_effect: effects::RESIDENTIAL_CRIME,
            land_value_effect: effects::RESIDENTIAL_LAND_VALUE,
        },
        ResourceType::Commercial => EffectProperties {
            pollution_effect: effects::COMMERCIAL_POLLUTION,
            traffic_effect: effects::COMMERCIAL_TRAFFIC,
            crime_effect: effects::COMMERCIAL_CRIME,
            land_value_effect: effects::COMMERCIAL_LAND_VALUE,
        },
        ResourceType::Industrial => EffectProperties {
            pollution_effect: effects::INDUSTRIAL_POLLUTION,
            traffic_effect: effects::INDUSTRIAL_TRAFFIC,
            crime_effect: effects::INDUSTRIAL_CRIME,
            land_value_effect: effects::INDUSTRIAL_LAND_VALUE,
        },
        ResourceType::Utilities => EffectProperties {
            pollution_effect: effects::UTILITY_POLLUTION,
            traffic_effect: effects::UTILITY_TRAFFIC,
            crime_effect: effects::UTILITY_CRIME,
            land_value_effect: effects::UTILITY_LAND_VALUE,
        },
        ResourceType::Parks => EffectProperties {
            pollution_effect: effects::PARK_POLLUTION,
            traffic_effect: effects::PARK_TRAFFIC,
            crime_effect: effects::PARK_CRIME,
            land_value_effect: effects::PARK_LAND_VALUE,
        },
        ResourceType::Roads => EffectProperties {
            pollution_effect: effects::ROAD_POLLUTION,
            traffic_effect: effects::ROAD_TRAFFIC,
            crime_effect: effects::ROAD_CRIME,
            land_value_effect: effects::ROAD_LAND_VALUE,
        },
        ResourceType::Special => EffectProperties {
            pollution_effect: effects::SPECIAL_POLLUTION,
            traffic_effect: effects::SPECIAL_TRAFFIC,
            crime_effect: effects::SPECIAL_CRIME,
            land_value_effect: effects::SPECIAL_LAND_VALUE,
        },
        ResourceType::None => EffectProperties {
            pollution_effect: 0,
            traffic_effect: 0,
            crime_effect: 0,
            land_value_effect: 0,
        },
    };
    
    // Create the complete metadata
    let mut metadata = ResourceMetadata {
        base: base_properties,
        economic: economic_properties,
        capacity: capacity_properties,
        effects: effect_properties,
    };
    
    // Apply specific modifications for individual resource IDs
    match resource_id {
        // === RESIDENTIAL BUILDINGS ===
        1001 => { // APARTMENT_CHINA
            metadata.base.width = base::MEDIUM.0;
            metadata.base.height = base::MEDIUM.1;
            metadata.capacity.population_capacity = capacity::RESIDENTIAL_POPULATION * 2; // Twice the population
            metadata.base.build_cost = base::RESIDENTIAL_COST * 15 / 10; // 50% more expensive
        },
        1003 => { // HOUSE_BLOCK_BIG
            metadata.base.width = base::MEDIUM.0;
            metadata.base.height = base::MEDIUM.1;
            metadata.capacity.population_capacity = capacity::RESIDENTIAL_POPULATION * 15 / 10; // 50% more population
        },
        1004 => { // HOUSE_BLOCK_OLD
            metadata.economic.maintenance_cost = economic::RESIDENTIAL_MAINTENANCE * 12 / 10; // 20% more maintenance
            metadata.economic.income = economic::RESIDENTIAL_INCOME * 9 / 10; // 10% less income
        },
        1005 => { // HOUSE_FAMILY_LARGE
            metadata.base.width = base::MEDIUM.0;
            metadata.base.height = base::MEDIUM.1;
            metadata.capacity.population_capacity = capacity::RESIDENTIAL_POPULATION * 12 / 10; // 20% more population
            metadata.effects.land_value_effect = effects::RESIDENTIAL_LAND_VALUE + 5; // Better land value
        },
        
        // === COMMERCIAL BUILDINGS ===
        2001 => { // BANK
            metadata.base.width = base::MEDIUM.0;
            metadata.base.height = base::MEDIUM.1;
            metadata.capacity.employment_capacity = capacity::COMMERCIAL_EMPLOYMENT * 2; // Double employment
            metadata.economic.income = economic::COMMERCIAL_INCOME * 2; // Double income
            metadata.economic.maintenance_cost = economic::COMMERCIAL_MAINTENANCE * 2; // Double maintenance
            metadata.effects.land_value_effect = effects::COMMERCIAL_LAND_VALUE + 10; // Much better land value
        },
        2003 => { // CASINO
            metadata.base.width = base::MEDIUM.0;
            metadata.base.height = base::MEDIUM.1;
            metadata.economic.income = economic::COMMERCIAL_INCOME * 3; // Triple income
            metadata.effects.crime_effect = effects::COMMERCIAL_CRIME + 10; // Increased crime
            metadata.economic.happiness_effect = economic::COMMERCIAL_HAPPINESS * 2; // Double happiness
        },
        2005 => { // MALL
            metadata.base.width = base::LARGE.0;
            metadata.base.height = base::LARGE.1;
            metadata.capacity.employment_capacity = capacity::COMMERCIAL_EMPLOYMENT * 3; // Triple employment
            metadata.economic.income = economic::COMMERCIAL_INCOME * 25 / 10; // 2.5x income
            metadata.effects.traffic_effect = effects::COMMERCIAL_TRAFFIC * 2; // Double traffic
        },
        
        // === INDUSTRIAL BUILDINGS ===
        3002 => { // FACTORY
            metadata.effects.pollution_effect = effects::INDUSTRIAL_POLLUTION * 15 / 10; // 50% more pollution
            metadata.economic.income = economic::INDUSTRIAL_INCOME * 15 / 10; // 50% more income
        },
        3005 => { // REFINERY
            metadata.base.width = base::LARGE.0;
            metadata.base.height = base::LARGE.1;
            metadata.effects.pollution_effect = effects::INDUSTRIAL_POLLUTION * 2; // Double pollution
            metadata.economic.income = economic::INDUSTRIAL_INCOME * 2; // Double income
            metadata.capacity.employment_capacity = capacity::INDUSTRIAL_EMPLOYMENT * 15 / 10; // 50% more jobs
        },
        
        // === UTILITY BUILDINGS ===
        4001 => { // NUCLEAR_POWER_PLANT
            metadata.base.width = base::LARGE.0;
            metadata.base.height = base::LARGE.1;
            metadata.capacity.power_capacity = capacity::HUGE_POWER;
            metadata.base.build_cost = base::UTILITY_COST * 3; // Triple cost
            metadata.economic.maintenance_cost = economic::UTILITY_MAINTENANCE * 2; // Double maintenance
        },
        4002 => { // SOLAR_PANEL_HOUSE
            metadata.capacity.power_capacity = capacity::SMALL_POWER;
            metadata.base.build_cost = base::UTILITY_COST / 2; // Half cost
            metadata.economic.maintenance_cost = economic::UTILITY_MAINTENANCE / 2; // Half maintenance
            metadata.effects.pollution_effect = 0; // No pollution
        },
        
        // === PARK BUILDINGS ===
        5051 ... 5054 => { // GRASS types
            metadata.base.build_cost = base::PARK_COST / 2; // Half cost
            metadata.economic.maintenance_cost = economic::PARK_MAINTENANCE / 2; // Half maintenance
            metadata.effects.land_value_effect = effects::PARK_LAND_VALUE / 2; // Half land value effect
        },
        5102 => { // FOUNTAIN
            metadata.economic.maintenance_cost = economic::PARK_MAINTENANCE * 2; // Double maintenance
            metadata.effects.land_value_effect = effects::PARK_LAND_VALUE * 15 / 10; // 50% more land value effect
            metadata.economic.happiness_effect = economic::PARK_HAPPINESS * 12 / 10; // 20% more happiness
        },
        
        // === ROAD TYPES ===
        6001 | 6002 | 6003 | 6004 => { // Main road intersections
            metadata.base.build_cost = base::ROAD_COST * 2; // Double cost
            metadata.economic.maintenance_cost = economic::ROAD_MAINTENANCE * 15 / 10; // 50% more maintenance
        },
        6051 | 6052 | 6053 => { // Regular road intersections
            metadata.base.build_cost = base::ROAD_COST * 15 / 10; // 50% more cost
            metadata.economic.maintenance_cost = economic::ROAD_MAINTENANCE * 12 / 10; // 20% more maintenance
        },
        
        // === SPECIAL BUILDINGS ===
        7001 => { // TEMPLE_CHINA
        metadata.economic.happiness_effect = economic::SPECIAL_HAPPINESS * 15 / 10; // 50% more happiness
        metadata.effects.land_value_effect = effects::SPECIAL_LAND_VALUE * 12 / 10; // 20% more land value
        metadata.base.build_cost = base::SPECIAL_COST * 12 / 10; // 20% more cost
        metadata.effects.pollution_effect = 3; // Small amount of noise pollution from ceremonies
    },
    7002 => { // MUSEUM
        metadata.base.width = base::LARGE.0;
        metadata.base.height = base::LARGE.1;
        metadata.economic.income = economic::SPECIAL_INCOME * 15 / 10; // 50% more income
        metadata.capacity.employment_capacity = capacity::SPECIAL_EMPLOYMENT * 15 / 10; // 50% more jobs
        metadata.effects.land_value_effect = effects::SPECIAL_LAND_VALUE * 15 / 10; // 50% more land value
        metadata.effects.pollution_effect = 4; // Moderate noise pollution from visitors
    },
    7051 => { // STADIUM
        metadata.base.width = base::HUGE.0;
        metadata.base.height = base::HUGE.1;
        metadata.base.build_cost = base::SPECIAL_COST * 3; // Triple cost
        metadata.economic.income = economic::SPECIAL_INCOME * 5; // 5x income
        metadata.capacity.employment_capacity = capacity::SPECIAL_EMPLOYMENT * 3; // Triple jobs
        metadata.effects.traffic_effect = effects::SPECIAL_TRAFFIC * 3; // Triple traffic
        metadata.effects.pollution_effect = 15; // Significant noise pollution during events
    },
    7052 => { // TENT_CIRCUS_BIG
        metadata.base.width = base::LARGE.0;
        metadata.base.height = base::LARGE.1;
        metadata.economic.income = economic::SPECIAL_INCOME * 2; // Double income
        metadata.effects.pollution_effect = 12; // High noise from performances
        metadata.economic.happiness_effect = economic::SPECIAL_HAPPINESS * 2; // Double happiness
    },
    7053 => { // FERRIS_WHEEL
        metadata.base.width = base::MEDIUM.0;
        metadata.base.height = base::MEDIUM.1;
        metadata.economic.income = economic::SPECIAL_INCOME * 15 / 10; // 50% more income
        metadata.effects.pollution_effect = 8; // Moderate noise from operation and crowds
        metadata.economic.happiness_effect = economic::SPECIAL_HAPPINESS * 15 / 10; // 50% more happiness
    },
    7101 ... 7106 => { // SKYSCRAPERS
        // Adjust based on specific skyscraper size
        let size_factor = match resource_id {
            7102 => 3, // HUGE
            7103 => 25, // LARGE
            7104 => 2, // MEDIUM
            7105 => 15, // SMALL
            7106 => 1, // TINY
            _ => 2, // DEFAULT
        };
        
        metadata.base.width = if size_factor > 2 { base::LARGE.0 } else { base::MEDIUM.0 };
        metadata.base.height = if size_factor > 2 { base::LARGE.1 } else { base::MEDIUM.1 };
        metadata.base.build_cost = base::SPECIAL_COST * size_factor / 10;
        metadata.economic.income = economic::SPECIAL_INCOME * size_factor / 10;
        metadata.capacity.employment_capacity = capacity::SPECIAL_EMPLOYMENT * size_factor / 10;
        metadata.effects.land_value_effect = effects::SPECIAL_LAND_VALUE * size_factor / 10;
        
        // Noise pollution scales with skyscraper size
        metadata.effects.pollution_effect = 2 + (size_factor / 5); // Base noise + size-based bonus
    },

        // Default case - use the base metadata for the resource type
        _ => {}
    }
    
    metadata
}