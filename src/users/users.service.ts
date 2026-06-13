import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { InMemoryStore } from '../store/in-memory.store';
import type { PublicUser, User } from '../common/types/chat';

const BCRYPT_SALT_ROUNDS = 10;

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly store: InMemoryStore) {}

  findById(id: string): User | undefined {
    return this.store.users.get(id);
  }

  findByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return [...this.store.users.values()].find(
      (user) => user.email.trim().toLowerCase() === normalized,
    );
  }

  async create(input: CreateUserInput): Promise<User> {
    const email = input.email.trim().toLowerCase();

    if (this.findByEmail(email)) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);
    const now = new Date().toISOString();
    const user: User = {
      id: `u-${randomUUID()}`,
      name: input.name.trim(),
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    this.store.users.set(user.id, user);
    return user;
  }

  toPublic(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
