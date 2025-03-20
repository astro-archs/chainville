use starknet::ContractAddress;

#[starknet::interface]
pub trait IVille<TContractState> {
    fn spawn_game( ref self: TContractState,
        name: felt252
    ) -> u32;
    fn create( ref self: TContractState,
        game_id: u32,
        city_id: u32,
        city_name: felt252,
        player_name: felt252,
        x: u32,
        y: u32
    ) -> u32;
    fn transfer(ref self: TContractState, game_id: u32, new_admin: ContractAddress);

    fn update_game_economy(
        ref self: TContractState,
        game_id: u32, 
        tax_rate: u16, 
        inflation: u16, 
        volatility: u16,
        tariff: u16
    );
}

// System implementation

#[dojo::contract]
mod ville {
    // Starknet imports

    use dojo::world::IWorldDispatcherTrait;
    use super::{IVille};

    use starknet::{
        ContractAddress, get_caller_address, get_contract_address, get_block_timestamp
    };

    use chainville::models::game::{Game, GameTrait};
    use chainville::models::mayor::{Mayor, MayorTrait};
    use chainville::models::city::{City,CityTrait,Coordinates};
    //use chainville::utils::helper::{HelperTrait};

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
    pub impl VilleImpl of IVille<ContractState> {
        fn spawn_game(
            ref self: ContractState,
            name: felt252,
        ) -> u32 {

            let mut world = self.world_default();
          
            let caller = get_caller_address();
            
            // [Effect] Game
            let game_id = world.dispatcher.uuid();
            
            let mut game: Game = GameTrait::new(
                game_id: game_id,admin:caller, world_name: name
            );

            let _: u32 = game.add_builder().into();

            //set!(world, (game));

            world.write_model(@game);

           // [Return] Game id
            game_id
        }
        fn create(
            ref self: ContractState,
            game_id: u32,
            city_id: u32,
            city_name: felt252,
            player_name: felt252,
            x: u32,
            y: u32
        ) -> u32 {

            let mut world = self.world_default();
          
            let caller = get_caller_address();

            let mut game: Game = world.read_model(game_id);
            
            // [Effect] Game
            let city_id = world.dispatcher.uuid();

            let coordinates: Coordinates = Coordinates { x: x, y: y};
            
            let mut city: City = CityTrait::new(
                game_id: game_id,city_id: city_id,owner: caller, name: city_name, coordinates: coordinates, is_capital: false
            );

            game.add_city();


            let mut mayor: Mayor = MayorTrait::new(
                game_id: game_id, player: caller, name: player_name
            );

            game.add_builder();

            let _: u8 = mayor.cities_founded();
        
            //set!(world, (game));

            world.write_model(@game);

            world.write_model(@mayor);


            world.write_model(@city);

            // [Return] Game id
            city_id
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

        fn update_game_economy(
            ref self: ContractState,
            game_id: u32, 
            tax_rate: u16, 
            inflation: u16, 
            volatility: u16,
            tariff: u16
        ){
            let mut world = self.world_default();

            let mut game: Game  = world.read_model(game_id);

            let caller = get_caller_address();

            game.update_economy(tax_rate,inflation,volatility,tariff,caller);
            
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
