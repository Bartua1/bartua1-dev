import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client connecting to the database
const prisma = new PrismaClient();

// Initialize the MCP server
const server = new McpServer({
  name: "bartua1-dev-blog",
  version: "1.0.0",
});

// Helper to handle errors cleanly and output logging safely to console.error
const handleErrors = (error: unknown, context: string) => {
  const errMsg = error instanceof Error ? error.message : String(error);
  console.error(`[MCP Error] ${context}:`, error);
  return {
    content: [{ type: "text" as const, text: `Error ${context}: ${errMsg}` }],
    isError: true,
  };
};

// 1. Tool: List posts
server.tool(
  "list_posts",
  "Returns a summary list of all blog posts in the database, including their title, slug, published status, and creation date.",
  {},
  async () => {
    try {
      const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          titleEs: true,
          titleEn: true,
          published: true,
          topic: true,
          views: true,
          createdAt: true,
        },
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(posts, null, 2) }],
      };
    } catch (err) {
      return handleErrors(err, "listing posts");
    }
  }
);

// 2. Tool: Get post
server.tool(
  "get_post",
  "Retrieves the complete details (both Spanish and English title and markdown content) of a single post by its unique slug.",
  {
    slug: z.string().describe("The slug/URL identifier of the post"),
  },
  async ({ slug }) => {
    try {
      const post = await prisma.post.findUnique({
        where: { slug },
      });

      if (!post) {
        return {
          content: [{ type: "text" as const, text: `Post not found with slug: "${slug}"` }],
          isError: true,
        };
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify(post, null, 2) }],
      };
    } catch (err) {
      return handleErrors(err, `retrieving post with slug "${slug}"`);
    }
  }
);

// 3. Tool: Create post
server.tool(
  "create_post",
  "Creates a new blog post in the database. Returns the created post object.",
  {
    slug: z.string().describe("The slug/URL identifier (e.g. 'my-new-post')"),
    titleEs: z.string().describe("The title in Spanish"),
    titleEn: z.string().optional().describe("The title in English (defaults to Spanish title)"),
    contentEs: z.string().describe("The markdown content in Spanish"),
    contentEn: z.string().optional().describe("The markdown content in English (defaults to Spanish content)"),
    topic: z.string().optional().describe("Comma-separated topics (e.g. 'phone-development,home-labbing')"),
    published: z.boolean().optional().describe("Whether the post should be published immediately (default: true)"),
  },
  async ({ slug, titleEs, titleEn, contentEs, contentEn, topic, published }) => {
    try {
      // Check unique slug
      const existing = await prisma.post.findUnique({
        where: { slug },
      });
      if (existing) {
        return {
          content: [{ type: "text" as const, text: `Error: A post with slug "${slug}" already exists.` }],
          isError: true,
        };
      }

      const post = await prisma.post.create({
        data: {
          slug,
          titleEs,
          titleEn: titleEn || titleEs,
          contentEs,
          contentEn: contentEn || contentEs,
          topic: topic || "others",
          published: published !== undefined ? published : true,
        },
      });

      return {
        content: [
          { type: "text" as const, text: `Post created successfully:\n${JSON.stringify(post, null, 2)}` },
        ],
      };
    } catch (err) {
      return handleErrors(err, "creating post");
    }
  }
);

// 4. Tool: Update post
server.tool(
  "update_post",
  "Updates fields of an existing blog post in the database. Returns the updated post object.",
  {
    id: z.string().describe("The unique ID of the post to update"),
    slug: z.string().optional().describe("The updated slug/URL identifier"),
    titleEs: z.string().optional().describe("The updated title in Spanish"),
    titleEn: z.string().optional().describe("The updated title in English"),
    contentEs: z.string().optional().describe("The updated markdown content in Spanish"),
    contentEn: z.string().optional().describe("The updated markdown content in English"),
    topic: z.string().optional().describe("Updated comma-separated topics"),
    published: z.boolean().optional().describe("Updated publication status"),
  },
  async ({ id, slug, titleEs, titleEn, contentEs, contentEn, topic, published }) => {
    try {
      // Check if post exists
      const existing = await prisma.post.findUnique({
        where: { id },
      });
      if (!existing) {
        return {
          content: [{ type: "text" as const, text: `Error: Post with ID "${id}" not found.` }],
          isError: true,
        };
      }

      // Check unique slug if slug is being updated
      if (slug && slug !== existing.slug) {
        const duplicate = await prisma.post.findUnique({
          where: { slug },
        });
        if (duplicate) {
          return {
            content: [{ type: "text" as const, text: `Error: A post with slug "${slug}" already exists.` }],
            isError: true,
          };
        }
      }

      const updateData: {
        slug?: string;
        titleEs?: string;
        titleEn?: string;
        contentEs?: string;
        contentEn?: string;
        topic?: string;
        published?: boolean;
      } = {};

      if (slug !== undefined) updateData.slug = slug;
      if (titleEs !== undefined) updateData.titleEs = titleEs;
      if (titleEn !== undefined) updateData.titleEn = titleEn;
      if (contentEs !== undefined) updateData.contentEs = contentEs;
      if (contentEn !== undefined) updateData.contentEn = contentEn;
      if (topic !== undefined) updateData.topic = topic;
      if (published !== undefined) updateData.published = published;

      const post = await prisma.post.update({
        where: { id },
        data: updateData,
      });

      return {
        content: [
          { type: "text" as const, text: `Post updated successfully:\n${JSON.stringify(post, null, 2)}` },
        ],
      };
    } catch (err) {
      return handleErrors(err, `updating post with ID "${id}"`);
    }
  }
);

// 5. Tool: Delete post
server.tool(
  "delete_post",
  "Deletes a blog post by its unique ID.",
  {
    id: z.string().describe("The unique ID of the post to delete"),
  },
  async ({ id }) => {
    try {
      // Check if post exists
      const existing = await prisma.post.findUnique({
        where: { id },
      });
      if (!existing) {
        return {
          content: [{ type: "text" as const, text: `Error: Post with ID "${id}" not found.` }],
          isError: true,
        };
      }

      await prisma.post.delete({
        where: { id },
      });

      return {
        content: [{ type: "text" as const, text: `Post with ID "${id}" ("${existing.titleEs}") deleted successfully.` }],
      };
    } catch (err) {
      return handleErrors(err, `deleting post with ID "${id}"`);
    }
  }
);

// Start the server using Stdio transport (JSON-RPC over stdin/stdout)
const runServer = async () => {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[MCP Server] bartua1-dev-blog server is running on stdio transport");
  } catch (err) {
    console.error("[MCP Server] Failed to start:", err);
    process.exit(1);
  }
};

runServer();
