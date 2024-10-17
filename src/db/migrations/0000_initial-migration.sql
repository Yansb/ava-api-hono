CREATE TABLE IF NOT EXISTS "cursos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar NOT NULL,
	"universidadeId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" varchar NOT NULL,
	"discente" varchar NOT NULL,
	"orientador" varchar NOT NULL,
	"resumo" varchar NOT NULL,
	"palavrasChave" jsonb NOT NULL,
	"ano_defesa" integer NOT NULL,
	"cursoId" uuid NOT NULL,
	"arquivoId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documentos_topics" (
	"documentoId" uuid NOT NULL,
	"topicoId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "documentos_topics_documentoId_topicoId_pk" PRIMARY KEY("documentoId","topicoId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "arquivos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" varchar NOT NULL,
	"nome" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "topicos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "universidades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cursos" ADD CONSTRAINT "cursos_universidadeId_universidades_id_fk" FOREIGN KEY ("universidadeId") REFERENCES "public"."universidades"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documentos" ADD CONSTRAINT "documentos_cursoId_cursos_id_fk" FOREIGN KEY ("cursoId") REFERENCES "public"."cursos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documentos" ADD CONSTRAINT "documentos_arquivoId_arquivos_id_fk" FOREIGN KEY ("arquivoId") REFERENCES "public"."arquivos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documentos_topics" ADD CONSTRAINT "documentos_topics_documentoId_documentos_id_fk" FOREIGN KEY ("documentoId") REFERENCES "public"."documentos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documentos_topics" ADD CONSTRAINT "documentos_topics_topicoId_topicos_id_fk" FOREIGN KEY ("topicoId") REFERENCES "public"."topicos"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
