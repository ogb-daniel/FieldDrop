data "external_schema" "prisma" {
  program = [
    "npx",
    "prisma",
    "migrate",
    "diff",
    "--from-empty",
    "--to-schema",
    "prisma/schema.prisma",
    "--script",
  ]
}

data "composite_schema" "combined" {
  // Order matters: Load extensions first so tables can use them
  schema "public" {
    url = "file://prisma/schema.sql"
  }
  schema "public" {
    url = data.external_schema.prisma.url
  }
}

env "local" {
  // Ensure your dev database image supports PostGIS (e.g., postgis/postgis)
  dev = "postgres://postgres:password@localhost:5432/atlas_dev?search_path=public&sslmode=disable" 
  
  schema {
    src = data.composite_schema.combined.url
  }
}