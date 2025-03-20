use starknet::ContractAddress;
use chainville::models::grid::{DistrictType};

#[starknet::interface]
pub trait IVilleBuild<TContractState> {
    fn create_grid( ref self: TContractState,
        game_id: u32,
        city_id: u32,
        row: u16,
        col: u16,
    ) -> u32;
    fn create_district( ref self: TContractState,
        game_id: u32,
        city_id: u32,
        grid_id: u32,
        grid_x: u32,
        grid_y: u32,
        grid_z: u32,
        name: felt252,
        district_type: DistrictType,
        row: u16,
        col: u16,
    ) -> u32;
    fn create_cell( ref self: TContractState,
        game_id: u32,
        grid_id: u32,
        district_id: u32,
        x: u32,
        y: u32,
        z: u32,
        row: u16,
        col: u16,
    ) -> u32;
    fn transfer(ref self: TContractState, game_id: u32, new_admin: ContractAddress);
    fn leave(ref self: TContractState, game_id: u32);
    fn start(ref self: TContractState, game_id: u32, round_count: u32);
    fn delete(ref self: TContractState, game_id: u32);
    fn kick(ref self: TContractState, game_id: u32, index: u32);
}

// System implementation

#[dojo::contract]
mod villebuild {
    // Starknet imports

    use dojo::world::IWorldDispatcherTrait;
    use super::{IVilleBuild};

    use starknet::{
        ContractAddress, get_caller_address, get_contract_address, get_block_timestamp
    };

    use chainville::models::game::{Game, GameTrait};
    use chainville::models::mayor::{Mayor, MayorTrait};
    use chainville::models::city::{City,CityTrait,Coordinates};
    use chainville::models::grid::{Grid,GridTrait,GridPosition, GridPositionTrait,District,DistrictTrait,DistrictType,Cell,CellTrait,DistrictPosition,CellPosition};
    //use chainville::utils::helper::{HelperTrait};
    use chainville::constants::{DISTRICT_COUNT};

    use dojo::model::{ModelStorage, ModelValueStorage};
    use dojo::event::EventStorage;

    pub mod errors {
        pub const ERC20_REWARD_FAILED: felt252 = 'ERC20: reward failed';
        pub const ERC20_PAY_FAILED: felt252 = 'ERC20: pay failed';
        pub const ERC20_REFUND_FAILED: felt252 = 'ERC20: refund failed';
        pub const HOST_PLAYER_ALREADY_IN_LOBBY: felt252 = 'Host: player already in lobby';
        pub const HOST_PLAYER_NOT_IN_LOBBY: felt252 = 'Host: player not in lobby';
        pub const HOST_CALLER_IS_NOT_THE_HOST: felt252 = 'Host: caller is not the arena';
        pub const HOST_MAX_NB_PLAYERS_IS_TOO_LOW: felt252 = 'Host: max player numbers is < 2';
        pub const HOST_GAME_NOT_OVER: felt252 = 'Host: game not over';
    }


    #[abi(embed_v0)]
    pub impl VilleBuildImpl of IVilleBuild<ContractState> {
        fn create_grid(
            ref self: ContractState,
            game_id: u32,
            city_id: u32,
            row: u16,
            col: u16,
        ) -> u32 {

            let mut world = self.world_default();
          
            let caller = get_caller_address();


            let city: City = world.read_model((game_id,city_id,caller));

            assert(city.active,'City Not Active');

            assert(city.district_count <= DISTRICT_COUNT, 'Maximum Districts Reached ');
   
            let mayor: Mayor = world.read_model((game_id,caller));

            assert(mayor.active, 'Mayor not active');
            
            // [Effect] Game
            let grid_id = world.dispatcher.uuid();

            let grid_position =  GridPosition { row: row, col: col};

            assert(grid_position.validate_position(),'Invalid Position');
            
            let mut grid: Grid = GridTrait::new(
                game_id: game_id, grid_id: grid_id, city_id: city_id, caller: caller, grid_position: grid_position
            );
            //set!(world, (game));

            world.write_model(@grid);

           // [Return] Game id
            grid_id
        }

        fn create_district(
            ref self: ContractState,
            game_id: u32,
            city_id: u32,
            grid_id: u32,
            grid_x: u32,
            grid_y: u32,
            grid_z: u32,
            name: felt252,
            district_type: DistrictType,
            row: u16,
            col: u16
        ) -> u32 {

            let mut world = self.world_default();
          
            let caller = get_caller_address();

            let mut game: Game = world.read_model(game_id);
            
            // [Effect] Game
            let district_id = world.dispatcher.uuid();

            let mut city: City = world.read_model((game_id,city_id,caller));

            assert(city.active,'City Not Active');

            assert(city.district_count <= DISTRICT_COUNT, 'Maximum Districts Reached ');


            let grid: Grid = world.read_model((game_id,grid_id,city_id,caller));

            assert(grid.is_initialized, 'Grid: Not initialized');

            let district_position = DistrictPosition {
                row: row, col: col
            };

            let district:  District = DistrictTrait::new(
                game_id: game_id, 
                district_id: district_id, 
                grid_id: grid_id,
                grid_x: grid_x,
                grid_y:grid_y, 
                grid_z:grid_z,
                name: name, 
                district_type: district_type,
                owner: caller, 
                district_position: district_position
            );

            city.district_count += 1;

            
            world.write_model(@game);

            world.write_model(@district);

            world.write_model(@city);

            // [Return] Game id
            district_id
        }

        fn create_cell(
            ref self: ContractState,
            game_id: u32,
            grid_id: u32,
            district_id: u32,
            x: u32,
            y: u32,
            z: u32,
            row: u16,
            col: u16,
        ) -> u32 {

            let mut world = self.world_default();
          
            let caller = get_caller_address();

            let mut game: Game = world.read_model(game_id);
            
            // [Effect] Game
            let cell_id = world.dispatcher.uuid();


            let mut district: District = world.read_model((game_id,district_id,grid_id,caller));

            assert(!district.is_locked, 'District locked');

            assert(district.check_total_cells_occupied(),'Total cells reached');

            let cell_position: CellPosition = CellPosition {
                row: row,
                col:col
            };


            let cell:  Cell = CellTrait::new(
                game_id: game_id, 
                district_id: district_id,
                cell_id:cell_id, 
                grid_x: x,
                grid_y:y, 
                grid_z:z,
                owner: caller, 
                cell_position: cell_position
            );

            let _: u32 = district.total_cells();

            
            world.write_model(@game);

            world.write_model(@district);

            world.write_model(@cell);

            // [Return] Game id
            cell_id
        }

        fn transfer(ref self: ContractState, game_id: u32, new_admin: ContractAddress) {

            // [Check] Caller is the host
           // let mut game = get!(world, game_id, Game);
            let mut world = self.world_default();

            let mut game: Game  = world.read_model(game_id);

            let caller = get_caller_address();

            game.transfer_admin(new_admin,caller);
            
            //set!(world,(game));
            world.write_model(@game);
        }



    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Use the default namespace "chainville". This function is handy since the ByteArray
        /// can't be const.
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"chainville")
        }

    }

}
