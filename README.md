# StudyHub MCP Server

A hands-on **Model Context Protocol (MCP)** learning project built with Node.js and TypeScript.

The goal of this project is to understand MCP by implementing a complete working system with:

- MCP Server
- MCP Client
- AI Host
- Tools
- Resources
- Resource Templates
- Prompts
- Input validation
- Persistent JSON storage
- MCP Inspector
- Gemini function calling
- LLM → MCP → LLM tool execution

---

## Architecture

```text
User
  ↓
Gemini 3.5 Flash
  ↓
AI Host (host.ts)
  ↓
MCP Client
  ↓
MCP over stdio
  ↓
StudyHub MCP Server
  │
  ├── Tools
  ├── Resources
  └── Prompts
  ↓
Local JSON Storage
```

---

## Core MCP Concepts

### MCP Server

The MCP server exposes capabilities that MCP clients can discover and use.

Main server:

```text
src/index.ts
```

---

### MCP Client

The MCP client connects to the server through `stdio`.

It can:

- Discover tools
- Call tools
- Read resources
- Get prompts

Custom MCP client:

```text
src/client.ts
```

---

### AI Host

The AI host combines:

- Gemini
- MCP Client
- StudyHub MCP Server

The model decides which MCP tool should be used based on the user's request.

Host file:

```text
src/host.ts
```

Example flow:

```text
User asks:
"Find my study notes about MCP"

        ↓

Gemini selects:
search-study-notes

        ↓

MCP Client calls the tool

        ↓

StudyHub MCP Server

        ↓

notes.json

        ↓

Tool result returned to Gemini

        ↓

Gemini generates the final answer
```

---

# MCP Tools

## 1. add-study-note

Adds a new study note to StudyHub.

Example arguments:

```json
{
  "topic": "MCP",
  "content": "MCP connects AI applications with external tools and data."
}
```

The tool validates the input and saves the note to persistent JSON storage.

---

## 2. list-study-notes

Lists all persisted study notes.

This tool reads data from:

```text
data/notes.json
```

---

## 3. search-study-notes

Searches saved study notes using a keyword.

Example:

```json
{
  "query": "MCP"
}
```

The tool searches both the topic and content fields.

---

## 4. create-study-task

Creates a new study task.

Example:

```json
{
  "title": "Review MCP tools, resources, and prompts"
}
```

A new task is created with:

```json
{
  "id": 1,
  "title": "Review MCP tools, resources, and prompts",
  "completed": false
}
```

---

## 5. list-open-tasks

Returns all incomplete study tasks.

Only tasks where:

```text
completed = false
```

are returned.

---

## 6. complete-study-task

Marks a study task as completed.

Example:

```json
{
  "id": 1
}
```

The task state changes from:

```text
completed: false
```

to:

```text
completed: true
```

---

# MCP Resources

Resources expose data that MCP clients can read.

## All Study Notes

URI:

```text
study://notes/all
```

This resource returns all persisted study notes.

---

## Open Study Tasks

URI:

```text
study://tasks/open
```

This resource returns all incomplete study tasks.

---

# Resource Template

The project also implements a dynamic MCP Resource Template.

```text
study://notes/topic/{topic}
```

Example:

```text
study://notes/topic/MCP%20Persistence
```

The `{topic}` value is dynamically extracted from the URI.

The server then searches the stored notes and returns matching notes.

Example flow:

```text
resources/read
      ↓
study://notes/topic/MCP%20Persistence
      ↓
Resource Template
      ↓
topic = "MCP Persistence"
      ↓
notes.json
      ↓
matching notes
```

---

# MCP Prompt

## review-topic

The project exposes a reusable MCP prompt called:

```text
review-topic
```

Argument:

```text
topic
```

Example:

```text
MCP Server
```

The server generates a structured revision prompt asking for:

1. The core concept
2. Why it is used
3. The main components
4. One practical example
5. Three questions to test understanding

Important:

```text
MCP Prompt ≠ AI Response
```

The MCP server creates the reusable prompt template.

The LLM generates the actual answer.

---

# Input Validation

The project uses **Zod** for tool input validation.

Example:

