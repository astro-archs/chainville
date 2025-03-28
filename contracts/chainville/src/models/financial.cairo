/// Tax rate configuration
#[derive(Copy, Drop, Serde, Debug)]
pub struct TaxRates {
    pub residential_tax_rate: u8,      // Tax rate for residential zones (0-100%)
    pub commercial_tax_rate: u8,       // Tax rate for commercial zones (0-100%)
    pub industrial_tax_rate: u8,       // Tax rate for industrial zones (0-100%)
}

/// Budget allocation percentages
#[derive(Copy, Drop, Serde, Debug)]
pub struct BudgetAllocations {
    pub public_safety_allocation: u8,  // % allocated to safety (policing, fire)
    pub infrastructure_allocation: u8, // % allocated to infrastructure maintenance
    pub services_allocation: u8,       // % allocated to public services
    pub parks_allocation: u8,          // % allocated to parks & recreation
}

/// Income sources breakdown
#[derive(Copy, Drop, Serde, Debug)]
pub struct IncomeBreakdown {
    pub residential_tax_income: u64,   // Income from residential taxes
    pub commercial_tax_income: u64,    // Income from commercial taxes
    pub industrial_tax_income: u64,    // Income from industrial taxes
    pub special_income: u64,           // Income from special buildings
    pub loan_income: u64,              // Income from loans
}

/// Expense breakdown
#[derive(Copy, Drop, Serde, Debug)]
pub struct ExpenseBreakdown {
    pub infrastructure_expense: u64,   // Road/utility maintenance
    pub services_expense: u64,         // Public services running costs
    pub loan_payments: u64,            // Loan repayments
    pub disaster_recovery: u64,        // Costs for fixing problems
}

/// Loan information
#[derive(Copy, Drop, Serde, Debug)]
pub struct LoanInfo {
    pub active_loans: u8,              // Number of active loans
    pub total_debt: u64,               // Total outstanding debt
    pub interest_rate: u8,             // Current interest rate (%)
    pub max_loan_amount: u64,          // Maximum available loan amount
    pub credit_rating: u8,             // City's credit rating (0-100)
}

/// City treasury and financial management
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct CityTreasury {
    #[key]
    pub game_id: u32,
    
    // Current financial state
    pub gold_balance: u64,             // Current gold/money available
    pub hourly_income: u64,            // Total hourly income
    pub hourly_expenses: u64,          // Total hourly expenses
    
    // Financial components
    pub tax_rates: TaxRates,
    pub budget: BudgetAllocations,
    pub income: IncomeBreakdown,
    pub expenses: ExpenseBreakdown,
    pub loans: LoanInfo,
    
    // Financial history tracking
    pub bankruptcy_count: u8,          // Number of times gone bankrupt
    pub last_gold_change: i64,         // Last change to gold balance (+/-)
    pub total_income_all_time: u64,    // Total income across game
    pub total_expenses_all_time: u64,  // Total expenses across game
    
    // Last update timestamp
    pub last_update: u64,
}