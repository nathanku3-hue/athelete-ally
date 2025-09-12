# Protocol Engine Design - Initial Draft

## Executive Summary

As Lead Backend Architect, I present the initial draft of Prisma schemas for the core new concepts: **Protocol** and **Block**. This design introduces a flexible, modular system for managing complex training methodologies while maintaining type safety and scalability.

## Core Concepts

### 1. Protocol
A **Protocol** represents a complete training methodology or system (e.g., "5/3/1", "Starting Strength", "Westside Conjugate"). It serves as the top-level container for all training logic.

**Key Features:**
- Categorization (strength, hypertrophy, powerlifting, etc.)
- Difficulty levels (beginner to elite)
- Flexible JSON-based configuration
- Template system for common variations
- Sharing and collaboration capabilities

### 2. Block
A **Block** represents a specific phase or period within a Protocol (e.g., "Base Building", "Peak Phase", "Deload Week"). Blocks provide the structural foundation for periodization.

**Key Features:**
- Phase management (base, build, peak, deload, transition)
- Intensity and volume control
- Progression rules (linear, percentage-based, RPE-based)
- Session management within blocks
- Adaptation support

## Database Schema Overview

### Core Tables

1. **Protocols** - Main protocol definitions
2. **Blocks** - Protocol phases/blocks
3. **BlockSessions** - Individual training sessions
4. **BlockProgressions** - Week-by-week progressions
5. **ProtocolExecutions** - User protocol executions
6. **BlockExecutions** - Block-specific executions
7. **SessionExecutions** - Individual session executions

### Supporting Tables

8. **ProtocolTemplates** - Pre-configured protocols
9. **ProtocolAnalytics** - Performance analytics
10. **ProtocolShares** - Sharing and collaboration
11. **BlockProgressions** - Progression rules and triggers

## Key Design Decisions

### 1. JSON Flexibility
- Used JSON fields for complex configurations
- Allows for protocol-specific parameters without schema changes
- Maintains type safety through TypeScript interfaces

### 2. Hierarchical Structure
```
Protocol
├── Block 1 (Base Building)
│   ├── Session 1 (Squat Day)
│   ├── Session 2 (Bench Day)
│   └── Session 3 (Deadlift Day)
├── Block 2 (Strength Building)
│   └── ...
└── Block 3 (Peak Phase)
    └── ...
```

### 3. Execution Tracking
- Separate execution tables for each level
- Tracks progress and adaptations
- Supports real-time monitoring

### 4. Adaptation System
- Built-in adaptation rules and triggers
- Supports both automatic and manual adaptations
- Tracks adaptation history

## TypeScript Integration

### Type Safety
- Full TypeScript support for all database models
- Compile-time type checking
- IntelliSense support for development

### Package Structure
```
packages/protocol-types/
├── src/index.ts          # Main type definitions
├── examples/             # Usage examples
├── docs/                 # Documentation
└── package.json          # Package configuration
```

## Example Implementation

### 5/3/1 Protocol
- **Protocol**: 12-week strength program
- **Block 1**: Base Building (4 weeks, moderate intensity, high volume)
- **Block 2**: Strength Building (4 weeks, high intensity, moderate volume)
- **Block 3**: Peak Phase (4 weeks, very high intensity, low volume)
- **Sessions**: 4 sessions per week (Squat, Bench, Deadlift, Press)

### Configuration Example
```typescript
const protocol531: Protocol = {
  name: '5/3/1',
  category: 'strength',
  difficulty: 'intermediate',
  duration: 12,
  frequency: 4,
  blocks: [
    {
      name: 'Base Building',
      phase: 'base',
      intensity: 'moderate',
      volume: 'high',
      duration: 4,
      sessions: [/* ... */]
    }
  ]
};
```

## Benefits

### 1. Modularity
- Protocols are composed of reusable blocks
- Easy to create variations and modifications
- Supports complex periodization schemes

### 2. Flexibility
- JSON-based parameters allow for protocol-specific configurations
- No schema changes needed for new protocol types
- Supports both simple and complex methodologies

### 3. Scalability
- Hierarchical structure supports large, complex protocols
- Efficient querying with proper indexing
- Supports high-volume usage

### 4. Adaptability
- Built-in adaptation system
- Real-time progress tracking
- Performance-based adjustments

### 5. Collaboration
- Protocol sharing and permission management
- Template system for common variations
- Analytics and insights sharing

## Next Steps

1. **Review and Feedback** - Team review of the initial design
2. **Refinement** - Incorporate feedback and make adjustments
3. **Implementation** - Begin development of the Protocol Engine service
4. **Testing** - Comprehensive testing of the schema and types
5. **Integration** - Integration with existing services

## Files Created

1. `services/protocol-engine/prisma/schema.prisma` - Database schema
2. `packages/protocol-types/src/index.ts` - TypeScript types
3. `packages/protocol-types/package.json` - Package configuration
4. `packages/protocol-types/tsconfig.json` - TypeScript configuration
5. `packages/protocol-types/README.md` - Documentation
6. `packages/protocol-types/examples/531-protocol.ts` - Usage example
7. `packages/protocol-types/docs/architecture.md` - Architecture documentation

This design provides a solid foundation for the Protocol Engine while maintaining flexibility for future enhancements and modifications.
