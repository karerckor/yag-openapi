/**
 * Test fixtures for OpenAPI schemas and expected outputs.
 */

export const simpleOpenAPISchema = {
  "openapi": "3.0.0",
  "info": {
    "title": "Simple API",
    "version": "1.0.0"
  },
  "paths": {
    "/users": {
      "get": {
        "responses": {
          "200": {
            "description": "List of users",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "string" },
                      "name": { "type": "string" },
                      "email": { "type": "string" }
                    },
                    "required": ["id", "name", "email"]
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "email": { "type": "string" }
                },
                "required": ["name", "email"]
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Created user",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": { "type": "string" },
                    "name": { "type": "string" },
                    "email": { "type": "string" }
                  },
                  "required": ["id", "name", "email"]
                }
              }
            }
          }
        }
      }
    },
    "/users/{id}": {
      "get": {
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "string" }
          }
        ],
        "responses": {
          "200": {
            "description": "User details",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": { "type": "string" },
                    "name": { "type": "string" },
                    "email": { "type": "string" }
                  },
                  "required": ["id", "name", "email"]
                }
              }
            }
          },
          "404": {
            "description": "User not found"
          }
        }
      }
    }
  }
};

export const complexOpenAPISchema = {
  "openapi": "3.0.0",
  "info": {
    "title": "Complex API",
    "version": "2.0.0",
    "description": "A more complex API with various features"
  },
  "paths": {
    "/posts": {
      "get": {
        "parameters": [
          {
            "name": "limit",
            "in": "query",
            "schema": { "type": "integer", "minimum": 1, "maximum": 100 }
          },
          {
            "name": "offset",
            "in": "query",
            "schema": { "type": "integer", "minimum": 0 }
          }
        ],
        "responses": {
          "200": {
            "description": "List of posts",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "posts": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": { "type": "string" },
                          "title": { "type": "string" },
                          "content": { "type": "string" },
                          "authorId": { "type": "string" }
                        },
                        "required": ["id", "title", "content", "authorId"]
                      }
                    },
                    "total": { "type": "integer" },
                    "hasMore": { "type": "boolean" }
                  },
                  "required": ["posts", "total", "hasMore"]
                }
              }
            }
          }
        }
      }
    },
    "/posts/{postId}/comments": {
      "get": {
        "parameters": [
          {
            "name": "postId",
            "in": "path",
            "required": true,
            "schema": { "type": "string" }
          }
        ],
        "responses": {
          "200": {
            "description": "Comments for the post",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "string" },
                      "content": { "type": "string" },
                      "authorId": { "type": "string" },
                      "createdAt": { "type": "string", "format": "date-time" }
                    },
                    "required": ["id", "content", "authorId", "createdAt"]
                  }
                }
              }
            }
          },
          "404": {
            "description": "Post not found"
          }
        }
      },
      "post": {
        "parameters": [
          {
            "name": "postId",
            "in": "path",
            "required": true,
            "schema": { "type": "string" }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "content": { "type": "string" },
                  "authorId": { "type": "string" }
                },
                "required": ["content", "authorId"]
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Comment created",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": { "type": "string" },
                    "content": { "type": "string" },
                    "authorId": { "type": "string" },
                    "createdAt": { "type": "string", "format": "date-time" }
                  },
                  "required": ["id", "content", "authorId", "createdAt"]
                }
              }
            }
          }
        }
      }
    }
  }
};

export const invalidOpenAPISchema = {
  "openapi": "3.0.0",
  "info": {
    "title": "Invalid API"
    // Missing version - this should cause validation errors
  },
  "paths": {}
};
