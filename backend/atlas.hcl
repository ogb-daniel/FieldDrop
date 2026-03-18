data "external_schema" "prisma" {
 program = [
    "sh",
    "-c",
    "npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script | grep -vE '^(postgresql://|Loaded Prisma config)'"
  ]
}


env "local" {
  // Ensure your dev database image supports PostGIS (e.g., postgis/postgis)
  dev = "postgres://postgres:password@localhost:5432/atlas_dev?search_path=public&sslmode=disable" 
  
  schema {
    src = data.external_schema.prisma.url
  }
}