```ts
z.string().min(1)
```

This prevents invalid input from reaching the tool handler.

For example, if the required `topic` field is missing:

```json
{
  "content": "Testing validation"
}
```

the MCP server rejects the request before executing the tool logic.

---

# Persistence

StudyHub uses local JSON files for persistence.

```text
data/
├── notes.json
└── tasks.json
```

Originally, the project stored notes only in memory.

```text
Server starts
    ↓
notes = []
    ↓
note added
    ↓
server stops
    ↓
data lost
```

After adding JSON persistence:

```text
MCP Tool
    ↓
Storage Layer
    ↓
JSON File
    ↓
Server restart
    ↓
Data still exists
```

This demonstrates an important concept:

```text
MCP ≠ Database
```

MCP provides communication between systems.

The application decides how data is stored.

---

# Project Structure

```text
studyhub-mcp/
│
├── data/
│   ├── notes.json
│   └── tasks.json
│
├── src/
│   ├── index.ts
│   ├── client.ts
│   ├── host.ts
│   ├── storage.ts
│   ├── resources.ts
│   └── prompts.ts
│
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

# Technologies Used

- Node.js
- TypeScript
- Model Context Protocol
- `@modelcontextprotocol/server`
- `@modelcontextprotocol/client`
- Zod
- MCP Inspector
- Google Gemini
- `@google/genai`
- JSON persistence
- Git
- GitHub

---

# Installation

Clone the repository:

```bash
git clone https://github.com/GaneshPokharel-tech/studyhub-mcp.git
```

Enter the project:

```bash
cd studyhub-mcp
```

Install dependencies:

```bash
npm install
```

---

# TypeScript Validation

Run:

```bash
npx tsc --noEmit
```

If there is no output, the TypeScript check passed.

---

# Run the MCP Server

```bash
npx tsx src/index.ts
```

Expected output:

```text
StudyHub MCP server running on stdio
```

The server then waits for an MCP client connection.

---

# MCP Inspector

The MCP Inspector was used to inspect and test the server.

## List Tools

```bash
npx @modelcontextprotocol/inspector --cli npx tsx src/index.ts --method tools/list
```

---

## Call a Tool

Example:

```bash
npx @modelcontextprotocol/inspector --cli npx tsx src/index.ts --method tools/call --tool-name search-study-notes --tool-arg query="MCP"
```

---

## List Resources

```bash
npx @modelcontextprotocol/inspector --cli npx tsx src/index.ts --method resources/list
```

---

## Read a Resource

```bash
npx @modelcontextprotocol/inspector --cli npx tsx src/index.ts --method resources/read --uri study://notes/all
```

---

## List Resource Templates

```bash
npx @modelcontextprotocol/inspector --cli npx tsx src/index.ts --method resources/templates/list
```

---

## Read a Dynamic Resource

```bash
npx @modelcontextprotocol/inspector --cli npx tsx src/index.ts --method resources/read --uri "study://notes/topic/MCP%20Persistence"
```

---

## List Prompts

```bash
npx @modelcontextprotocol/inspector --cli npx tsx src/index.ts --method prompts/list
```

---

## Get a Prompt

```bash
npx @modelcontextprotocol/inspector --cli npx tsx src/index.ts --method prompts/get --prompt-name review-topic --prompt-args topic="MCP Server"
```

---

# Custom MCP Client

The project includes its own MCP client:

```text
src/client.ts
```

Run it with:

```bash
npx tsx src/client.ts
```

The custom client demonstrates that the MCP Inspector is not required to communicate with an MCP server.

A normal application can create an MCP client and communicate with the server directly.

---

# AI Host with Gemini

The project also contains an AI host:

```text
src/host.ts
```

The host connects:

```text
Gemini
   ↓
MCP Client
   ↓
StudyHub MCP Server
```

Gemini receives the available MCP tools and decides which one should be used.

---

## Gemini API Key

Create a Gemini API key using Google AI Studio.

Do not store the key directly in the source code.

Set it in the current terminal session:

```bash
read -s "GEMINI_API_KEY?Paste Gemini API key: "; export GEMINI_API_KEY; echo
```

Verify that it exists:

```bash
if [ -n "$GEMINI_API_KEY" ]; then echo "GEMINI_API_KEY is set"; else echo "GEMINI_API_KEY is NOT set"; fi
```

Never commit API keys to GitHub.

---

# Run the AI Host

```bash
npx tsx src/host.ts
```

Example output:

```text
StudyHub MCP server running on stdio

