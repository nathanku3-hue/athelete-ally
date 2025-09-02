#!/bin/bash

# mcp.sh - Master Control Program for the Vibe-Code Methodology
# Version 2.0 - Compatible with nested PRD structure.

# --- Configuration ---
set -e
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
FEATURE_BRANCH_PREFIX="feature/"
# Use the local, project-specific yq executable
YQ_CMD="./yq_windows_amd64.exe"

# --- Helper Functions ---
log_info() {
    echo -e "${BLUE}INFO: $1${NC}"
}

log_success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
}

log_error() {
    echo -e "${RED}ERROR: $1${NC}" >&2
    exit 1
}

# --- Core Functions ---

# Extracts feature details from the features.yaml file for a given ticket ID
get_user_story_details() {
    local ticket_id=$1
    # This query navigates the nested structure: epics -> user_stories
    $YQ_CMD ".epics[].user_stories[] | select(.id == \"$ticket_id\")" features.yaml
}

# Phase 1: Plan features for the given tickets
plan_features() {
    local tickets=$1
    log_info "Initiating PLANNING phase for tickets: $tickets"
    
    original_branch=$(git rev-parse --abbrev-ref HEAD)

    for ticket_id in $(echo $tickets | sed "s/,/ /g"); do
        log_info "Processing ticket: $ticket_id"
        local branch_name="${FEATURE_BRANCH_PREFIX}${ticket_id}"
        local feature_dir="features/${ticket_id}"
        
        # 1. Create or switch to a feature branch from the main branch
        git checkout main
        # git pull origin main # Temporarily commented out due to network issues
        if git rev-parse --verify "$branch_name" >/dev/null 2>&1;
 then
            git checkout "$branch_name"
        else
            git checkout -b "$branch_name"
        fi
        
        # 2. Create a directory for planning artifacts
        mkdir -p "$feature_dir"
        
        # 3. Get user story details from PRD
        user_story_details=$(get_user_story_details "$ticket_id")
        if [ -z "$user_story_details" ]; then
            log_error "No details found for ticket $ticket_id in features.yaml. Please check the ID."
        fi

        # 4. Use AI to generate the pre-build plan
        log_info "Generating pre-build plan for $ticket_id..."
        gemini prompt --context="You are a senior software engineer creating a technical plan. The project uses Next.js with App Router, TypeScript, Tailwind CSS, and Supabase."
        "Based on the following user story:\n\n---\n$user_story_details\n---\n\nCreate a detailed technical implementation plan in a markdown file named 'prebuild-planning.md'. The plan should specify:\n1. Which new files to create.\n2. Which existing files to modify.\n3. The core logic, components, and state management needed.\n4. Any necessary database schema changes or Supabase function calls." > "${feature_dir}/prebuild-planning.md"

        log_success "Draft plan created for $ticket_id at ${feature_dir}/prebuild-planning.md"
        log_info "Please review, edit, and approve this plan before the next step."
    done
    
    git checkout "$original_branch"
    log_success "Planning phase complete for all tickets."
}

# (The implement_features and finalize_features functions remain the same)
# Phase 2: Implement the approved plans
implement_features() {
    local tickets=$1
    log_info "Initiating IMPLEMENTATION phase for tickets: $tickets"

    for ticket_id in $(echo $tickets | sed "s/,/ /g"); do
        log_info "Processing ticket: $ticket_id"
        local branch_name="${FEATURE_BRANCH_PREFIX}${ticket_id}"
        local plan_file="features/${ticket_id}/prebuild-planning.md"

        git checkout "$branch_name"

        if [ ! -f "$plan_file" ]; then
            log_error "Planning file not found for $ticket_id at $plan_file. Run the 'execute --plan-first' command first."
        fi
        
        approved_plan=$(cat "$plan_file")
        user_story_details=$(get_user_story_details "$ticket_id")

        log_info "Generating first-draft code for $ticket_id..."
        gemini prompt --context="You are an AI code generator. Your task is to write a bash script that applies the changes described in a technical plan. The project uses Next.js, TypeScript, Tailwind CSS, and Supabase."
        "Here is the original user story:\n\n---\n$user_story_details\n---\n\nAnd here is the approved technical plan:\n\n---\n$approved_plan\n---\n\nGenerate a single bash script that creates/modifies the necessary files to implement this plan. Use 'cat <<EOF > path/to/file.tsx' for file content. The script should be executable and not require any user input." > "features/${ticket_id}/implement.sh"
        
        log_info "Applying generated code..."
        chmod +x "features/${ticket_id}/implement.sh"
        ./features/${ticket_id}/implement.sh

        log_success "First-draft code for $ticket_id has been generated. Please review and refine."
    done

    log_success "Implementation phase complete. Ready for human review."
}

# Phase 3: Finalize and create pull requests
finalize_features() {
    local tickets=$1
    log_info "Initiating FINALIZE phase for tickets: $tickets"

    for ticket_id in $(echo $tickets | sed "s/,/ /g"); do
        log_info "Processing ticket: $ticket_id"
        local branch_name="${FEATURE_BRANCH_PREFIX}${ticket_id}"

        git checkout "$branch_name"
        git add .

        if git diff --staged --quiet;
 then
            log_info "No changes to commit for $ticket_id. Skipping."
            continue
        fi

        log_info "Generating commit message for $ticket_id..."
        git_diff=$(git diff --staged)
        commit_message=$(gemini prompt "Generate a concise, conventional commit message (e.g., 'feat(scope): message') for the following git diff:\n\n$git_diff")

        log_info "Committing changes..."
        git commit -m "$commit_message"

        log_info "Pushing branch $branch_name..."
        git push --set-upstream origin "$branch_name"

        log_info "Creating Pull Request for $ticket_id..."
        gh pr create --title "$commit_message" --body "Closes #${ticket_id}. This PR was generated via the Vibe-Code methodology."
        
        log_success "Pull Request created for $ticket_id."
    done

    git checkout main
    log_success "Finalize phase complete. All PRs are ready for review on GitHub."
}


# --- Main Script Logic ---
main() {
    if [ $# -eq 0 ]; then
        log_error "No command provided. Usage: ./mcp.sh <command> --tickets <ticket_ids>"
        exit 1
    fi

    command=$1
    shift
    tickets=""
    plan_first=false

    while [ "$1" != "" ]; do
        case $1 in
            --tickets)
                shift
                tickets=$1
                ;;
            --plan-first)
                plan_first=true
                ;;            
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
        shift
    done

    if [ -z "$tickets" ]; then
        log_error "The --tickets flag is required. Example: --tickets US-001"
    fi

    case $command in
        execute)
            if [ "$plan_first" = true ]; then
                plan_features "$tickets"
            else
                log_error "The 'execute' command currently requires the '--plan-first' flag."
            fi
            ;;
        approve)
            implement_features "$tickets"
            ;;
        finalize)
            finalize_features "$tickets"
            ;;        
        *)
            log_error "Invalid command: $command. Available commands: execute, approve, finalize."
            ;;
    esac
}

main "$@"
