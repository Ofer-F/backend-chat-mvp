import { Module } from '@nestjs/common';
import { StoreModule } from '../store/store.module';
import { ConversationsController } from './conversations.controller';
import { MessagesController } from './messages.controller';
import { ConversationsService } from './conversations.service';
import { MessagesService } from './messages.service';

@Module({
  imports: [StoreModule],
  controllers: [ConversationsController, MessagesController],
  providers: [ConversationsService, MessagesService],
})
export class ConversationsModule {}
