import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import type { Conversation, PublicUser } from '../common/types/chat';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  list(@CurrentUser() user: PublicUser): { conversations: Conversation[] } {
    return { conversations: this.conversationsService.listForUser(user.id) };
  }

  @Post()
  create(
    @CurrentUser() user: PublicUser,
    @Body() dto: CreateConversationDto,
  ): { conversation: Conversation } {
    return { conversation: this.conversationsService.create(user.id, dto) };
  }
}
