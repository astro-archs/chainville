/// Industrial simulation factors
#[derive(Copy, Drop, Serde, Debug)]
pub struct IndustrialFactors {
    pub pollution_factor: u16,         // How much pollution per industrial unit
    pub job_factor: u16,               // Jobs per industrial unit
    pub traffic_factor: u16,           // Traffic per industrial unit
}

/// Commercial simulation factors
#[derive(Copy, Drop, Serde, Debug)]
pub struct CommercialFactors {
    pub job_factor: u16,               // Jobs per commercial unit
    pub traffic_factor: u16,           // Traffic per commercial unit
    pub happiness_factor: u16,         // Happiness from commercial services
}

/// Residential simulation factors
#[derive(Copy, Drop, Serde, Debug)]
pub struct ResidentialFactors {
    pub pop_factor: u16,               // Population per residential unit
    pub traffic_factor: u16,           // Traffic per residential unit
}

/// Utility simulation factors
#[derive(Copy, Drop, Serde, Debug)]
pub struct UtilityFactors {
    pub water_factor: u16,             // Water provided per utility unit
    pub power_factor: u16,             // Power provided per utility unit
    pub pollution_factor: u16,         // Pollution per utility unit
}

/// Park simulation factors
#[derive(Copy, Drop, Serde, Debug)]
pub struct ParkFactors {
    pub happiness_factor: u16,         // Happiness from parks
    pub land_value_factor: u16,        // Land value increase from parks
    pub pollution_reduction: u16,      // Pollution reduction from parks
}

/// Road simulation factors
#[derive(Copy, Drop, Serde, Debug)]
pub struct RoadFactors {
    pub capacity_factor: u16,          // Traffic capacity per road unit
}

/// Ideal balance ratios
#[derive(Copy, Drop, Serde, Debug)]
pub struct BalanceFactors {
    pub ideal_res_com_ratio: u16,      // Ideal residential/commercial ratio
    pub ideal_res_ind_ratio: u16,      // Ideal residential/industrial ratio
    pub ideal_park_density: u16,       // Ideal park density
}

/// Problem threshold values
#[derive(Copy, Drop, Serde, Debug)]
pub struct ProblemThresholds {
    pub traffic_congestion_threshold: u16,     // % of capacity that causes congestion
    pub water_shortage_threshold: u16,         // % of capacity that causes shortage
    pub power_shortage_threshold: u16,         // % of capacity that causes blackouts
    pub unemployment_threshold: u8,            // % unemployment that causes problems
    pub housing_shortage_threshold: u8,        // % housing capacity that causes problems
    pub crime_wave_threshold: u16,             // Crime level that triggers crime wave
}

/// Cell requirements for different zone types
#[derive(Copy, Drop, Serde, Debug)]
pub struct CellRequirements {
    pub cells_per_residential: u8,             // Min cells per residential unit
    pub cells_per_commercial: u8,              // Min cells per commercial unit
    pub cells_per_industrial: u8,              // Min cells per industrial unit
    pub cells_per_utility: u8,                 // Min cells per utility unit
    pub cells_per_park: u8,                    // Min cells per park
}

/// Mathematical coefficients for simulation
/// These define the relationships between different resources and effects
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct SimulationCoefficients {
    #[key]
    pub game_id: u32,
    
    // Modularized coefficient groups
    pub industrial: IndustrialFactors,
    pub commercial: CommercialFactors,
    pub residential: ResidentialFactors,
    pub utilities: UtilityFactors,
    pub parks: ParkFactors,
    pub roads: RoadFactors,
    pub balance: BalanceFactors,
    pub thresholds: ProblemThresholds,
    pub cell_requirements: CellRequirements,
    
    // Last update timestamp
    pub last_update: u64,
}