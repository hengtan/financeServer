# Claude Code Custom Agents

This directory contains specialized AI agents (slash commands) designed to help with different aspects of software development. All agents respond in **English**, regardless of the language of your request.

## 📋 Table of Contents

- [Planning Agent](#-planning-agent)
- [Specialist Agents](#-specialist-agents)
- [Orchestrator Agents](#-orchestrator-agents)
- [Code Review Agent](#-code-review-agent)
- [Usage Examples](#-usage-examples)
- [Best Practices](#-best-practices)
- [Important Rules](#-important-rules)

---

## 📝 Planning Agent

### `/planner`
Creates detailed development plans in `.md` files.

**When to use:**
- Starting a new feature
- Planning complex implementations
- Need to break down large tasks
- Want to track progress across teams

**What it does:**
- Analyzes your request (in any language)
- Creates a structured plan in `PLAN-<project-name>.md`
- Lists all items to be modified, added, removed, tested
- Provides acceptance criteria and priorities (P0/P1/P2)
- Tracks completion status

**Important:**
- ⛔ Never writes code - only plans and documents
- ⛔ Never makes git commits
- ✅ Always writes plans in English

**Example:**
```bash
/planner I need to add user authentication with JWT tokens
```

---

## 🎯 Specialist Agents

These agents have deep expertise in specific technologies.

### `/dotnet-expert`
.NET specialist with SOLID and Clean Architecture expertise.

**Expertise:**
- SOLID principles
- Clean Architecture patterns
- Modern .NET (6/7/8)
- Entity Framework Core
- Design patterns (Repository, CQRS, Mediator)
- Async/await best practices

**When to use:**
- Implementing .NET backend features
- Refactoring .NET code
- Need architectural guidance
- Want SOLID principles applied

### `/frontend-expert`
Frontend specialist in React, shadcn/ui, and Tailwind CSS.

**Expertise:**
- React (latest features, hooks, patterns)
- shadcn/ui component library
- Tailwind CSS utility-first approach
- TypeScript strong typing
- Performance optimization
- Accessibility (WCAG)

**When to use:**
- Building React components
- Implementing UI designs
- Need responsive layouts
- Want accessibility compliance

### `/nodejs-expert`
Node.js/Next.js backend specialist.

**Expertise:**
- Express, NestJS, Fastify
- Next.js API routes and server actions
- Authentication (JWT, OAuth)
- RESTful and GraphQL APIs
- Prisma, TypeORM, Mongoose
- Performance and security

**When to use:**
- Building Node.js APIs
- Implementing Next.js server features
- Need authentication setup
- Want API design guidance

### `/javascript-expert`
JavaScript/TypeScript full-stack master.

**Expertise:**
- Modern JavaScript (ES2015+)
- Advanced TypeScript patterns
- Frontend (React, Vue, Svelte)
- Backend (Node.js, Express, NestJS)
- Functional and OOP patterns
- Performance optimization

**When to use:**
- Need JavaScript/TypeScript expertise
- Want both frontend and backend knowledge
- Complex JavaScript patterns
- TypeScript type safety

### `/database-expert`
Database specialist for SQL, NoSQL, and optimization.

**Expertise:**
- SQL (PostgreSQL, MySQL, SQL Server, Oracle)
- NoSQL (MongoDB, Redis)
- Schema design and migrations
- Query optimization
- Indexing strategies
- Performance tuning

**When to use:**
- Designing database schemas
- Writing migrations
- Optimizing queries
- Need database architecture advice

---

## 🎼 Orchestrator Agents

These agents combine multiple specializations to deliver complete features.

### `/fullstack`
Complete end-to-end implementation (Frontend + Backend + Database).

**Combines:**
- Frontend (React, shadcn/ui, Tailwind)
- Backend (.NET, Clean Architecture)
- Database (SQL, schema design)

**Implementation Order:**
1. Database schema and migrations
2. Backend (entities, repositories, services, APIs)
3. Frontend (components, API integration, UI)
4. Integration testing

**When to use:**
- Building complete features from scratch
- Need full-stack implementation
- Want all layers integrated properly

**Example:**
```bash
/fullstack Create a product management system with CRUD operations
```

### `/backend`
Backend-only implementation (.NET + Database).

**Combines:**
- .NET development
- Database design and migrations
- API development

**Implementation Order:**
1. Database layer (schema, migrations)
2. Domain layer (entities, business rules)
3. Application layer (services, DTOs)
4. Infrastructure layer (repositories, EF Core)
5. API layer (controllers, endpoints)

**When to use:**
- Backend-only features
- API development
- Database changes with backend impact

**Example:**
```bash
/backend Implement order processing API with payment integration
```

### `/frontend`
Frontend-only implementation (React + shadcn/ui + Tailwind).

**Specializes in:**
- React components
- shadcn/ui integration
- Tailwind CSS styling
- API integration
- State management

**Implementation Order:**
1. API client/hooks setup
2. Base components (using shadcn/ui)
3. Custom components
4. Pages and layouts
5. Integration with backend

**When to use:**
- UI/UX implementation
- Frontend-only features
- Component library
- Styling and responsiveness

**Example:**
```bash
/frontend Create a dashboard with charts and data tables
```

---

## 🔍 Code Review Agent

### `/code-reviewer`
Expert code reviewer for MR/PR analysis.

**Reviews:**
- Code quality and SOLID principles
- Security vulnerabilities
- Performance issues
- Best practices compliance
- Test coverage
- Documentation

**Provides:**
- Comprehensive review report
- Prioritized issues (Critical → Low)
- Constructive feedback
- Improvement suggestions
- Positive feedback on good code

**When to use:**
- After implementing features
- Before merging PRs/MRs
- Want code quality feedback
- Need security review

**Example:**
```bash
/code-reviewer Review the authentication implementation
```

---

## 💡 Usage Examples

### Example 1: Planning and Building a Feature

```bash
# Step 1: Create a plan
/planner Add user profile management with avatar upload

# Step 2: Implement the feature
/fullstack Implement the user profile feature based on PLAN-user-profile.md

# Step 3: Review the code
/code-reviewer Review all user profile related changes
```

### Example 2: Backend-Only Feature

```bash
# Plan
/planner Add reporting API with data aggregation

# Implement backend
/backend Create reporting endpoints based on the plan

# Review
/code-reviewer Review the reporting API implementation
```

### Example 3: Frontend-Only Feature

```bash
# Plan
/planner Create a responsive navigation menu with user dropdown

# Implement frontend
/frontend Build the navigation menu component

# Review
/code-reviewer Review the navigation implementation
```

### Example 4: Using Specialists

```bash
# Get .NET expert help
/dotnet-expert Refactor this service to follow SOLID principles

# Get React expert help
/frontend-expert Optimize this component for performance

# Get database expert help
/database-expert Optimize this query that's causing slow page loads

# Get JavaScript expert help
/javascript-expert Improve this TypeScript type safety
```

---

## ✅ Best Practices

### 1. **Start with Planning**
Always use `/planner` for complex features to create a structured plan.

### 2. **Choose the Right Agent**
- **Full feature?** → `/fullstack`
- **Backend only?** → `/backend`
- **Frontend only?** → `/frontend`
- **Specific expertise?** → Use specialist agents
- **Code review?** → `/code-reviewer`

### 3. **Follow the Workflow**
```
Plan → Implement → Review
```

### 4. **Use Specialists for Guidance**
When you need deep expertise or want to learn best practices, use specialist agents.

### 5. **Review Before Merging**
Always use `/code-reviewer` before creating PRs/MRs.

### 6. **Reference the Plan**
When implementing, mention the plan file:
```bash
/fullstack Implement feature X based on PLAN-feature-x.md
```

---

## ⚠️ Important Rules

### All Agents Follow These Rules:

1. **⛔ NEVER make git commits**
   - Agents only implement code
   - You control when to commit

2. **⛔ NEVER push to remote**
   - You decide when to push

3. **✅ Always analyze existing code first**
   - Agents study your patterns
   - Follow your conventions

4. **✅ Always respond in English**
   - Even if you ask in Portuguese or any other language
   - Plans and documentation are in English

5. **✅ Explain their decisions**
   - Agents provide reasoning
   - Learn while they implement

### Planner Specific Rules:

- ⛔ **NEVER writes code** - only plans
- ✅ Creates structured `.md` files
- ✅ Tracks completion status

### Orchestrators vs Specialists:

**Orchestrators** (fullstack, backend, frontend):
- Implement complete features
- Combine multiple technologies
- Follow implementation order

**Specialists** (dotnet-expert, frontend-expert, etc.):
- Provide deep expertise
- Give architectural guidance
- Suggest best practices
- Great for learning

---

## 🎓 Learning from Agents

All agents are **didactic** - they explain their decisions:

- **Why** certain patterns are used
- **How** different layers interact
- **What** best practices apply
- **When** to use specific approaches

Use this as a learning opportunity to improve your skills!

---

## 🤝 Contributing

If you create new agents or improve existing ones:

1. Follow the existing structure
2. Add clear descriptions
3. Update this README
4. Include usage examples

---

## 📞 Support

If an agent isn't working as expected:

1. Check your request is clear
2. Verify the agent's expertise matches your need
3. Try being more specific
4. Reference existing code or plans

---

**Remember:** These agents are your development team - use them wisely! 🚀
