# Protocol Engine Architecture

## Core Concepts Overview

```mermaid
graph TB
    subgraph "Protocol Layer"
        P[Protocol]
        PT[ProtocolTemplate]
        PA[ProtocolAnalytics]
        PS[ProtocolShare]
    end
    
    subgraph "Block Layer"
        B[Block]
        BS[BlockSession]
        BP[BlockProgression]
    end
    
    subgraph "Execution Layer"
        PE[ProtocolExecution]
        BE[BlockExecution]
        SE[SessionExecution]
    end
    
    subgraph "User Layer"
        U[User]
        A[Adaptation]
    end
    
    P --> B
    B --> BS
    B --> BP
    P --> PT
    P --> PA
    P --> PS
    
    P --> PE
    B --> BE
    BS --> SE
    
    PE --> BE
    BE --> SE
    
    U --> PE
    U --> A
    A --> PE
    A --> BE
    A --> SE
```

## Protocol Hierarchy

```mermaid
graph TD
    subgraph "Protocol: 5/3/1"
        P1[Protocol: 5/3/1<br/>12 weeks, 4x/week]
        
        subgraph "Block 1: Base Building (Weeks 1-4)"
            B1[Block: Base Building<br/>Moderate Intensity, High Volume]
            S1[Session: Squat Day<br/>Monday]
            S2[Session: Bench Day<br/>Tuesday]
            S3[Session: Deadlift Day<br/>Thursday]
            S4[Session: Press Day<br/>Friday]
        end
        
        subgraph "Block 2: Strength Building (Weeks 5-8)"
            B2[Block: Strength Building<br/>High Intensity, Moderate Volume]
            S5[Session: Squat Day<br/>Monday]
            S6[Session: Bench Day<br/>Tuesday]
            S7[Session: Deadlift Day<br/>Thursday]
            S8[Session: Press Day<br/>Friday]
        end
        
        subgraph "Block 3: Peak Phase (Weeks 9-12)"
            B3[Block: Peak Phase<br/>Very High Intensity, Low Volume]
            S9[Session: Squat Day<br/>Monday]
            S10[Session: Bench Day<br/>Tuesday]
            S11[Session: Deadlift Day<br/>Thursday]
            S12[Session: Press Day<br/>Friday]
        end
    end
    
    P1 --> B1
    P1 --> B2
    P1 --> B3
    
    B1 --> S1
    B1 --> S2
    B1 --> S3
    B1 --> S4
    
    B2 --> S5
    B2 --> S6
    B2 --> S7
    B2 --> S8
    
    B3 --> S9
    B3 --> S10
    B3 --> S11
    B3 --> S12
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant PE as Protocol Engine
    participant DB as Database
    participant A as Analytics
    
    U->>PE: Create Protocol Execution
    PE->>DB: Store Execution
    PE->>U: Return Execution ID
    
    loop For each week
        U->>PE: Get current block/session
        PE->>DB: Query execution state
        PE->>U: Return session details
        
        U->>PE: Complete session
        PE->>DB: Update session execution
        PE->>A: Send performance data
        
        A->>A: Analyze performance
        A->>PE: Send adaptations
        PE->>DB: Apply adaptations
    end
    
    U->>PE: Complete protocol
    PE->>DB: Mark execution complete
    PE->>A: Generate final analytics
    A->>U: Send completion report
```

## Key Relationships

### Protocol → Block
- One-to-Many relationship
- Blocks define phases within a protocol
- Each block has a specific order and duration

### Block → BlockSession
- One-to-Many relationship
- Sessions define specific training days
- Each session has exercises and parameters

### Protocol → ProtocolExecution
- One-to-Many relationship
- Tracks user's execution of a protocol
- Contains user-specific adaptations

### Block → BlockExecution
- One-to-Many relationship
- Tracks execution of specific blocks
- Contains block-specific adaptations

### Session → SessionExecution
- One-to-Many relationship
- Tracks individual session completions
- Contains performance metrics

## Configuration Flexibility

### Block Parameters
```typescript
interface BlockParameters {
  intensityRange?: { min: number; max: number };
  volumeRange?: { min: number; max: number };
  rpeRange?: { min: number; max: number };
  exerciseCategories?: string[];
  movementPatterns?: string[];
  restDays?: number[];
  deloadFrequency?: number;
  custom?: Record<string, any>;
}
```

### Progression Rules
```typescript
interface BlockRules {
  progressionType?: 'linear' | 'double_progression' | 'percentage' | 'rpe_based';
  progressionRate?: number;
  deloadTriggers?: DeloadTrigger[];
  adaptationRules?: AdaptationRule[];
  custom?: Record<string, any>;
}
```

## Benefits

1. **Modularity**: Protocols are composed of reusable blocks
2. **Flexibility**: JSON-based parameters allow for complex configurations
3. **Adaptability**: Built-in adaptation system for personalized training
4. **Scalability**: Supports both simple and complex training methodologies
5. **Analytics**: Comprehensive tracking and analysis capabilities
6. **Collaboration**: Sharing and permission management
7. **Type Safety**: Full TypeScript support for development safety
