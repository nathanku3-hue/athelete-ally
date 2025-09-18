# Protocol Engine Types

This package contains TypeScript types for the Protocol Engine's core concepts: **Protocol** and **Block**.

## Core Concepts

### Protocol
A **Protocol** represents a complete training methodology or system. Examples include:
- "5/3/1" - Jim Wendler's strength program
- "Starting Strength" - Mark Rippetoe's beginner program
- "Westside Conjugate" - Powerlifting methodology
- "DUP" (Daily Undulating Periodization)

### Block
A **Block** represents a specific phase or period within a Protocol. Examples include:
- "Base Building" - Foundation phase
- "Peak Phase" - Competition preparation
- "Deload Week" - Recovery phase
- "Strength Block" - Strength-focused period

## Key Features

### Protocol Features
- **Categorization**: Strength, hypertrophy, powerlifting, bodybuilding, etc.
- **Difficulty Levels**: Beginner, intermediate, advanced, elite
- **Flexible Configuration**: JSON-based parameters for maximum flexibility
- **Templates**: Pre-configured protocols for common use cases
- **Sharing**: Public/private protocols with permission management

### Block Features
- **Phase Management**: Base, build, peak, deload, transition phases
- **Intensity/Volume Control**: Configurable intensity and volume levels
- **Progression Rules**: Linear, double progression, percentage-based, RPE-based
- **Session Management**: Detailed session planning within blocks
- **Adaptation Support**: Dynamic adjustments based on performance

### Execution Features
- **Real-time Tracking**: Track protocol execution progress
- **Adaptation Engine**: Automatic and manual adaptations
- **Performance Analytics**: Comprehensive metrics and insights
- **Collaboration**: Share protocols and collaborate on executions

## Usage

```typescript
import { Protocol, Block, ProtocolExecution } from '@athlete-ally/protocol-types';

// Create a new protocol
const protocol: Protocol = {
  id: 'protocol-123',
  name: '5/3/1',
  version: '1.0.0',
  category: 'strength',
  difficulty: 'intermediate',
  duration: 12,
  frequency: 4,
  // ... other properties
};

// Create a block within the protocol
const block: Block = {
  id: 'block-123',
  protocolId: 'protocol-123',
  name: 'Base Building',
  phase: 'base',
  intensity: 'moderate',
  volume: 'high',
  duration: 4,
  // ... other properties
};

// Execute the protocol
const execution: ProtocolExecution = {
  id: 'execution-123',
  protocolId: 'protocol-123',
  userId: 'user-123',
  status: 'active',
  startDate: new Date(),
  // ... other properties
};
```

## Database Schema

The Prisma schema is located in `services/protocol-engine/prisma/schema.prisma` and includes:

- **Protocols**: Main protocol definitions
- **Blocks**: Protocol phases/blocks
- **BlockSessions**: Individual training sessions
- **BlockProgressions**: Week-by-week progressions
- **ProtocolExecutions**: User protocol executions
- **BlockExecutions**: Block-specific executions
- **SessionExecutions**: Individual session executions
- **ProtocolAnalytics**: Performance analytics
- **ProtocolShares**: Sharing and collaboration

## Type Safety

All types are fully typed with TypeScript, providing:
- Compile-time type checking
- IntelliSense support
- Refactoring safety
- Documentation through types

## Contributing

When adding new types or modifying existing ones:

1. Update the TypeScript interfaces in `src/index.ts`
2. Update the Prisma schema in `services/protocol-engine/prisma/schema.prisma`
3. Ensure type consistency between both
4. Update this README if adding new concepts
5. Add appropriate JSDoc comments for complex types
