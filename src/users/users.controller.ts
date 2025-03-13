import { Controller, Get } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('users')
export class UsersController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async getUsers() {
    try {
      const users = await this.supabaseService.getUsers();
      return { data: users };
    } catch (error) {
      return { message: 'Error fetching users', error: error.message };
    }
  }
}