Gemini selected MCP tool: search-study-notes
Arguments: {"query":"MCP"}
MCP tool executed successfully.

Gemini final answer:

I found the following study note about MCP:

MCP Persistence:
This note should remain even after the MCP server process stops.
```

---

# Complete AI + MCP Flow

```text
User
  ↓
Gemini
  ↓
Model analyzes request
  ↓
Model selects MCP tool
  ↓
AI Host
  ↓
MCP Client
  ↓
MCP Protocol
  ↓
StudyHub MCP Server
  ↓
Tool Handler
  ↓
JSON Storage
  ↓
Tool Result
  ↓
MCP Client
  ↓
AI Host
  ↓
Gemini
  ↓
Final Natural-Language Answer
```

---

# Tool Discovery

The AI host does not need the StudyHub tools hard-coded individually.

The MCP client asks the server:

```text
tools/list
```

The server returns its available tools and their schemas.

For example:

```text
add-study-note
list-study-notes
search-study-notes
create-study-task
list-open-tasks
complete-study-task
```

These schemas are then converted into Gemini-compatible function definitions.

This allows the model to decide which tool should be used.

---

# Tool vs Resource

A Tool and Resource may access the same underlying data, but their MCP roles are different.

Example:

```text
list-open-tasks
```

is a Tool.

```text
study://tasks/open
```

is a Resource.

Conceptually:

```text
Tool
→ Perform or request an operation

Resource
→ Provide data or context
```

---

# Prompt vs AI Response

```text
MCP Prompt
→ reusable instruction template

LLM
→ generates the actual response
```

The MCP server does not automatically become an AI model simply because it exposes prompts.

---

# Host vs Client vs Server

## Host

The complete AI application.

It may contain:

- User interface
- LLM
- MCP clients
- Application logic

Example in this project:

```text
src/host.ts
```

---

## MCP Client

Maintains a connection to an MCP server and communicates using the MCP protocol.

Example:

```text
src/client.ts
```

---

## MCP Server

Exposes capabilities such as:

```text
Tools
Resources
Prompts
```

Example:

```text
src/index.ts
```

---

# stdio Transport

This project uses `stdio` transport.

```text
MCP Client
    │
    │ stdin / stdout
    ▼
MCP Server
```

The MCP client starts the local server as a child process.

Protocol messages are exchanged through standard input and output.

For this reason, normal server logs are written using:

```ts
console.error()
```

instead of:

```ts
console.log()
```

because stdout is used by the MCP protocol.

---

# Key Learning Outcomes

By building this project, the following MCP concepts were implemented practically:

- Creating an MCP server
- Using stdio transport
- Registering MCP tools
- Tool discovery with `tools/list`
- Calling tools with `tools/call`
- Defining tool input schemas
- Runtime input validation
- Persistent storage
- Registering resources
- Reading resources
- Creating dynamic Resource Templates
- Registering prompts
- Retrieving prompts
- Creating a custom MCP client
- Understanding MCP initialization and discovery
- Connecting an LLM to MCP
- Mapping MCP tools to LLM function tools
- Letting the LLM select tools
- Executing the selected MCP tool
- Returning MCP results to the LLM
- Generating a final natural-language answer

---

# Main Lesson

MCP does not replace APIs, databases, or AI models.

It provides a standardized protocol that allows AI applications to discover and communicate with external capabilities.

Instead of creating a different custom integration for every AI application:

```text
AI Application A → Custom Integration A
AI Application B → Custom Integration B
AI Application C → Custom Integration C
```

an MCP server can expose a standardized interface:

```text
                 ┌── AI Application A
                 │
MCP Server ──────┼── AI Application B
                 │
                 └── AI Application C
```

This project demonstrates that architecture from a basic local MCP server all the way to an LLM-powered tool-calling workflow.