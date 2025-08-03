use anchor_lang::prelude::*;

declare_id!("F1NwUJXRYaQ68NreZrFDnHinhi1JkcVVhNz6gjC2SKwP");

#[program]
pub mod clash_vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
